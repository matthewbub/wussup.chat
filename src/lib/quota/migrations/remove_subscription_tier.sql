-- Remove subscription_tier column from users table
ALTER TABLE users DROP COLUMN subscription_tier;

-- Drop the subscription_tier enum type if it exists
DROP TYPE IF EXISTS subscription_tier; 