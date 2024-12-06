CREATE TABLE IF NOT EXISTS pdf_processing (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pages_processed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_pdf_processing_user_id ON pdf_processing(user_id);
