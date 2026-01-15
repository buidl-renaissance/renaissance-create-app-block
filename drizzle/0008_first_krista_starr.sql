CREATE TABLE `pending_app_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`block_name` text NOT NULL,
	`block_type` text NOT NULL,
	`prd_data` text NOT NULL,
	`summary_data` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`notification_sent` integer DEFAULT false NOT NULL,
	`admin_notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
