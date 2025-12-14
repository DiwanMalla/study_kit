import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
};

function createPrismaClient() {
  const client = new PrismaClient();
  
  // Only use Accelerate if ACCELERATE_URL is provided
  if (process.env.ACCELERATE_URL) {
    return client.$extends(withAccelerate());
  }
  
  return client;
}

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
