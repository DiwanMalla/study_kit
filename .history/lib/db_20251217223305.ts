import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);

export const db =
  (globalForPrisma.prisma && (globalForPrisma.prisma as any).summary
    ? globalForPrisma.prisma
    : new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query"] : [],
      }));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
