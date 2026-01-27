ALTER TABLE `app_blocks` ADD `github_repo_owner` text;--> statement-breakpoint
ALTER TABLE `app_blocks` ADD `github_repo_name` text;--> statement-breakpoint
ALTER TABLE `app_blocks` ADD `github_workflow_file` text;--> statement-breakpoint
ALTER TABLE `app_blocks` ADD `github_branch` text DEFAULT 'main';