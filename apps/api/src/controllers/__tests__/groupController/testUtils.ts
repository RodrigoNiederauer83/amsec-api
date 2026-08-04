import httpMocks from "node-mocks-http";
import { Response } from "express";

export function buildReqRes(options: { userId?: number; group?: any; body?: any; params?: any } = {}) {
  const req: any = httpMocks.createRequest();
  req.userId = options.userId ?? 1;
  req.group = options.group ?? { id: 10, ownerId: 1, name: "Teste" };
  req.body = options.body ?? {};
  if (options.params) req.params = options.params;

  const res = httpMocks.createResponse<Response>();

  return { req, res };
}