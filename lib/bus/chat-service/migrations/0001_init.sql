-- Migration number: 0001 	 2025-01-12T06:50:08.546Z


CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  prefer_dark_mode BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS message (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  text TEXT,
  role TEXT,
  thread_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (thread_id) REFERENCES threads(id)
);

CREATE TABLE IF NOT EXISTS threads (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  title TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- TODO:
-- CREATE TABLE subscriptions (
--   id TEXT PRIMARY KEY AUTOINCREMENT,
--   user_id TEXT,
--   stripe_customer_id TEXT,
--   stripe_subscription_id TEXT,
--   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (user_id) REFERENCES users(id)
-- );

-- we should track the user's messages and the AI's responses (remember there are threads)
-- we should track token usage
-- we should track the users billing information
-- we should track the users account information
-- we should track the users preferences