CREATE TABLE IF NOT EXISTS bank_statements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_number TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    statement_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    statement_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    description TEXT NOT NULL,
    amount TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
    FOREIGN KEY (statement_id) REFERENCES bank_statements (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_bank_statements_account_number ON bank_statements(account_number);
CREATE INDEX idx_transactions_statement_id ON transactions(statement_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);