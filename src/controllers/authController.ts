import { Request, RequestHandler, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";
import { env } from "../config/env";
import crypto from "crypto";
import { emailService } from "../services";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const RESET_TOKEN_EXPIRATION_MINUTES = 15;
const EMAIL_CHANGE_EXPIRATION_MINUTES = 30;

export async function register(req: Request, res: Response) {
  const { email, password, name, phoneNumber } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { phoneNumber }] },
  });

  if (existingUser) {
    const field = existingUser.email === email ? "Email" : "Telefone";
    return res.status(409).json({ error: `${field} já cadastrado.` });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name, phoneNumber },
  });

  return res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name,
    phoneNumber: user.phoneNumber,
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ error: "Email ou senha inválidos." });
  }

  if (!user.password) {
    return res.status(409).json({ error: "Esta conta usa login via Google. Use essa opção para entrar." });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return res.status(401).json({ error: "Email ou senha inválidos" });
  }

  const token = jwt.sign(
    { userId: user.id },
    env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    token,
    user : {
      id: user.id,
      email: user.email,
      name: user.name
    }
  })
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      phoneNumber:true,
      name: true,
      createdAt: true,
    }
  })

  if (!user) {
    return res.status(401).json({ error: "Usuário não encontrado." });
  }

  return res.status(200).json(user);
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  const genericResponse = {
    message: "Se este e-mail estiver cadastrado, você receberá as instruções.",
  };

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(200).json(genericResponse);
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000);

  await prisma.passwordReset.upsert({
    where: { userId: user.id },
    update: { token, expiresAt },
    create: { userId: user.id, token, expiresAt },
  });

  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  const isFirstPassword = user.password === null;

  await emailService.send({
    to: user.email,
    subject: isFirstPassword ? "Defina uma senha para sua conta" : "Recuperação de senha",
    html: isFirstPassword
      ? `<p>Sua conta usa login via ${user.provider}. Se preferir também poder entrar com e-mail e senha, defina uma senha pelo link abaixo. Ele expira em ${RESET_TOKEN_EXPIRATION_MINUTES} minutos.</p><p><a href="${resetLink}">${resetLink}</a></p>`
      : `<p>Clique no link abaixo para redefinir sua senha. Ele expira em ${RESET_TOKEN_EXPIRATION_MINUTES} minutos.</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  });

  return res.status(200).json(genericResponse);
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body;

  const passwordReset = await prisma.passwordReset.findUnique({ where: { token } });

  if (!passwordReset) {
    return res.status(400).json({ error: "Token inválido ou expirado." });
  }

  if (passwordReset.expiresAt < new Date()) {
    return res.status(400).json({ error: "Token inválido ou expirado." });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: passwordReset.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordReset.delete({ where: { id: passwordReset.id } }),
  ]);

  return res.status(200).json({ message: "Senha redefinida com sucesso." });
}

export const deleteAccount: RequestHandler = async (req, res) => {
  const userId = req.userId!;
  const { password } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }

  if (user.password) {
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return res.status(401).json({ error: "Senha incorreta." });
  }

  const ownedGroup = await prisma.group.findFirst({ where: { ownerId: userId } });

  if (ownedGroup) {
    return res.status(409).json({
      error: "Você precisa excluir ou transferir a responsabilidade dos grupos que administra antes de excluir sua conta.",
    });
  }

  const activeAssignment = await prisma.assignment.findFirst({
    where: {
      OR: [{ giverId: userId }, { receiverId: userId }],
      group: {
        OR: [{ eventDate: null }, { eventDate: { gte: new Date() } }],
      },
    },
  });

  if (activeAssignment) {
    return res.status(409).json({
      error: "Você não pode excluir sua conta enquanto participar de um sorteio ativo.",
    });
  }

  await prisma.user.delete({ where: { id: userId } });

  return res.status(204).send();
};

export const updateName: RequestHandler = async (req, res) => {
  const userId = req.userId!;
  const { name } = req.body;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, email: true, name: true, phoneNumber: true },
  });

  return res.status(200).json(updated);
};

export const requestEmailChange: RequestHandler = async (req, res) => {
  const userId = req.userId!;
  const { newEmail, password } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

  if (user.password) {
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return res.status(401).json({ error: "Senha incorreta." });
  }

  if (newEmail === user.email) {
    return res.status(422).json({ error: "O novo e-mail deve ser diferente do atual." });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existingEmail) {
    return res.status(409).json({ error: "Este e-mail já está em uso." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + EMAIL_CHANGE_EXPIRATION_MINUTES * 60 * 1000);

  await prisma.emailChangeRequest.upsert({
    where: { userId },
    update: { newEmail, token, expiresAt },
    create: { userId, newEmail, token, expiresAt },
  });

  const confirmLink = `${env.FRONTEND_URL}/confirm-email-change?token=${token}`;

  await emailService.send({
    to: newEmail,
    subject: "Confirme seu novo e-mail",
    html: `<p>Clique para confirmar a troca de e-mail. Expira em ${EMAIL_CHANGE_EXPIRATION_MINUTES} minutos.</p><p><a href="${confirmLink}">${confirmLink}</a></p>`,
  });

  await emailService.send({
    to: user.email,
    subject: "Solicitação de troca de e-mail",
    html: `<p>Foi solicitada a troca do e-mail da sua conta para ${newEmail}. Se não foi você, troque sua senha imediatamente.</p>`,
  });

  return res.status(200).json({ message: "Um e-mail de confirmação foi enviado para o novo endereço." });
};

export const confirmEmailChange: RequestHandler = async (req, res) => {
  const { token } = req.body;

  const request = await prisma.emailChangeRequest.findUnique({ where: { token } });

  if (!request || request.expiresAt < new Date()) {
    return res.status(400).json({ error: "Token inválido ou expirado." });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email: request.newEmail } });
  if (existingEmail) {
    return res.status(409).json({ error: "Este e-mail já está em uso." });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: request.userId }, data: { email: request.newEmail } }),
    prisma.emailChangeRequest.delete({ where: { id: request.id } }),
  ]);

  return res.status(200).json({ message: "E-mail atualizado com sucesso." });
};

export const updatePhone: RequestHandler = async (req, res) => {
  const userId = req.userId!;
  const { phoneNumber, password } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

  if (user.password) {
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return res.status(401).json({ error: "Senha incorreta." });
  }

  const existing = await prisma.user.findUnique({ where: { phoneNumber } });
  if (existing) {
    return res.status(409).json({ error: "Este telefone já está em uso." });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { phoneNumber },
    select: { id: true, email: true, name: true, phoneNumber: true },
  });

  return res.status(200).json(updated);
};

export const googleLogin: RequestHandler = async (req, res) => {
  const { idToken } = req.body;

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ error: "Token do Google inválido." });
  }

  if (!payload || !payload.email_verified || !payload.email) {
    return res.status(401).json({ error: "Não foi possível verificar o e-mail da conta Google." });
  }

  let user = await prisma.user.findUnique({
    where: { provider_providerId: { provider: "GOOGLE", providerId: payload.sub } },
  });

  if (!user) {
    const existingByEmail = await prisma.user.findUnique({ where: { email: payload.email } });

    if (existingByEmail) {
      return res.status(409).json({
        error: "Já existe uma conta com este e-mail cadastrada de outra forma. Faça login pelo método original.",
      });
    }

    user = await prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name ?? null,
        provider: "GOOGLE",
        providerId: payload.sub,
      },
    });
  }

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "7d" });

  return res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
    },
    needsPhoneNumber: user.phoneNumber === null,
  });
};