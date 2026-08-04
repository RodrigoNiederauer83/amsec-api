/// <reference types="jest" />
import { createExclusion } from "../../groupController";
import { prisma } from "../../../prisma/client";
import { PrismaClient } from "@prisma/client";
import { DeepMockProxy } from "jest-mock-extended";
import { buildReqRes } from "./testUtils";

jest.mock("../../../prisma/client");

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("createExclusion", () => {
  it("retorna 403 se quem pede não é o responsável", async () => {
    const { req, res } = buildReqRes({
      userId: 999,
      body: { userAId: 2, userBId: 3 },
    });

    await createExclusion(req, res, jest.fn());

    expect(res.statusCode).toBe(403);
  });

  it("retorna 422 se algum dos dois usuários não é membro do grupo", async () => {
    const { req, res } = buildReqRes({ body: { userAId: 2, userBId: 3 } });
    prismaMock.groupMember.findMany.mockResolvedValue([
      { id: 1, groupId: 10, userId: 2 },
    ] as any);

    await createExclusion(req, res, jest.fn());

    expect(res.statusCode).toBe(422);
  });

  it("retorna 422 se algum dos dois já atingiu o limite de exclusões", async () => {
    const { req, res } = buildReqRes({ body: { userAId: 2, userBId: 3 } });
    prismaMock.groupMember.findMany.mockResolvedValue([
      { id: 1, groupId: 10, userId: 2 },
      { id: 2, groupId: 10, userId: 3 },
    ] as any);
    prismaMock.groupMember.count.mockResolvedValue(10);
    prismaMock.groupExclusion.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);

    await createExclusion(req, res, jest.fn());

    expect(res.statusCode).toBe(422);
  });

  it("cria a exclusão com sucesso quando tudo está dentro das regras", async () => {
    const { req, res } = buildReqRes({ body: { userAId: 2, userBId: 3 } });
    prismaMock.groupMember.findMany.mockResolvedValue([
      { id: 1, groupId: 10, userId: 2 },
      { id: 2, groupId: 10, userId: 3 },
    ] as any);
    prismaMock.groupMember.count.mockResolvedValue(10);
    prismaMock.groupExclusion.count.mockResolvedValue(0);
    prismaMock.groupExclusion.create.mockResolvedValue({
      id: 1, groupId: 10, userAId: 2, userBId: 3,
      userA: { id: 2, name: "Ana" }, userB: { id: 3, name: "Bruno" },
    } as any);

    await createExclusion(req, res, jest.fn());

    expect(res.statusCode).toBe(201);
  });

  it("retorna 409 quando a exclusão já existe (P2002)", async () => {
    const { req, res } = buildReqRes({ body: { userAId: 2, userBId: 3 } });
    prismaMock.groupMember.findMany.mockResolvedValue([
      { id: 1, groupId: 10, userId: 2 },
      { id: 2, groupId: 10, userId: 3 },
    ] as any);
    prismaMock.groupMember.count.mockResolvedValue(10);
    prismaMock.groupExclusion.count.mockResolvedValue(0);
    prismaMock.groupExclusion.create.mockRejectedValue({ code: "P2002" });

    await createExclusion(req, res, jest.fn());

    expect(res.statusCode).toBe(409);
  });
});