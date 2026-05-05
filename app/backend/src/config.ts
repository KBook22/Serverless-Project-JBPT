import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

export const appConfig = {
  host: process.env.POSTGRES_HOST ?? "localhost",
  port: Number(process.env.POSTGRES_PORT ?? 5435),
  user: process.env.POSTGRES_USER ?? "postgres",
  password: process.env.POSTGRES_PASSWORD ?? "postgres",
  database: process.env.POSTGRES_DB ?? "jbptdb",
  serverPort: Number(process.env.PORT ?? 3000),
};

export const sql = postgres({
  host: appConfig.host,
  port: appConfig.port,
  user: appConfig.user,
  password: appConfig.password,
  database: appConfig.database,
});

export async function runMigrations(): Promise<void> {
  const migrationPath = join(import.meta.dir, "../../database/migration/001_inti.sql");
  const migrationSql = readFileSync(migrationPath, "utf-8");
  await sql.unsafe(migrationSql);
  console.log("Migrations applied successfully");
}
