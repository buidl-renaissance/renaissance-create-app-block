-- Add GitHub URL and App URL columns to app_blocks table
ALTER TABLE app_blocks ADD COLUMN github_url TEXT;
ALTER TABLE app_blocks ADD COLUMN app_url TEXT;
