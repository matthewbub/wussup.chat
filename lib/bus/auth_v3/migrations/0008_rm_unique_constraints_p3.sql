-- Migration number: 0008 	 2024-12-29T06:00:00.000Z

-- First recreate the users table properly with all constraints
CREATE TABLE users_new (
    id TEXT PRIMARY KEY,
    email TEXT,
    username TEXT,
    password TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending', 'deleted', 'temporarily_locked')),
    failed_login_attempts INTEGER DEFAULT 0,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    locked_until DATETIME,
    status_before_lockout TEXT CHECK (status IN ('active', 'suspended', 'pending', 'deleted', 'temporarily_locked')),
    app_id TEXT REFERENCES apps(id)
);

-- Copy the data
INSERT INTO users_new SELECT * FROM users;

-- Drop the broken table
DROP TABLE users;

-- Rename the fixed table
ALTER TABLE users_new RENAME TO users;

-- Recreate the indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_app_id ON users(app_id);
