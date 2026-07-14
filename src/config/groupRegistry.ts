import { z } from "zod";

import { registry } from "./registry";
import { 
  createGroupSchema,
  groupResponseSchema,
  inviteResponseSchema,
  joinGroupViaInviteResponseSchema,
  searchGroupsQuerySchema,
  groupSummaryResponseSchema,
  groupDetailResponseSchema
} from "../schemas/groupSchemas";
import { errorResponseSchema } from "../schemas/authSchemas";

registry.registerPath({
  method: "post",
  path: "/groups",
  summary: "Criar um novo grupo de amigo secreto",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createGroupSchema } } },
  },
  responses: {
    201: { description: "Grupo criado com sucesso", content: { "application/json": { schema: groupResponseSchema } } },
    401: { description: "Token ausente ou inválido", content: { "application/json": { schema: errorResponseSchema } } },
    409: { description: "Você já tem um grupo com esse nome", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/groups/{id}/invite",
  summary: "Gerar (ou regenerar) o link de convite de um grupo",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
  },
  responses: {
    200: { description: "Convite gerado com sucesso", content: { "application/json": { schema: inviteResponseSchema } } },
    403: { description: "Apenas o responsável pode gerar convites", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "Grupo não encontrado", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/groups/invite/{token}/join",
  summary: "Aceitar convite para participar de um grupo via convite",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ token: z.string().openapi({ example: "75ca07a8f0204155e8fddf7bc3030263ff77c6f7b9388f05b9acf612fb200bd2" }) }),
  },
  responses: {
    400: {description: "Token inválido.", content: {"application/json": {schema: errorResponseSchema}}},
    404: {description: "Convite não encontrado.", content: {"application/json": {schema: errorResponseSchema}}},
    409: {description: "Você já é membro deste grupo.", content: {"application/json": {schema: errorResponseSchema}}},
    410: {description: "Este convite expirou.", content: {"application/json": {schema: errorResponseSchema}}},
    201: {description: "Você entrou no grupo com sucesso.", content: {"application/json": {schema: joinGroupViaInviteResponseSchema}}},
  }
});

registry.registerPath({
  method: "get",
  path: "/groups",
  summary: "Buscar grupos dos quais participo, filtrando por nome do grupo e/ou responsável",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: { query: searchGroupsQuerySchema, },
  responses: {
    200: {description: "Lista de grupos encontrados", content: {"application/json": {schema: z.array(groupSummaryResponseSchema)}}},
    401: {description: "Token ausente ou inválido", content: {"application/json": {schema: errorResponseSchema}}},
  },
});

registry.registerPath({
  method: "get",
  path: "/groups/{id}",
  summary: "Ver detalhes de um grupo (apenas se você for membro)",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
  },
  responses: {
    200: {description: "Detalhes do grupo", content: {"application/json": {schema: groupDetailResponseSchema}}},
    403: {description: "Você não faz parte deste grupo", content: {"application/json": {schema: errorResponseSchema}}},
    404: {description: "Grupo não encontrado", content: {"application/json": {schema: errorResponseSchema}}},
  },
});