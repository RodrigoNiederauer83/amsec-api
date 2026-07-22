import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET precisa ter no mínimo 10 caracteres"),
  PORT: z.string().optional(),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY é obrigatória"),
  EMAIL_FROM: z.string().min(1, "EMAIL_FROM é obrigatória"),
  FRONTEND_URL: z.url("FRONTEND_URL precisa ser uma URL válida")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Variáveis de ambiente inválidas:");
  console.error(parsedEnv.error.issues);
  process.exit(1);
}

export const env = {
  DATABASE_URL: parsedEnv.data.DATABASE_URL,
  JWT_SECRET: parsedEnv.data.JWT_SECRET,
  PORT: parsedEnv.data.PORT ? Number(parsedEnv.data.PORT) : 3333,
  RESEND_API_KEY: parsedEnv.data.RESEND_API_KEY,
  EMAIL_FROM: parsedEnv.data.EMAIL_FROM,
  FRONTEND_URL: parsedEnv.data.FRONTEND_URL,
};