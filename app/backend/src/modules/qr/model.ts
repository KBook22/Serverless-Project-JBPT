import { t, type Static } from "elysia";

export const upsertQrBody = t.Object({
  content: t.String({ minLength: 1 }),
  input_type: t.Union([t.Literal("url"), t.Literal("plaintext")]),
});

export type UpsertQrBody = Static<typeof upsertQrBody>;

export interface QrCode {
  id: number;
  input_type: "url" | "plaintext";
  content: string;
  hash: string;
  download_count: number;
  created_at: Date;
}

export interface UpsertResult {
  success: boolean;
  data: QrCode & { created: boolean };
}
