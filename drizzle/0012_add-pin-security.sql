-- Add PIN security and role fields to users table
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN name TEXT;
ALTER TABLE users ADD COLUMN profilePicture TEXT;
ALTER TABLE users ADD COLUMN accountAddress TEXT;
ALTER TABLE users ADD COLUMN pinHash TEXT;
ALTER TABLE users ADD COLUMN failedPinAttempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN lockedAt INTEGER;
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' NOT NULL;

-- Rename renaissanceUserId to renaissanceId for consistency
-- Note: SQLite doesn't support RENAME COLUMN directly in older versions,
-- so we create a new column and copy data if needed
ALTER TABLE users ADD COLUMN renaissanceId TEXT UNIQUE;
UPDATE users SET renaissanceId = renaissanceUserId WHERE renaissanceUserId IS NOT NULL;
