import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const accelerateUrl = process.env.PRISMA_DATABASE_URL ?? process.env.DATABASE_URL;
if (!accelerateUrl) {
  throw new Error("Missing PRISMA_DATABASE_URL or DATABASE_URL (Accelerate URL)");
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    accelerateUrl,
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
