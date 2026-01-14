CREATE TABLE `access_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`subject_type` text NOT NULL,
	`subject_id` text NOT NULL,
	`app_block_id` text,
	`scopes` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`app_block_id`) REFERENCES `app_blocks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `access_tokens_token_unique` ON `access_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `app_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner_user_id` text NOT NULL,
	`service_account_id` text,
	`description` text,
	`icon_url` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `connector_installations` (
	`id` text PRIMARY KEY NOT NULL,
	`app_block_id` text NOT NULL,
	`connector_id` text NOT NULL,
	`granted_scopes` text NOT NULL,
	`auth_type` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`last_used_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`app_block_id`) REFERENCES `app_blocks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`connector_id`) REFERENCES `connectors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `connector_recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`connector_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`scopes` text NOT NULL,
	`ui_modules` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`connector_id`) REFERENCES `connectors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `connectors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon_url` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scopes` (
	`id` text PRIMARY KEY NOT NULL,
	`connector_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`required_role` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`connector_id`) REFERENCES `connectors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `service_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`app_block_id` text NOT NULL,
	`api_key_hash` text NOT NULL,
	`last_rotated_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`app_block_id`) REFERENCES `app_blocks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_accounts_app_block_id_unique` ON `service_accounts` (`app_block_id`);