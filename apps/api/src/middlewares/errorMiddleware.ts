import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.log(err);

    return res.status(500).json({
        error: "Erro interno do servidor."
    })
}