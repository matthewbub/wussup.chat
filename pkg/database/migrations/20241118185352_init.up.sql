CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    application_environment_role TEXT NOT NULL DEFAULT 'user' CHECK (application_environment_role IN ('admin', 'user')),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    security_questions_answered BOOLEAN DEFAULT FALSE,
    -- is_active BOOLEAN DEFAULT TRUE,
    inactive_at TIMESTAMP
    CONSTRAINT chk_user_state CHECK (
        (inactive_at IS NULL) OR 
        (inactive_at <= CURRENT_TIMESTAMP)
    )
);

CREATE VIEW active_users AS 
SELECT *,
--        TODO : Make this do something lol
       inactive_at IS NULL as is_active 
FROM users;

CREATE TABLE IF NOT EXISTS security_questions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    question_1 TEXT NOT NULL,
    answer_1 TEXT NOT NULL,
    question_2 TEXT NOT NULL,
    answer_2 TEXT NOT NULL,
    question_3 TEXT NOT NULL,
    answer_3 TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS password_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_password_history_user_id ON password_history(user_id);
CREATE INDEX idx_security_questions_user_id ON security_questions(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INTEGER PRIMARY KEY,
    use_markdown BOOLEAN DEFAULT TRUE,
    color_theme TEXT DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    description TEXT NOT NULL,
    amount TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);