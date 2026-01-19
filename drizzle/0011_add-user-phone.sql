-- Add phone field to users table for local auth
ALTER TABLE users ADD COLUMN phone TEXT;

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
