-- Migration number: 0002 	 2024-12-23T07:11:10.534Z
ALTER TABLE users ADD COLUMN locked_until DATETIME;

-- temp rename status to old_status to preserve data and avoid breaking changes
ALTER TABLE users RENAME COLUMN status TO old_status;

-- apply updates as if its a new column, 
-- we are adding constraints and modifying the default value 
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'suspended', 'pending', 'deleted', 'temporarily_locked'));

-- copy old_status to status
UPDATE users SET status = old_status;

-- drop the old_status column
ALTER TABLE users DROP COLUMN old_status;
