const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface QrCode {
  id: number;
  input_type: 'url' | 'plaintext';
  content: string;
  hash: string;
  download_count: number;
  created_at: string;
}

export const api = {
  async upsert(content: string, input_type: 'url' | 'plaintext') {
    const res = await fetch(`${BASE}/qr/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, input_type }),
    });
    return res.json() as Promise<{ success: boolean; data?: QrCode & { created: boolean }; error?: string }>;
  },
};
