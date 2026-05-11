import { Registry, collectDefaultMetrics, Counter, Histogram } from "prom-client";

export const register = new Registry();

collectDefaultMetrics({ register });

// นับจำนวน request ที่เข้ามา
export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status"] as const,
  registers: [register],
});

// วัดเวลา response
export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "path", "status"] as const,
  buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});
