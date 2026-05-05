import { Elysia } from "elysia";
import { upsertQrBody } from "./model";
import { QrService } from "./service";

export const qrModule = new Elysia({ prefix: "/qr" })
  .get("/history", async () => {
    try {
      return await QrService.history();
    } catch (error) {
      return { success: false, error: "Failed to fetch history" };
    }
  })
  .post(
  "/upsert",
  async ({ body }) => {
    try {
      return await QrService.upsert(body);
    } catch (error) {
      return { success: false, error: "Failed to save QR code" };
    }
  },
  { body: upsertQrBody }
);
