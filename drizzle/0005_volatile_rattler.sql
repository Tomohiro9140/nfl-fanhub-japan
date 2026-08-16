CREATE TABLE `external_availability_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`external_id` varchar(191) NOT NULL,
	`team_code` varchar(3) NOT NULL,
	`player_name` varchar(191) NOT NULL,
	`status_label` varchar(64) NOT NULL,
	`headline` text NOT NULL,
	`source_name` varchar(128) NOT NULL,
	`source_url` varchar(1024) NOT NULL,
	`published_at` timestamp NOT NULL,
	`fetched_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `external_availability_insights_id` PRIMARY KEY(`id`),
	CONSTRAINT `external_availability_insights_external_id_uq` UNIQUE(`external_id`)
);
--> statement-breakpoint
CREATE INDEX `external_availability_insights_team_published_idx` ON `external_availability_insights` (`team_code`,`published_at`);