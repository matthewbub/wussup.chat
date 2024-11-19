DROP TABLE IF EXISTS user_preferences;

DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_security_questions_user_id;
DROP INDEX IF EXISTS idx_password_history_user_id;
DROP INDEX IF EXISTS idx_sessions_session_token;
DROP INDEX IF EXISTS idx_sessions_user_id;

DROP TABLE IF EXISTS password_history;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS security_questions;
DROP VIEW IF EXISTS active_users;
DROP TABLE IF EXISTS users;
