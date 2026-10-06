import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx --env-file=.env prisma/seed.ts",
  },
  datasource: {
    // Not needed by `prisma generate`, so it must not throw when unset (e.g. at install time).
    url: process.env.DIRECT_URL ?? "",
  },
});