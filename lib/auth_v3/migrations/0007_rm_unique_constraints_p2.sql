-- Migration number: 0007 	 2024-12-29T05:36:40.126Z

-- Create a new table without the unique constraints and old columns
CREATE TABLE users_new AS 
SELECT 
    id,
    email,
    username,
    password,
    email_verified,
    role,
    status,
    failed_login_attempts,
    last_login_at,
    created_at,
    updated_at,
    locked_until,
    status_before_lockout,
    app_id
FROM users;

-- Drop the old table with its constraints
DROP TABLE users;

-- Rename the new table to users
ALTER TABLE users_new RENAME TO users;

-- Recreate the non-unique indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_app_id ON users(app_id);
