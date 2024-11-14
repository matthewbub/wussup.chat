DROP TABLE IF EXISTS bank_statements;
DROP TABLE IF EXISTS transactions;

DROP INDEX IF EXISTS idx_bank_statements_account_number;
DROP INDEX IF EXISTS idx_transactions_statement_id;
DROP INDEX IF EXISTS idx_transactions_date;
DROP INDEX IF EXISTS idx_transactions_user_id;