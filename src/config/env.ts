import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET precisa ter no mínimo 10 caracteres"),
  PORT: z.string().optional(),
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
};