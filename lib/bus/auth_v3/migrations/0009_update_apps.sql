-- Migration number: 0009 	 2024-12-29T07:06:04.934Z
-- add created_by to apps table
alter table apps add column created_by text references users(id);

-- -- temp rename status to old_status to preserve data and avoid breaking changes
ALTER TABLE users RENAME COLUMN role TO old_role;

-- -- apply updates as if its a new column, 
-- -- we are adding constraints and modifying the default value 
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- -- copy old_status to status
UPDATE users SET role = old_role;

-- -- drop the old_status column
ALTER TABLE users DROP COLUMN old_role;
