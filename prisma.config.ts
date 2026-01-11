import path from "node:path";
import { defineConfig } from "@prisma/config";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),

  datasource: {
    url:
      process.env.DIRECT_DATABASE_URL ??
      process.env.PRISMA_DATABASE_URL ??
      process.env.DATABASE_URL ??
      "postgresql://localhost:5432/postgres",
  },

  migrate: {
    async url() {
      return (
        process.env.DIRECT_DATABASE_URL ??
        process.env.DATABASE_URL ??
        process.env.PRISMA_DATABASE_URL ??
        "postgresql://localhost:5432/postgres"
      );
    },
    async shadowDatabaseUrl() {
      return process.env.SHADOW_DATABASE_URL;
    },
  },
} as any);
