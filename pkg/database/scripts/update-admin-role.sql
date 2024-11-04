-- sqlite3 ./pkg/database/dev.db < ./pkg/database/scripts/update-admin-role.sql
UPDATE users 
SET application_environment_role = 'admin'
WHERE id = ''; -- user id

