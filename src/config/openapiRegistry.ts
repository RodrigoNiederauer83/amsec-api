import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  registerSchema,
  loginSchema,
  userResponseSchema,
  loginResponseSchema,
  errorResponseSchema,
} from "../schemas/authSchemas";

export const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "post",
  path: "/auth/register",
  summary: "Cadastrar novo usuário",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Usuário criado com sucesso",
      content: {
        "application/json": {
          schema: userResponseSchema,
        },
      },
    },
    409: {
      description: "Email já cadastrado",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    400: {
      description: "Dados inválidos",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  summary: "Login de usuário",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login realizado com sucesso",
      content: {
        "application/json": {
          schema: loginResponseSchema,
        },
      },
    },
    401: {
      description: "Email ou senha inválidos",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
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
    200: {
      description: "Dados do usuário",
      content: {
        "application/json": {
          schema: userResponseSchema,
        },
      },
    },
    401: {
      description: "Token ausente ou inválido",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});