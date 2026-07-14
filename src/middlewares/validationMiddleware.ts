import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

type RequestSource = "body" | "params" | "query";

export function validate(schema: ZodType, source: RequestSource = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[source];
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({ error: "Dados inválidos", details: errors });
    }

    if (source === "body") {
      req.body = result.data;
    }

    // "params" e "query": só validamos, não sobrescrevemos req.params/req.query
    // (Express tipa esses campos como somente-leitura / string-only por padrão)

    return next();
  };
}
