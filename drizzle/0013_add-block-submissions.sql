CREATE TABLE `block_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`block_name` text NOT NULL,
	`submitter_name` text NOT NULL,
	`email` text NOT NULL,
	`project_description` text NOT NULL,
	`project_url` text NOT NULL,
	`icon_url` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`admin_notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
