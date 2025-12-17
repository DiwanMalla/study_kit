import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

export const db =
  ((globalForPrisma.prisma &&
  Boolean((globalForPrisma.prisma as unknown as { summary?: unknown }).summary)
    ? globalForPrisma.prisma
    : new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query"] : [],
      })) as PrismaClient);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
