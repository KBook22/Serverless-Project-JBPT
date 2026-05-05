import { sql } from "../../config";
import type { UpsertQrBody, QrCode, UpsertResult } from "./model";

export abstract class QrService {
  static normalize(content: string, input_type: "url" | "plaintext"): string {
    let normalized = content.trim().toLowerCase();
    if (input_type === "url") {
      normalized = normalized.replace(/\/+$/, "");
    }
    return normalized;
  }

  static async hash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  static async history(): Promise<{ success: boolean; data: QrCode[] }> {
    const rows = await sql<QrCode[]>`
      SELECT * FROM qr_codes
      ORDER BY download_count DESC
    `;
    return { success: true, data: rows };
  }

  static async upsert(body: UpsertQrBody): Promise<UpsertResult> {
    const normalized = QrService.normalize(body.content, body.input_type);
    const hash = await QrService.hash(normalized);

    const [row] = await sql<(QrCode & { created: boolean })[]>`
      INSERT INTO qr_codes (input_type, content, hash, download_count)
      VALUES (${body.input_type}, ${normalized}, ${hash}, 1)
      ON CONFLICT (hash)
      DO UPDATE SET
        download_count = qr_codes.download_count + 1
      RETURNING *, (xmax = 0) AS created
    `;

    return { success: true, data: row };
  }
}
