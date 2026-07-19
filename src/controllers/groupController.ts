import { Request, RequestHandler, Response } from "express";
import { prisma } from "../prisma/client";
import { generateDraw } from "../utils/drawAlgorithm";

import crypto from "crypto";

const INVITE_EXPIRATION_DAYS = 7;

export async function createGroup(req:Request, res:Response) {
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
            return res.status(409).json({ error: "Você já tem um grupo com este nome."});
        }

        throw error;
    }
}

export const createInvite: RequestHandler = async (req, res) => {
  const groupId = Number(req.params.id);
  const userId = req.userId!;

  const group = await prisma.group.findUnique({ where: { id: groupId } });

  if (!group) {
    return res.status(404).json({ error: "Grupo não encontrado." });
  }

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
      ...(typeof nameQuery === "string" && {
        name: { contains: nameQuery },
      }),
      ...(typeof ownerQuery === "string" && {
        owner: { name: { contains: ownerQuery } },
      })
    },
    include: {
      owner: { select: { id: true, name: true } },
    }
  });

  return res.status(200).json(
    groups.map((g) => ({ id: g.id, name: g.name, owner: g.owner }))
  );
}

export const getGroupDetail: RequestHandler = async (req, res) => {
  const groupId = Number(req.params.id);
  const userId = req.userId!;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      owner: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  if (!group) {
    return res.status(404).json({ error: "Grupo não encontrado." });
  }

  // em vez de fazer uma segunda consulta ao banco, foram reaproveitados os members que já vieram no include da primeira consulta
  const isMember = group.members.some((m) => m.userId === userId);

  if (!isMember) {
    return res.status(403).json({ error: "Você não faz parte deste grupo." });
  }

  return res.status(200).json({
    id: group.id,
    name: group.name,
    owner: group.owner,
    members: group.members.map((m) => m.user),
  });
};

function normalizePair(a: number, b: number) {
  return a < b ? { userAId: a, userBId: b } : { userAId: b, userBId: a };
}

export const createExclusion: RequestHandler = async (req, res) => {
  const groupId = Number(req.params.id);
  const requesterId = req.userId!;
  const { userAId, userBId } = req.body;

  const group = await prisma.group.findUnique({ where: { id: groupId } });

  if (!group) {
    return res.status(404).json({ error: "Grupo não encontrado." });
  }

  if (group.ownerId !== requesterId) {
    return res.status(403).json({ error: "Apenas o responsável pode gerenciar exclusões."});
  }

  const members = await prisma.groupMember.findMany({
    where: { groupId, userId: { in: [userAId, userBId] } },
  });

  if (members.length !== 2) {
    return res.status(422).json({ error: "Ambos os usuários precisam ser membros do grupo." })
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
    if (error === "P2002") {
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
  const groupId = Number(req.params.id);
  const exclusionId = Number(req.params.exclusionId);
  const requesterId = req.userId!;

  const group = await prisma.group.findUnique({
    where : { id: groupId },
  });

  if (!group) {
    return res.status(404).json({ error: "Grupo não encontrado." })
  }

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
  const requesterId = req.userId;

  const group = await prisma.group.findUnique({ where: { id: groupId } });

  if (!group) {
    return res.status(404).json({ error: "Grupo não encontrado." });
  }

  if (group.ownerId !== requesterId) {
    return res.status(403).json({ error: "Apenas o responsável pode realizar o sorteio." });
  }

  const existingAssignments = await prisma.assignment.findMany({ where: { groupId } });
  const alreadyViewed = existingAssignments.some((a) => a.viewedAt !== null);

  if (alreadyViewed) {
    return res.status(409).json({
      error: "O sorteio já foi visualizado por algum participante e não pode ser refeito."
    })
  }

  const members = await prisma.groupMember.findMany({ where: { groupId } });
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

  return res.status(200).json({
    message: "Sorteio realizado com sucesso.",
    participantsCount: memberIds.length,
  });
}

export const getMyAssignment: RequestHandler = async (req, res) => {
  const groupId = Number(req.params.id);
  const requesterId = req.userId!;

  const assignment = await prisma.assignment.findUnique({
    where: { groupId_giverId: { groupId, giverId: requesterId } },
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
