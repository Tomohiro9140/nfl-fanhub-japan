CREATE TABLE `official_feed_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`external_id` varchar(191) NOT NULL,
	`team_code` varchar(3) NOT NULL,
	`source_kind` enum('team_official','nfl_official') NOT NULL,
	`source_name` varchar(128) NOT NULL,
	`source_url` varchar(1024) NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`category` enum('news','injury') NOT NULL DEFAULT 'news',
	`published_at` timestamp NOT NULL,
	`fetched_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `official_feed_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `official_feed_items_external_id_uq` UNIQUE(`external_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `official_feed_items_team_published_idx` ON `official_feed_items` (`team_code`,`published_at`);