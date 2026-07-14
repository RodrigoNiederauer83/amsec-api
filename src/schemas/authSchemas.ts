import { z } from "zod";

export const registerSchema = z.object({
    email: z.email("Email inválido").openapi({ example: "usuario@email.com" }),
    password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres.").openapi({ example: "Abc123" }),
    name: z.string().min(1, "Nome é obrigatório.").openapi({ example: "João da Silva" }),
})

export const loginSchema = z.object({
  email: z.email("Email inválido").openapi({ example: "usuario@email.com" }),
  password: z.string().min(1, "Senha é obrigatória").openapi({ example: "Abc123" }),
});

export const userResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  email: z.email().openapi({ example: "usuario@email.com" }),
  name: z.string().openapi({ example: "João da Silva" }),
});

export const loginResponseSchema = z.object({
  token: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
  user: userResponseSchema,
});

export const errorResponseSchema = z.object({
  error: z.string().openapi({ example: "Mensagem de erro" }),
});