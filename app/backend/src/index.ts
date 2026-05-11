import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { runMigrations, appConfig } from "./config";
import { qrModule } from "./modules/qr";
import logixlysia from "logixlysia";
import { sql } from "./config";
import { register, httpRequestsTotal, httpRequestDuration } from "./metrics";
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
  .onBeforeHandle(({ store }) => {
    (store as any).__metricsStart = performance.now();
  })
  .onAfterHandle(({ request, set, store }) => {
    const url = new URL(request.url);
    const duration = (performance.now() - (store as any).__metricsStart) / 1000;
    const status = String(set.status ?? 200);
    httpRequestsTotal.inc({ method: request.method, path: url.pathname, status });
    httpRequestDuration.observe({ method: request.method, path: url.pathname, status }, duration);
  })
  .get("/metrics", async ({ set }) => {
    set.headers["content-type"] = register.contentType;
    return register.metrics();
  })
  .get("/health", async () => {
    const [{ now }] = await sql`SELECT NOW() as now`
    return { status: "ok", db: "connected", time: now }
  })
  .use(qrModule)
  .listen(appConfig.serverPort, () => {
    console.log(`Elysia is running at ${appConfig.serverPort}`);
  });
