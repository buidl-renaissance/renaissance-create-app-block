ALTER TABLE `users` ADD `renaissanceUserId` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_renaissanceUserId_unique` ON `users` (`renaissanceUserId`);