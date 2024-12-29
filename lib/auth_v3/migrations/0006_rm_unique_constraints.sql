-- Migration number: 0006 	 2024-12-29T04:38:50.081Z

ALTER TABLE users ADD COLUMN email_v2 TEXT;
ALTER TABLE users ADD COLUMN username_v2 TEXT;


-- rename email and username to old_email and old_username to preserve data
ALTER TABLE users RENAME COLUMN email TO old_email;
ALTER TABLE users RENAME COLUMN username TO old_username;

UPDATE users SET email_v2 = old_email;
UPDATE users SET username_v2 = old_username;

-- rename email_v2 to email and username_v2 to username
ALTER TABLE users RENAME COLUMN email_v2 TO email;
ALTER TABLE users RENAME COLUMN username_v2 TO username;

-- drop the old_email and old_username columns
-- TODO: One day ill figure out how to drop this
-- ALTER TABLE users DROP COLUMN old_email;
-- ALTER TABLE users DROP COLUMN old_username;
