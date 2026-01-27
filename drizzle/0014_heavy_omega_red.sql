ALTER TABLE `users` RENAME COLUMN "renaissanceUserId" TO "renaissanceId";--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN "publicAddress" TO "accountAddress";--> statement-breakpoint
DROP INDEX `users_renaissanceUserId_unique`;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` text;--> statement-breakpoint
ALTER TABLE `users` ADD `email` text;--> statement-breakpoint
ALTER TABLE `users` ADD `name` text;--> statement-breakpoint
ALTER TABLE `users` ADD `profilePicture` text;--> statement-breakpoint
ALTER TABLE `users` ADD `pinHash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `failedPinAttempts` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `lockedAt` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `status` text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `users` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_renaissanceId_unique` ON `users` (`renaissanceId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);--> statement-breakpoint
ALTER TABLE `app_blocks` ADD `github_url` text;--> statement-breakpoint
ALTER TABLE `app_blocks` ADD `app_url` text;--> statement-breakpoint
ALTER TABLE `app_blocks` ADD `tags` text;