import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { env } from "../config/env";

const adapter = new PrismaBetterSqlite3({
    url: env.DATABASE_URL || "file:./prisma/dev.db",
});

export const prisma = new PrismaClient({ adapter });