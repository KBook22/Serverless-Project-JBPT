CREATE TABLE IF NOT EXISTS qr_codes (
  id             SERIAL PRIMARY KEY,
  input_type     VARCHAR(10) NOT NULL CHECK (input_type IN ('url', 'plaintext')),
  content        TEXT NOT NULL,
  hash           VARCHAR(64) UNIQUE NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_qr_codes_hash ON qr_codes(hash);