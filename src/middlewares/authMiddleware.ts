import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface TokenPayload {
    userId: number;
}

export function authMiddleware(req:Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido." });
    }

    const [,token] = authHeader.split(" ");

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET as string) as TokenPayload;
        req.userId = decoded.userId;
        return next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido ou expirado" });
    }
}
