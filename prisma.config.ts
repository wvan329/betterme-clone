import { defineConfig } from "prisma/config";

// Docker 环境直接注入 DATABASE_URL，本地开发用 .env + dotenv
const databaseUrl = process.env["DATABASE_URL"] ||
  "postgres://postgres:postgres@db:5432/betterme?sslmode=disable";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
