import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { runMigrations, appConfig } from "./config";
import { qrModule } from "./modules/qr";
import logixlysia from "logixlysia"
import { sql } from "./config"
await runMigrations();

const app = new Elysia()
  .use(cors())
  .use(logixlysia({
    config: {
      showStartupMessage: true,
      startupMessageFormat: "banner",
      useColors: true,
    },
  }))
  .get("/health", async () => {
    const [{ now }] = await sql`SELECT NOW() as now`
    return { status: "ok", db: "connected", time: now }
  })
  .use(qrModule)
  .listen(appConfig.serverPort, () => {
    console.log(`Elysia is running at ${appConfig.serverPort}`);
  });
