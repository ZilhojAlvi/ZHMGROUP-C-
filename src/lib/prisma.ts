import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton.
 * In dev, Next.js hot-reloads modules which would otherwise create a new
 * PrismaClient (and a new DB connection pool) on every file change. We
 * stash the instance on `globalThis` to reuse it across reloads.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
