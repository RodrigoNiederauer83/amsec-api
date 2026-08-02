import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";
const windowMs = isProduction ? 15 * 60 * 1000 : 60 * 1000;

export const loginRateLimiter = rateLimit({
  windowMs,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente em alguns minutos." },
});

export const sensitiveActionRateLimiter = rateLimit({
  windowMs,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente em alguns minutos." },
});

/*
windowMs: 15 * 60 * 1000 — a janela de tempo em milissegundos (15 minutos). Passado esse tempo desde a primeira tentativa contabilizada, o contador reseta.
standardHeaders: true — adiciona headers padronizados (RateLimit-*) na resposta, informando quantas tentativas restam e quando o limite reseta. Isso é útil pro frontend (ele pode ler esses headers e mostrar "tente novamente em X minutos" sem precisar adivinhar).
legacyHeaders: false — desativa um conjunto antigo de headers (X-RateLimit-*) que hoje é considerado obsoleto; mantemos só o padrão atual.
Por padrão, o express-rate-limit conta as tentativas por IP — que é exatamente a "camada 1" que discutimos, sem precisar de tabela nova no banco nem Redis.
*/