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

export const groupSettingsResponseSchema = z.object({
  eventDate: z.string().nullable().openapi({ example: "2026-12-24T20:00:00.000Z" }),
  minGiftCents: z.number().nullable().openapi({ example: 2000 }),
  maxGiftCents: z.number().nullable().openapi({ example: 5000 }),
  eventAddress: z.string().nullable().openapi({ example: "Rua das Flores, 123 - Centro, São Paulo" }),
  eventLat: z.number().nullable().openapi({ example: -23.5505 }),
  eventLng: z.number().nullable().openapi({ example: -46.6333 }),
});

export const updateGroupSettingsSchema = z.object({
  eventDate: z.iso.datetime().optional().openapi({ example: "2026-12-24T20:00:00.000Z" }),
  minGiftCents: z.number().int().nonnegative().optional().openapi({ example: 2000 }),
  maxGiftCents: z.number().int().nonnegative().optional().openapi({ example: 5000 }),
  eventAddress: z.string().max(300).optional().openapi({ example: "Rua das Flores, 123 - Centro, São Paulo" }),
  eventLat: z.number().min(-90).max(90).optional().openapi({ example: -23.5505 }),
  eventLng: z.number().min(-180).max(180).optional().openapi({ example: -46.6333 }),
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

export const createSuggestionSchema = z.object({
  content: z.string().min(1, "A sugestão não pode ser vazia.").max(150, "Máximo de 150 caracteres.").openapi({ example: "Um livro de ficção científica" }),
});

export const updateSuggestionSchema = z.object({
  content: z.string().min(1, "A sugestão não pode ser vazia.").max(150, "Máximo de 150 caracteres.").openapi({ example: "Um livro de ficção científica, de preferência da Ursula K. Le Guin" }),
});

export const suggestionResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  content: z.string().openapi({ example: "Um livro de ficção científica" }),
  createdAt: z.string().openapi({ example: "2026-07-19T12:00:00.000Z" }),
  updatedAt: z.string().openapi({ example: "2026-07-19T12:00:00.000Z" }),
  user: z.object({
    id: z.number().openapi({ example: 2 }),
    name: z.string().nullable().openapi({ example: "Maria Souza" }),
  }),
});

export const listSuggestionsQuerySchema = z.object({
  userId: z.string().regex(/^\d+$/, "userId deve ser um número.").optional(),
});