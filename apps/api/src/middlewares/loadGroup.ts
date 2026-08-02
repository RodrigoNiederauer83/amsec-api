import { RequestHandler } from "express";
import { prisma } from "../prisma/client";

export const loadGroup: RequestHandler = async (req, res, next) => {
  const groupId = Number(req.params.id);
  const group = await prisma.group.findUnique({ where: { id: groupId } });

  if (!group) {
    return res.status(404).json({ error: "Grupo não encontrado." });
  }

  req.group = group;
  next();
};