-- Add GitHub configuration fields to app_blocks table for workflow dispatch
ALTER TABLE app_blocks ADD COLUMN github_repo_owner TEXT;
ALTER TABLE app_blocks ADD COLUMN github_repo_name TEXT;
ALTER TABLE app_blocks ADD COLUMN github_workflow_file TEXT;
ALTER TABLE app_blocks ADD COLUMN github_branch TEXT DEFAULT 'main';
