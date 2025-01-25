-- Migration number: 0003 	 2024-12-23T07:29:31.768Z
ALTER TABLE users ADD COLUMN status_before_lockout TEXT CHECK (status IN ('active', 'suspended', 'pending', 'deleted', 'temporarily_locked'));