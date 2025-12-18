import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export const db =
  globalForPrisma.prisma && (globalForPrisma.prisma as any).summary
    ? globalForPrisma.prisma
    : new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
