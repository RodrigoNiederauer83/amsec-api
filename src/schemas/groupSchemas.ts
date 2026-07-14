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
