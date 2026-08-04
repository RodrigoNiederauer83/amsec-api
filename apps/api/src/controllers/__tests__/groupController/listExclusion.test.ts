/// <reference types="jest" />

import { DeepMockProxy } from "jest-mock-extended";
import { prisma } from "../../../prisma/client";
import { PrismaClient } from "@prisma/client";
import { buildReqRes } from "./testUtils";
import { listExclusions } from "../../groupController";

jest.mock("../../../prisma/client");

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("listExclusions", () => {
    it("retorna 403 se quem solicita não faz parte do grupo", async () => {
        const { req, res } = buildReqRes({ userId: 999, params: { id: "10" } });

        prismaMock.groupMember.findUnique.mockResolvedValue(null);

        await listExclusions(req, res, jest.fn());

        expect(res.statusCode).toBe(403);
    })

    it("retorna 200 e lista as exclusões do grupo", async () => {
        const { req, res } = buildReqRes({ userId: 2, params: { id: "10" } });
        prismaMock.groupMember.findUnique.mockResolvedValue({
            id: 1, groupId: 10, userId: 2,
        } as any);
        prismaMock.groupExclusion.findMany.mockResolvedValue([
            {
                id: 1, groupId: 10, userAId: 2, userBId: 3,
                userA: { id: 2, name: "Ana" }, userB: { id: 3, name: "Bruno" },
            },
        ] as any);

        await listExclusions(req, res, jest.fn());

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toHaveLength(1);
    })
})