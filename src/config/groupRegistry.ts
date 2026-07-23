import { z } from "zod";

import { registry } from "./registry";
import {
  createGroupSchema,
  groupResponseSchema,
  inviteResponseSchema,
  joinGroupViaInviteResponseSchema,
  searchGroupsQuerySchema,
  groupSummaryResponseSchema,
  groupDetailResponseSchema,
  createExclusionSchema,
  exclusionResponseSchema,
  drawResponseSchema,
  drawQuerySchema,
  myAssignmentResponseSchema,
  updateGroupSettingsSchema,
  groupSettingsResponseSchema,
  createSuggestionSchema,
  suggestionResponseSchema,
  updateSuggestionSchema,
  listSuggestionsQuerySchema,
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
    400: { description: "Token inválido.", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "Convite não encontrado.", content: { "application/json": { schema: errorResponseSchema } } },
    409: { description: "Você já é membro deste grupo.", content: { "application/json": { schema: errorResponseSchema } } },
    410: { description: "Este convite expirou.", content: { "application/json": { schema: errorResponseSchema } } },
    201: { description: "Você entrou no grupo com sucesso.", content: { "application/json": { schema: joinGroupViaInviteResponseSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/groups",
  summary: "Buscar grupos dos quais participo, filtrando por nome do grupo e/ou responsável",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: { query: searchGroupsQuerySchema },
  responses: {
    200: { description: "Lista de grupos encontrados", content: { "application/json": { schema: z.array(groupSummaryResponseSchema) } } },
    401: { description: "Token ausente ou inválido", content: { "application/json": { schema: errorResponseSchema } } },
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
    200: { description: "Detalhes do grupo.", content: { "application/json": { schema: groupDetailResponseSchema } } },
    403: { description: "Você não faz parte deste grupo.", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "Grupo não encontrado.", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/groups/{id}/exclusions",
  summary: "Cadastra um par de exclusão, ou seja, define um par de membros do grupo que não podem ser sorteados um para o outro.",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
    body: { content: { "application/json": { schema: createExclusionSchema } } },
  },
  responses: {
    201: { description: "Exclusão criada com sucesso.", content: { "application/json": { schema: exclusionResponseSchema } } },
    403: { description: "Apenas o responsável pode gerenciar exclusões.", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "Grupo não encontrado.", content: { "application/json": { schema: errorResponseSchema } } },
    409: { description: "Essa exclusão já existe.", content: { "application/json": { schema: errorResponseSchema } } },
    422: { description: "Ambos os usuários precisam ser membros do grupo.", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/groups/{id}/exclusions",
  summary: "Lista as exclusões cadastradas para o grupo.",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
  },
  responses: {
    200: { description: "Lista de exclusões do grupo.", content: { "application/json": { schema: z.array(exclusionResponseSchema) } } },
    403: { description: "Você não faz parte deste grupo.", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "Grupo não encontrado.", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "delete",
  path: "/groups/{id}/exclusions/{exclusionId}",
  summary: "Apaga a exclusão.",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
      exclusionId: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    204: { description: "Exclusão apagada com sucesso." },
    403: { description: "Apenas o responsável pode gerenciar exclusões.", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "Grupo ou exclusão não encontrado.", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/groups/{id}/draw",
  summary: "Realiza (ou refaz) o sorteio de amigo secreto do grupo",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
    query: drawQuerySchema,
  },
  responses: {
    200: { description: "Sorteio realizado com sucesso", content: { "application/json": { schema: drawResponseSchema } } },
    403: { description: "Apenas o responsável pode realizar o sorteio", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "Grupo não encontrado", content: { "application/json": { schema: errorResponseSchema } } },
    409: { description: "O sorteio já foi visualizado por algum participante — use ?force=true para refazer mesmo assim", content: { "application/json": { schema: errorResponseSchema } } },
    422: { description: "Membros insuficientes, ou não foi possível gerar um sorteio válido com as exclusões atuais ou sem data de evento", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/groups/{id}/assignment",
  summary: "Ver quem eu tirei no sorteio deste grupo",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
  },
  responses: {
    200: { description: "Resultado do sorteio para o usuário autenticado", content: { "application/json": { schema: myAssignmentResponseSchema } } },
    404: { description: "Sorteio ainda não foi realizado para este grupo (ou você não é membro)", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "patch",
  path: "/groups/{id}/settings",
  summary: "Alterar informações sobre o grupo.",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
    body: { content: { "application/json": { schema: updateGroupSettingsSchema } } },
  },
  responses: {
    200: { description: "Alterações realizadas com sucesso.", content: { "application/json": { schema: groupSettingsResponseSchema } } },
    403: { description: "Apenas o responsável pode alterar as configurações.", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "Grupo não encontrado.", content: { "application/json": { schema: errorResponseSchema } } },
    422: { description: "Erro de comparação entre valores mínimo/máximo, ou latitude/longitude não fornecidos juntos.", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/groups/{id}/suggestions",
  summary: "Adicionar sugestões de presentes.",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
    body: { content: { "application/json": { schema: createSuggestionSchema} } }
  },
  responses: {
    201: { description: "Sugestão criada com sucesso", content: { "application/json": { schema: suggestionResponseSchema } } },
    403: { description: "Você não faz parte deste grupo.", content: { "application/json": { schema: errorResponseSchema } } },
  }
});

registry.registerPath({
  method: "get",
  path: "/groups/{id}/suggestions",
  summary: "Lista de sugestões de presentes dos membros do grupo.",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
  params: z.object({ id: z.string().openapi({ example: "1" }) }),
  query: listSuggestionsQuerySchema,
},
  responses: {
    200: { description: "Lista de sugestões de presentes dos membros do grupo.", content: { "application/json": { schema: z.array(suggestionResponseSchema) } } },
    403: { description: "Você não faz parte deste grupo.", content: { "application/json": { schema: errorResponseSchema } } },
  }
})

registry.registerPath({
  method: "patch",
  path: "/groups/{id}/suggestions/{suggestionId}",
  summary: "Altera sugestão de presente da pessoa logada.",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
      suggestionId: z.string().openapi({ example: "1" }),
    }),
    body: { content: { "application/json": { schema: updateSuggestionSchema } } }
  },
  responses: {
    200: { description: "Alterações realizadas com sucesso.", content: { "application/json": { schema: suggestionResponseSchema } }},
    403: { description: "Você só pode editar suas próprias sugestões.", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "Sugestão não encontrada.", content: { "application/json": { schema: errorResponseSchema } } },
  }
})

registry.registerPath({
  method: "delete",
  path: "/groups/{id}/suggestions/{suggestionId}",
  summary: "Exlui sugestão de presente da pessoa logada.",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
      suggestionId: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    204: { description: "Sugestão apagada com sucesso." },
    403: { description: "Você só pode excluir suas próprias sugestões.", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "Sugestão não encontrada.", content: { "application/json": { schema: errorResponseSchema } } },
  }
})

registry.registerPath({
  method: "delete",
  path: "/groups/{id}",
  summary: "Apaga o grupo.",
  tags: ["Groups"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
  },
  responses: {
    204: { description: "Grupo apagado com sucesso." },
    403: { description: "Apenas o responsável pode excluir o grupo.", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "Grupo não encontrado.", content: { "application/json": { schema: errorResponseSchema } } },
  },
});