/// <reference types="jest" />
import { deleteExclusion } from "../../groupController";
import { prisma } from "../../../prisma/client";
import { DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { buildReqRes } from "./testUtils";

jest.mock("../../../prisma/client");

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("deleteExclusion", () => {
    it("retorna 403 se quem pede não é o responsável", async () => {
        const { req, res } = buildReqRes({
          userId: 999,
          params: { exclusionId: "1" }
        });
    
        await deleteExclusion(req, res, jest.fn());
    
        expect(res.statusCode).toBe(403);
    });

    it("retorna 404 se a exclusão não for encontrada para ser deletada", async () => {
        const { req, res } = buildReqRes({
            userId: 1,
            params: { exclusionId: "99" }
        });

        await deleteExclusion(req, res, jest.fn());
    
        expect(res.statusCode).toBe(404);
    })

    it("retorna 204 e apaga a exclusão quando encontrada", async () => {
        const { req, res } = buildReqRes({ params: { exclusionId: "5" } });

        prismaMock.groupExclusion.findUnique.mockResolvedValue({
            id: 5,
            groupId: 10,
            userAId: 2,
            userBId: 3,
        } as any);

        await deleteExclusion(req, res, jest.fn());

        expect(res.statusCode).toBe(204);
        expect(prismaMock.groupExclusion.delete).toHaveBeenCalledWith({ where: { id: 5 } });
    });
});