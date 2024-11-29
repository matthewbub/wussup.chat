-- Add a temporary column to store cleaned data
ALTER TABLE transactions ADD COLUMN amount_cleaned REAL;

-- Migrate data from the old column to the new column
UPDATE transactions
SET amount_cleaned = CAST(REPLACE(REPLACE(amount, '$', ''), ',', '') AS REAL);

-- Drop the old column
ALTER TABLE transactions DROP COLUMN amount;

-- Rename the new column to 'amount'
ALTER TABLE transactions RENAME COLUMN amount_cleaned TO amount;