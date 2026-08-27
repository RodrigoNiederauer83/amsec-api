import { Request, RequestHandler, Response } from "express";
import { prisma } from "../prisma/client";
import { generateDraw } from "../utils/drawAlgorithm";
import { emailService } from "../services";
import { env } from "../config/env";

import crypto from "crypto";

const INVITE_EXPIRATION_DAYS = 7;

export async function createGroup(req: Request, res: Response) {
  const { name } = req.body;
  const ownerId = req.userId!; // diz ao typescript que não vai ser undefined

  try {
    // Escopo transacional
    // Faz a criação do Group e do Owner como GroupMember juntos, se falhar as duas são desfeitas;
    const group = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: { name, ownerId },
      });

      await tx.groupMember.create({
        data: { groupId: newGroup.id, userId: ownerId },
      });

      return newGroup;
    });

    return res.status(201).json({
      id: group.id,
      name: group.name,
      ownerId: group.ownerId,
    });
  } catch (error: any) {
    // "P2002" código que o Prisma usa especificamente para violação de restrição @@unique
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Você já tem um grupo com este nome." });
    }

    throw error;
  }
}

export const createInvite: RequestHandler = async (req, res) => {
  const userId = req.userId!;
  const group = req.group!;
  const groupId = group.id;

  if (group.ownerId !== userId) {
    return res.status(403).json({ error: "Apenas o responsável pelo grupo pode gerar convites." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

  const invite = await prisma.groupInvite.upsert({
    where: { groupId },
    update: { token, expiresAt },
    create: { groupId, token, expiresAt },
  });

  return res.status(200).json({
    token: invite.token,
    expiresAt: invite.expiresAt,
  });
}

export const getInvitePreview: RequestHandler = async (req, res) => {
  const { token } = req.params;

  if (typeof token !== "string") {
    return res.status(400).json({ error: "Token inválido." });
  }

  const invite = await prisma.groupInvite.findUnique({
    where: { token },
    include: {
      group: {
        include: {
          owner: { select: { id: true, name: true } },
          members: { include: { user: { select: { id: true, name: true } } } },
        },
      },
    },
  });

  if (!invite) {
    return res.status(404).json({ error: "Convite não encontrado." });
  }

  if (invite.expiresAt < new Date()) {
    return res.status(410).json({ error: "Este convite expirou." });
  }

  return res.status(200).json({
    groupId: invite.group.id,
    groupName: invite.group.name,
    owner: invite.group.owner,
    members: invite.group.members.map((m) => m.user),
  });
};

export const joinGroupViaInvite: RequestHandler = async (req, res) => {
  const { token } = req.params;
  const userId = req.userId!;

  if (typeof token !== "string") {
    return res.status(400).json({ error: "Token inválido." });
  }

  const invite = await prisma.groupInvite.findUnique({
    where: { token },
  });

  if (!invite) {
    return res.status(404).json({ error: "Convite não encontrado." });
  }

  if (invite.expiresAt < new Date()) {
    return res.status(410).json({ error: "Este convite expirou." });
  }

  const alreadyMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: invite.groupId,
        userId,
      },
    },
  });

  if (alreadyMember) {
    return res.status(409).json({ error: "Você já é membro deste grupo." });
  }

  const membership = await prisma.groupMember.create({
    data: { groupId: invite.groupId, userId },
  });

  return res.status(201).json({
    groupId: membership.groupId,
    message: "Você entrou no grupo com sucesso.",
  });
};

export const searchGroups: RequestHandler = async (req, res) => {
  const userId = req.userId!;
  const ownerQuery = req.query.owner;
  const nameQuery = req.query.name;

  const groups = await prisma.group.findMany({
    where: {
      members: { some: { userId } },
      ...(typeof nameQuery === "string" && { name: { contains: nameQuery } }),
      ...(typeof ownerQuery === "string" && { owner: { name: { contains: ownerQuery } } }),
    },
    include: {
      owner: { select: { id: true, name: true } },
      members: { select: { id: true } },
      _count: { select: { assignments: true } },
    },
  });

  return res.status(200).json(
    groups.map((g) => ({
      id: g.id,
      name: g.name,
      owner: g.owner,
      eventDate: g.eventDate,
      minGiftCents: g.minGiftCents,
      maxGiftCents: g.maxGiftCents,
      eventAddress: g.eventAddress,
      eventLat: g.eventLat,
      eventLng: g.eventLng,
      members: g.members,
      hasDraw: g._count.assignments > 0,
    }))
  );
};

export const getGroupDetail: RequestHandler = async (req, res) => {
  const groupId = Number(req.params.id);
  const userId = req.userId!;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      owner: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true, avatarUrl: true, isDependent: true, guardianId: true } } } },
      _count: { select: { assignments: true } },
    },
  });

  if (!group) {
    return res.status(404).json({ error: "Grupo não encontrado." });
  }

  const isMember = group.members.some((m) => m.userId === userId);

  if (!isMember) {
    return res.status(403).json({ error: "Você não faz parte deste grupo." });
  }

  const suggestionCounts = await prisma.giftSuggestion.groupBy({
    by: ["userId"],
    where: { groupId },
    _count: { id: true },
  });
  const countMap = new Map(suggestionCounts.map((s) => [s.userId, s._count.id]));

  return res.status(200).json({
    id: group.id,
    name: group.name,
    owner: group.owner,
    members: group.members.map((m) => ({
      ...m.user,
      suggestionsCount: countMap.get(m.user.id) ?? 0,
    })),
    hasDraw: group._count.assignments > 0,
    eventDate: group.eventDate,
    minGiftCents: group.minGiftCents,
    maxGiftCents: group.maxGiftCents,
  });
};

export const updateGroupSettings: RequestHandler = async (req, res) => {
  const group = req.group!;
  const groupId = group.id;
  const requesterId = req.userId!;
  const { name, eventDate, minGiftCents, maxGiftCents, eventAddress, eventLat, eventLng } = req.body;

  if (group.ownerId !== requesterId) {
    return res.status(403).json({ error: "Apenas o responsável pode alterar as configurações." });
  }

  const finalMin = minGiftCents !== undefined ? minGiftCents : group.minGiftCents;
  const finalMax = maxGiftCents !== undefined ? maxGiftCents : group.maxGiftCents;

  if (finalMin !== null && finalMax !== null && finalMin > finalMax) {
    return res.status(422).json({ error: "O valor mínimo não pode ser maior que o valor máximo." });
  }

  const finalLat = eventLat ?? group.eventLat;
  const finalLng = eventLng ?? group.eventLng;

  if ((finalLat === null) !== (finalLng === null)) {
    return res.status(422).json({ error: "Latitude e longitude precisam ser fornecidas juntas." });
  }

  try {
    const updated = await prisma.group.update({
      where: { id: groupId },
      data: {
        ...(name !== undefined && { name }),
        ...(eventDate !== undefined && { eventDate: new Date(eventDate) }),
        ...(minGiftCents !== undefined && { minGiftCents }),
        ...(maxGiftCents !== undefined && { maxGiftCents }),
        ...(eventAddress !== undefined && { eventAddress }),
        ...(eventLat !== undefined && { eventLat }),
        ...(eventLng !== undefined && { eventLng }),
      },
    });

    return res.status(200).json({
      name: updated.name,
      eventDate: updated.eventDate,
      minGiftCents: updated.minGiftCents,
      maxGiftCents: updated.maxGiftCents,
      eventAddress: updated.eventAddress,
      eventLat: updated.eventLat,
      eventLng: updated.eventLng,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Você já tem outro grupo com este nome." });
    }
    throw error;
  }
};

export const createExclusion: RequestHandler = async (req, res) => {
  const group = req.group!;
  const groupId = group.id;
  const requesterId = req.userId!;
  const { userAId, userBId } = req.body;

  if (group.ownerId !== requesterId) {
    return res.status(403).json({ error: "Apenas o responsável pode gerenciar exclusões." });
  }

  const members = await prisma.groupMember.findMany({
    where: { groupId, userId: { in: [userAId, userBId] } },
  });

  if (members.length !== 2) {
    return res.status(422).json({ error: "Ambos os usuários precisam ser membros do grupo." })
  }

  const memberCount = await prisma.groupMember.count({ where: { groupId } });
  const maxExclusions = Math.min(3, Math.max(1, Math.floor(memberCount * 0.10)));

  const [countA, countB] = await Promise.all([
    prisma.groupExclusion.count({
      where: { groupId, OR: [{ userAId }, { userBId: userAId }] },
    }),
    prisma.groupExclusion.count({
      where: { groupId, OR: [{ userAId: userBId }, { userBId }] },
    }),
  ]);

  if (countA >= maxExclusions || countB >= maxExclusions) {
    return res.status(422).json({
      error: `Cada membro pode participar de no máximo ${maxExclusions} exclusões neste grupo.`,
    });
  }

  const { userAId: normA, userBId: normB } = normalizePair(userAId, userBId);

  try {
    const exclusion = await prisma.groupExclusion.create({
      data: { groupId, userAId: normA, userBId: normB },
      include: {
        userA: { select: { id: true, name: true } },
        userB: { select: { id: true, name: true } },
      }
    });

    return res.status(201).json(exclusion);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Essa exclusão já existe." });
    }
    throw error;
  }
}

export const listExclusions: RequestHandler = async (req, res) => {
  const groupId = Number(req.params.id);
  const requesterId = req.userId!;

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: requesterId } },
  });

  if (!membership) {
    return res.status(403).json({ error: "Você não faz parte deste grupo." });
  }

  const exclusions = await prisma.groupExclusion.findMany({
    where: { groupId },
    include: {
      userA: { select: { id: true, name: true } },
      userB: { select: { id: true, name: true } },
    },
  });

  return res.status(200).json(exclusions);
}

export const deleteExclusion: RequestHandler = async (req, res) => {
  const exclusionId = Number(req.params.exclusionId);
  const requesterId = req.userId!;
  const group = req.group!;

  if (group.ownerId !== requesterId) {
    return res.status(403).json({ error: "Apenas o responsável pode gerenciar exclusões." });
  }

  const exclusion = await prisma.groupExclusion.findUnique({
    where: { id: exclusionId },
  });

  if (!exclusion || exclusion.id !== exclusionId) {
    return res.status(404).json({ error: "Exclusão não encontrada." });
  }

  await prisma.groupExclusion.delete({
    where: { id: exclusionId },
  });

  return res.status(204).send();
}

export const drawGroup: RequestHandler = async (req, res) => {
  const groupId = Number(req.params.id);
  const requesterId = req.userId!;
  const force = req.query.force === "true";
  const group = req.group!;

  if (group.ownerId !== requesterId) {
    return res.status(403).json({ error: "Apenas o responsável pode realizar o sorteio." });
  }

  if (!group.eventDate) {
    return res.status(422).json({
      error: "É necessário cadastrar a data do evento antes de realizar o sorteio. Use PATCH /groups/:id/settings.",
    });
  }

  const existingAssignments = await prisma.assignment.findMany({ where: { groupId } });
  const alreadyViewed = existingAssignments.some((a) => a.viewedAt !== null);

  if (alreadyViewed && !force) {
    return res.status(409).json({
      error: "O sorteio já foi visualizado por algum participante. Use ?force=true para refazer mesmo assim.",
    });
  }

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: { select: { id: true, email: true, isDependent: true } } },
  });
  const memberIds = members.map((m) => m.userId);

  if (memberIds.length < 3) {
    return res.status(422).json({ error: "É necessário pelo menos 3 membros para realiza o sorteio." });
  }

  const exclusions = await prisma.groupExclusion.findMany({ where: { groupId } });

  const result = generateDraw(memberIds, exclusions);

  if (!result) {
    return res.status(422).json({
      error: "Não foi possível gerar um sorteio válido com as exclusões atuais.",
    });
  }

  await prisma.$transaction([
    prisma.assignment.deleteMany({ where: { groupId } }),
    prisma.assignment.createMany({
      data: Array.from(result.entries()).map(([giverId, receiverId]) => ({
        groupId, giverId, receiverId,
      })),
    }),
  ]);

  const notifiableMembers = members
    .map((m) => m.user)
    .filter((user) => !user.isDependent && user.email);

  try {
    await Promise.all(
      notifiableMembers.map((member) =>
        emailService.send({
          to: member.email!,
          subject: `Sorteio realizado: ${group.name}`,
          html: `<p>O sorteio do grupo "${group.name}" foi realizado. Entre no app para conferir o resultado.</p><p><a href="${env.FRONTEND_URL}/groups/${groupId}">Ver grupo</a></p>`,
        })
      )
    );
  } catch (error) {
    console.error("Falha ao enviar e-mails de aviso de sorteio:", error);
  }

  return res.status(200).json({
    message: "Sorteio realizado com sucesso.",
    participantsCount: memberIds.length,
  });
}

export const getMyAssignment: RequestHandler = async (req, res) => {
  const groupId = Number(req.params.id);
  const requesterId = req.userId!;
  const participantIdQuery = req.query.participantId;

  let targetUserId = requesterId;

  if (typeof participantIdQuery === "string") {
    const participantId = Number(participantIdQuery);

    const dependent = await prisma.user.findFirst({
      where: { id: participantId, guardianId: requesterId, isDependent: true },
    });

    if (!dependent) {
      return res.status(403).json({ error: "Você não é responsável por este participante." });
    }

    const isMember = await assertIsMember(groupId, participantId);

    if (!isMember) {
      return res.status(403).json({ error: "Este participante não faz parte deste grupo." });
    }

    targetUserId = participantId;
  }

  const assignment = await prisma.assignment.findUnique({
    where: { groupId_giverId: { groupId, giverId: targetUserId } },
    include: {
      receiver: { select: { id: true, name: true } },
    },
  });

  if (!assignment) {
    return res.status(404).json({ error: "Sorteio ainda não foi realizado para este grupo." });
  }

  if (!assignment.viewedAt) {
    await prisma.assignment.update({
      where: { id: assignment.id },
      data: { viewedAt: new Date() },
    });
  }

  return res.status(200).json({ receiver: assignment.receiver });
};

export const createSuggestion: RequestHandler = async (req, res) => {
  const groupId = Number(req.params.id);
  const userId = req.userId!;
  const { content } = req.body;

  const isMember = await assertIsMember(groupId, userId);

  if (!isMember) {
    return res.status(403).json({ error: "Você não faz parte deste grupo." });
  }

  const suggestion = await prisma.giftSuggestion.create({
    data: { groupId, userId, content },
    include: { user: { select: { id: true, name: true } } },
  })

  return res.status(201).json(suggestion);
}

export const listSuggestions: RequestHandler = async (req, res) => {
  const groupId = Number(req.params.id);
  const userId = req.userId!;
  const filterUserId = req.query.userId;

  const isMember = await assertIsMember(groupId, userId);

  if (!isMember) {
    return res.status(403).json({ error: "Você não faz parte deste grupo." });
  }

  const suggestions = await prisma.giftSuggestion.findMany({
    where: {
      groupId,
      ...(typeof filterUserId === "string" && { userId: Number(filterUserId) }),
    },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { user: { name: "asc" } },
  });

  return res.status(200).json(suggestions);
};

export const updateSuggestion: RequestHandler = async (req, res) => {
  const suggestionId = Number(req.params.suggestionId);
  const groupId = Number(req.params.id);
  const userId = req.userId;
  const { content } = req.body;

  const suggestion = await prisma.giftSuggestion.findUnique({
    where: { id: suggestionId },
  })

  if (!suggestion || suggestion.groupId !== groupId) {
    return res.status(404).json({ error: "Sugestão não encontrada." });
  }

  if (suggestion.userId !== userId) {
    return res.status(403).json({ error: "Você só pode editar suas próprias sugestões." })
  }

  const updated = await prisma.giftSuggestion.update({
    where: { id: suggestionId },
    data: { content },
    include: { user: { select: { id: true, name: true } } },
  });

  return res.status(200).json(updated);
}

export const deleteSuggestion: RequestHandler = async (req, res) => {
  const suggestionId = Number(req.params.suggestionId);
  const groupId = Number(req.params.id);
  const userId = req.userId;

  const suggestion = await prisma.giftSuggestion.findUnique({
    where: { id: suggestionId },
  });

  if (!suggestion || suggestion.groupId !== groupId) {
    return res.status(404).json({ error: "Sugestão não encontrada." });
  }

  if (suggestion.userId !== userId) {
    return res.status(403).json({ error: "Você só pode excluir suas próprias sugestões." });
  }

  await prisma.giftSuggestion.delete({ where: { id: suggestionId } });

  return res.status(204).send();
}

export const deleteGroup: RequestHandler = async (req, res) => {
  const groupId = Number(req.params.id);
  const requesterId = req.userId!;
  const group = req.group!;

  if (group.ownerId !== requesterId) {
    return res.status(403).json({ error: "Apenas o responsável pode excluir o grupo." });
  }

  await prisma.group.delete({
    where: { id: groupId },
  });

  return res.status(204).send();
}

export const transferOwnership: RequestHandler = async (req, res) => {
  const groupId = Number(req.params.id);
  const requesterId = req.userId!;
  const { newOwnerId } = req.body;
  const group = req.group!;

  if (group.ownerId !== requesterId) {
    return res.status(403).json({ error: "Apenas o responsável pode transferir o grupo." });
  }

  let targetId: number;

  if (newOwnerId !== undefined) {
    if (newOwnerId === group.ownerId) {
      return res.status(422).json({ error: "Esta usuário já é o responsável pelo grupo." });
    }

    const isMember = await assertIsMember(groupId, newOwnerId);

    if (!isMember) {
      return res.status(422).json({ error: "O novo responsável precisa ser membro do groupo." });
    }

    targetId = newOwnerId;
  } else {
    const oldestMember = await prisma.groupMember.findFirst({
      where: { groupId, userId: { not: group.ownerId } },
      orderBy: { id: "asc" },
    });

    if (!oldestMember) {
      return res.status(422).json({
        error: "Não há outro membro no grupo para se tornar responsável. Para sair, exclua o grupo (DELETE /groups/:id).",
      });
    }

    targetId = oldestMember.userId;
  }

  const updated = await prisma.group.update({
    where: { id: groupId },
    data: { ownerId: targetId },
    include: { owner: { select: { id: true, name: true } } },
  });

  return res.status(200).json({
    id: updated.id,
    name: updated.name,
    owner: updated.owner,
  });
}

export const leaveGroup: RequestHandler = async (req, res) => {
  const groupId = Number(req.params.id);
  const userId = req.userId!;
  const group = req.group!;

  if (group.ownerId === userId) {
    return res.status(409).json({
      error: "Você é o responsável pelo grupo. Transfira a responsabilidade ou exclua o grupo antes de sair.",
    });
  }

  const stillHasDependents = await hasDependentsInGroup(groupId, userId);

  if (stillHasDependents) {
    return res.status(409).json({
      error: "Você ainda é responsável por dependentes neste grupo. Exclua-os antes de sair.",
    });
  }

  const isMember = await assertIsMember(groupId, userId);

  if (!isMember) {
    return res.status(403).json({ error: "Você não faz parte deste grupo." });
  }

  const isActive = await hasActiveAssignment(groupId, userId, group.eventDate);

  if (isActive) {
    return res.status(409).json({ error: "Você não pode sair do grupo enquanto participar de um sorteio ativo." });
  }

  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId } },
  });

  return res.status(204).send();
};

export const removeMember: RequestHandler = async (req, res) => {
  const groupId = Number(req.params.id);
  const targetUserId = Number(req.params.userId);
  const requesterId = req.userId!;
  const group = req.group!;

  if (group.ownerId !== requesterId) {
    return res.status(403).json({ error: "Apenas o responsável pode remover membros." });
  }

  if (targetUserId === group.ownerId) {
    return res.status(422).json({
      error: "O responsável não pode remover a si mesmo. Transfira a responsabilidade ou exclua o grupo.",
    });
  }

  const stillHasDependents = await hasDependentsInGroup(groupId, targetUserId);

  if (stillHasDependents) {
    return res.status(409).json({
      error: "Este membro ainda é responsável por dependentes neste grupo. Peça para excluí-los antes de removê-lo.",
    });
  }

  const isMember = await assertIsMember(groupId, targetUserId);

  if (!isMember) {
    return res.status(404).json({ error: "Este usuário não é membro do grupo." });
  }

  const isActive = await hasActiveAssignment(groupId, targetUserId, group.eventDate);

  if (isActive) {
    return res.status(409).json({ error: "Não é possível remover um membro enquanto participar de um sorteio ativo." });
  }

  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId: targetUserId } },
  });

  return res.status(204).send();
};

export const createDependent: RequestHandler = async (req, res) => {
  const group = req.group!;
  const requestId = req.userId!;
  const { name, guardianId } = req.body;

  if (group.ownerId !== requestId) {
    return res.status(403).json({ error: "Apenas o responsável pelo grupo pode adicionar dependentes." });
  }

  const guardianMembership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: guardianId } },
    include: { user: { select: { isDependent: true } } },
  });

  if (!guardianMembership) {
    return res.status(422).json({ error: "O responsável pelo dependente precisa ser membro do grupo." });
  }

  if (guardianMembership.user.isDependent) {
    return res.status(422).json({ error: "O responsável indicado não pode ser, ele mesmo, um dependente." });
  }

  const dependent = await prisma.$transaction(async (tx) => {
    const newDependent = await tx.user.create({
      data: { name, isDependent: true, guardianId },
    });

    await tx.groupMember.create({
      data: { groupId: group.id, userId: newDependent.id },
    });

    return newDependent;
  });

  return res.status(201).json({
    id: dependent.id,
    name: dependent.name,
    guardianId: dependent.guardianId,
  });
};

export const deleteDependent: RequestHandler = async (req, res) => {
  const group = req.group!;
  const groupId = group.id;
  const dependentId = Number(req.params.dependentId);
  const requesterId = req.userId!;

  const dependent = await prisma.user.findUnique({ where: { id: dependentId } });

  if (!dependent || !dependent.isDependent) {
    return res.status(404).json({ error: "Dependente não encontrado." });
  }

  const isMemberOfGroup = await assertIsMember(groupId, dependentId);

  if (!isMemberOfGroup) {
    return res.status(404).json({ error: "Este dependente não faz parte deste grupo." });
  }

  const isOwner = group.ownerId === requesterId;
  const isGuardian = dependent.guardianId === requesterId;

  if (!isOwner && !isGuardian) {
    return res.status(403).json({
      error: "Apenas o responsável pelo grupo ou o responsável pelo dependente pode excluí-lo.",
    });
  }

  const isActive = await hasActiveAssignment(groupId, dependentId, group.eventDate);

  if (isActive) {
    return res.status(409).json({ error: "Não é possível excluir um dependente enquanto participar de um sorteio ativo." });
  }

  await prisma.user.delete({ where: { id: dependentId } });

  return res.status(204).send();
};

//#region Funções auxiliares
function normalizePair(a: number, b: number) {
  return a < b ? { userAId: a, userBId: b } : { userAId: b, userBId: a };
}

async function assertIsMember(groupId: number, userId: number) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return !!membership;
}

async function hasActiveAssignment(groupId: number, userId: number, eventDate: Date | null) {
  const isEventActive = eventDate === null || eventDate >= new Date();

  if (!isEventActive) {
    return false;
  }

  const assignment = await prisma.assignment.findFirst({
    where: { groupId, OR: [{ giverId: userId }, { receiverId: userId }] },
  });

  return !!assignment;
}

async function hasDependentsInGroup(groupId: number, guardianId: number): Promise<boolean> {
  const count = await prisma.user.count({
    where: {
      isDependent: true,
      guardianId,
      memberships: { some: { groupId } },
    },
  });
  return count > 0;
}
//#endregion