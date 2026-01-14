CREATE TABLE `app_block_installations` (
	`id` text PRIMARY KEY NOT NULL,
	`consumer_app_block_id` text NOT NULL,
	`provider_app_block_id` text NOT NULL,
	`granted_scopes` text NOT NULL,
	`auth_type` text DEFAULT 'user' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`approved_at` integer,
	`last_used_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`consumer_app_block_id`) REFERENCES `app_blocks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_app_block_id`) REFERENCES `app_blocks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `app_block_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`app_block_id` text NOT NULL,
	`base_api_url` text NOT NULL,
	`api_version` text DEFAULT 'v1' NOT NULL,
	`auth_methods` text DEFAULT '["user"]' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`rate_limit_per_minute` integer DEFAULT 120,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`app_block_id`) REFERENCES `app_blocks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_block_providers_app_block_id_unique` ON `app_block_providers` (`app_block_id`);--> statement-breakpoint
CREATE TABLE `app_block_registry` (
	`id` text PRIMARY KEY NOT NULL,
	`app_block_id` text NOT NULL,
	`slug` text NOT NULL,
	`display_name` text NOT NULL,
	`description` text,
	`icon_url` text,
	`category` text DEFAULT 'other' NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`installable` integer DEFAULT true NOT NULL,
	`requires_approval` integer DEFAULT false NOT NULL,
	`contact_email` text,
	`contact_url` text,
	`tags` text,
	`featured_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`app_block_id`) REFERENCES `app_blocks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_block_registry_app_block_id_unique` ON `app_block_registry` (`app_block_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `app_block_registry_slug_unique` ON `app_block_registry` (`slug`);--> statement-breakpoint
CREATE TABLE `provider_scopes` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`scope_name` text NOT NULL,
	`description` text,
	`is_public_read` integer DEFAULT false NOT NULL,
	`required_role` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `app_block_providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `farcaster_accounts`;