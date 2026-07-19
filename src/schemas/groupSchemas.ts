import { z } from "zod";

export const createGroupSchema = z.object({
    name: z.string().min(1, "Nome do grupo é obrigatório.").openapi({example: "Natal 2026"}),
});

export const groupResponseSchema = z.object({
    id: z.number().openapi({example: 1}),
    name: z.string().openapi({example: "Natal 2026"}),
    ownerId: z.number().openapi({example: 1}),
});

export const inviteResponseSchema = z.object({
  token: z.string().openapi({ example: "a1b2c3d4e5f6..." }),
  expiresAt: z.string().openapi({ example: "2026-07-21T12:00:00.000Z" }),
});

export const groupIdParamSchema = z.object({
    // z.coerce.number() pega a string que vem da URL ("1") e converte pra number antes de validar 
  id: z.coerce.number().int().positive({ message: "Id do grupo inválido." }),
});

// z.infer<typeof groupIdParamSchema> gera o tipo { id: number } automaticamente a partir do schema — ou seja, 
// o schema é a única fonte de verdade. Se um dia for adicionado um campo novo ao schema, o tipo já reflete isso sozinho, 
// sem precisar manter uma interface separada em paralelo (que poderia ficar desatualizada).
export type GroupIdParams = z.infer<typeof groupIdParamSchema>;

export const invitePreviewResponseSchema = z.object({
  groupId: z.number().openapi({ example: 1 }),
  groupName: z.string().openapi({ example: "Natal 2026" }),
  owner: z.object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().nullable().openapi({ example: "João da Silva" }),
  }),
  members: z.array(
    z.object({
      id: z.number().openapi({ example: 2 }),
      name: z.string().nullable().openapi({ example: "Maria Souza" }),
    })
  ),
});

export const joinGroupViaInviteResponseSchema = z.object({
  groupId: z.number().openapi({ example: 1 }),
  message: z.string().openapi({ example: "Você entrou no grupo com sucesso." }),
});

export const searchGroupsQuerySchema = z.object({
  owner: z.string().optional().openapi({ example: "João" }),
  name: z.string().optional().openapi({ example: "Natal" }),
});

export const groupSummaryResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  name: z.string().openapi({ example: "Natal 2026" }),
  owner: z.object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().nullable().openapi({ example: "João da Silva" }),
  }),
});

export const groupDetailResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  name: z.string().openapi({ example: "Natal 2026" }),
  owner: z.object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().nullable().openapi({ example: "João da Silva" }),
  }),
  members: z.array(
    z.object({
      id: z.number().openapi({ example: 2 }),
      name: z.string().nullable().openapi({ example: "Maria Souza" }),
    })
  ),
});

// O .refine(...) adiciona uma regra de validação customizada, 
// que não dá pra expressar só com os tipos (z.number(), etc) 
// — aqui, "os dois ids não podem ser iguais". 
// Se a condição no primeiro argumento retornar false, 
// cai no erro com a mensagem e o path indicados 
// (o path: ["userBId"] só ajuda a apontar o erro pro campo certo na resposta de validação).
export const createExclusionSchema = z.object({
  userAId: z.number().int().positive().openapi({ example: 2 }),
  userBId: z.number().int().positive().openapi({ example: 3 }),
})
.refine((data) => data.userAId !== data.userBId, {
  message: "Não é possível excluir um usuário dele mesmo.",
  path: ["userBId"]
})

export const exclusionResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  userA: z.object({ id: z.number(), name: z.string().nullable() }),
  userB: z.object({ id: z.number(), name: z.string().nullable() }),
});

export const drawResponseSchema = z.object({
  message: z.string().openapi({ example: "Sorteio realizado com sucesso." }),
  participantsCount: z.number().openapi({ example: 5 }),
});

export const myAssignmentResponseSchema = z.object({
  receiver: z.object({
    id: z.number().openapi({ example: 3 }),
    name: z.string().nullable().openapi({ example: "Maria Souza" }),
  }),
});

export const drawQuerySchema = z.object({
  force: z.enum(["true", "false"]).optional().openapi({ example: "true" }),
});
