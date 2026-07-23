import { z } from "zod";

export const registerSchema = z.object({
    email: z.email("Email inválido").openapi({ example: "usuario@email.com" }),
    password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres.").openapi({ example: "Abc123" }),
    name: z.string().min(1, "Nome é obrigatório.").openapi({ example: "João da Silva" }),
    phoneNumber: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, "Telefone deve estar no formato internacional, ex: +5511999998888")
    .openapi({ example: "+5511999998888" }),
})

export const loginSchema = z.object({
  email: z.email("Email inválido").openapi({ example: "usuario@email.com" }),
  password: z.string().min(1, "Senha é obrigatória").openapi({ example: "Abc123" }),
});

export const userResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  email: z.email().openapi({ example: "usuario@email.com" }),
  name: z.string().nullable().openapi({ example: "João da Silva" }),
  phoneNumber: z.string().openapi({ example: "+5511999998888" }),
});

export const loginResponseSchema = z.object({
  token: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
  user: userResponseSchema,
});

export const errorResponseSchema = z.object({
  error: z.string().openapi({ example: "Mensagem de erro" }),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Email inválido").openapi({ example: "usuario@email.com" }),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório.").openapi({ example: "a1b2c3..." }),
  newPassword: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres.").openapi({ example: "NovaSenha123" }),
});

export const genericMessageResponseSchema = z.object({
  message: z.string().openapi({ example: "Se este e-mail estiver cadastrado, você receberá as instruções." }),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Senha é obrigatória.").openapi({ example: "SuaSenhaAtual123" }),
});