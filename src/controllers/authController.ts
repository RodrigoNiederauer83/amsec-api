import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";
import { env } from "../config/env";


export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({ error: "Email já cadastrado." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  })

  return res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name,
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