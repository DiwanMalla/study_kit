import path from "node:path";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),

  datasource: {
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!,
  },

  migrate: {
    async url() {
      // Use direct database URL for migrations (not Accelerate URL)
      return process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!;
    },
    async shadowDatabaseUrl() {
      return process.env.SHADOW_DATABASE_URL;
    },
  },
});
