-- Add back the old column as TEXT
ALTER TABLE transactions ADD COLUMN amount_old TEXT;

-- Migrate data from the new column to the old column
UPDATE transactions
SET amount_old = printf('$%.2f', amount);

-- Drop the new column
ALTER TABLE transactions DROP COLUMN amount;

-- Rename the old column back to 'amount'
ALTER TABLE transactions RENAME COLUMN amount_old TO amount;