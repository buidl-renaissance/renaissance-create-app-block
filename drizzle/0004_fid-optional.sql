PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`fid` text,
	`username` text,
	`displayName` text,
	`pfpUrl` text,
	`publicAddress` text,
	`peopleUserId` integer,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "fid", "username", "displayName", "pfpUrl", "publicAddress", "peopleUserId", "createdAt", "updatedAt") SELECT "id", "fid", "username", "displayName", "pfpUrl", "publicAddress", "peopleUserId", "createdAt", "updatedAt" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_fid_unique` ON `users` (`fid`);