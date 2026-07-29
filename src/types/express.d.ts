import { Group } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            userId?: number;
            group?: Group;
        }
    }
}

export {};