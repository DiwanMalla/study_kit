// Temporary config file for running Prisma CLI commands against the
// Prisma Accelerate endpoint (DATABASE_URL). This file was added to
// make it explicit and easy to push schema/state to the accelerate DB.
//
// Keep this file only if you intend to regularly target the accelerate
// database from the CLI. Otherwise delete it after use to avoid
// accidental remote pushes.

import path from 'node:path';
import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';

// Load environment variables (same order as prisma.config.ts)
config({ path: '.env.local' });
config({ path: '.env' });

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),

  // Use the accelerate URL from env for this config
  datasource: {
    url: process.env.DATABASE_URL!,
  },

  migrate: {
    async url() {
      return process.env.DATABASE_URL!;
    },
    async shadowDatabaseUrl() {
      return process.env.SHADOW_DATABASE_URL;
    },
  },
} as any);
