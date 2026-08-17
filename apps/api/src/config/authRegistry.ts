import { registry } from "./registry";
import {
  registerSchema,
  loginSchema,
  userResponseSchema,
  loginResponseSchema,
  errorResponseSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  genericMessageResponseSchema,
  deleteAccountSchema,
  updateNameSchema,
  confirmEmailChangeSchema,
  requestEmailChangeSchema,
  updatePhoneSchema,
  googleLoginSchema,
  googleLoginResponseSchema,
} from "@amsec/shared";

registry.registerPath({
  method: "post",
  path: "/auth/register",
  summary: "Cadastrar novo usuário",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: registerSchema } } },
  },
  responses: {
    201: { description: "Usuário criado com sucesso", content: { "application/json": { schema: userResponseSchema } } },
    409: { description: "Email já cadastrado", content: { "application/json": { schema: errorResponseSchema } } },
    400: { description: "Dados inválidos", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  summary: "Login de usuário",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: loginSchema } } },
  },
  responses: {
    200: { description: "Login realizado com sucesso", content: { "application/json": { schema: loginResponseSchema } } },
    401: { description: "Email ou senha inválidos", content: { "application/json": { schema: errorResponseSchema } } },
    429: {
      description: "Muitas tentativas em pouco tempo. Tente novamente mais tarde.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/auth/me",
  summary: "Dados do usuário autenticado",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: "Dados do usuário", content: { "application/json": { schema: userResponseSchema } } },
    401: { description: "Token ausente ou inválido", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/forgot-password",
  summary: "Solicitar recuperação de senha",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: forgotPasswordSchema } } },
  },
  responses: {
    200: {
      description: "Se o e-mail estiver cadastrado, as instruções são enviadas (resposta sempre igual, por segurança)",
      content: { "application/json": { schema: genericMessageResponseSchema } },
    },
    400: {
      description: "Dados inválidos",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    429: {
      description: "Muitas tentativas em pouco tempo. Tente novamente mais tarde.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/reset-password",
  summary: "Redefinir senha usando o token recebido por e-mail",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: resetPasswordSchema } } },
  },
  responses: {
    200: {
      description: "Senha redefinida com sucesso",
      content: { "application/json": { schema: genericMessageResponseSchema } },
    },
    400: {
      description: "Token inválido ou expirado, ou dados inválidos",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    429: {
      description: "Muitas tentativas em pouco tempo. Tente novamente mais tarde.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/auth/me",
  summary: "Exclui a conta do usuário logado.",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: deleteAccountSchema } } },
  },
  responses: {
    204: { description: "Conta excluída com sucesso." },
    401: {
      description: "Senha incorreta.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    409: {
      description: "Não é possível excluir: o usuário é responsável por algum grupo, ou participa de um sorteio ativo.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/auth/me",
  summary: "Atualiza o nome do usuário logado.",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: updateNameSchema } } },
  },
  responses: {
    200: {
      description: "Nome atualizado com sucesso.",
      content: { "application/json": { schema: userResponseSchema } },
    },
    401: {
      description: "Token inválido ou ausente.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/change-email",
  summary: "Solicita a troca de e-mail da conta.",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: requestEmailChangeSchema } } },
  },
  responses: {
    200: {
      description: "E-mail de confirmação enviado para o novo endereço.",
      content: { "application/json": { schema: genericMessageResponseSchema } },
    },
    401: {
      description: "Senha incorreta.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    409: {
      description: "Este e-mail já está em uso.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    422: {
      description: "O novo e-mail é igual ao atual.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/confirm-email-change",
  summary: "Confirma a troca de e-mail usando o token recebido.",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: confirmEmailChangeSchema } } },
  },
  responses: {
    200: {
      description: "E-mail atualizado com sucesso.",
      content: { "application/json": { schema: genericMessageResponseSchema } },
    },
    400: {
      description: "Token inválido ou expirado.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    409: {
      description: "Este e-mail já está em uso por outra conta.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    429: {
      description: "Muitas tentativas em pouco tempo. Tente novamente mais tarde.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/auth/phone",
  summary: "Atualiza o telefone do usuário logado.",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: updatePhoneSchema } } },
  },
  responses: {
    200: {
      description: "Telefone atualizado com sucesso.",
      content: { "application/json": { schema: userResponseSchema } },
    },
    401: {
      description: "Senha incorreta.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    409: {
      description: "Este telefone já está em uso.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/google",
  summary: "Login ou cadastro via conta Google.",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: googleLoginSchema } } },
  },
  responses: {
    200: {
      description: "Login realizado com sucesso (cria a conta automaticamente no primeiro acesso).",
      content: { "application/json": { schema: googleLoginResponseSchema } },
    },
    401: {
      description: "Token do Google inválido ou e-mail não verificado.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    409: {
      description: "Já existe uma conta com este e-mail cadastrada de outra forma.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    429: {
      description: "Muitas tentativas em pouco tempo. Tente novamente mais tarde.",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});