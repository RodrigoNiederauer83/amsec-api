import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";
import { env } from "../config/env";
import crypto from "crypto";
import { emailService } from "../services";

const RESET_TOKEN_EXPIRATION_MINUTES = 15;

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

  await emailService.send({
    to: user.email,
    subject: "Recuperação de senha",
    html: `<p>Clique no link abaixo para redefinir sua senha. Ele expira em ${RESET_TOKEN_EXPIRATION_MINUTES} minutos.</p><p><a href="${resetLink}">${resetLink}</a></p>`,
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