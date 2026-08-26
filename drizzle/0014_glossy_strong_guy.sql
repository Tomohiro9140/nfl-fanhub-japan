CREATE TABLE `official_game_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`game_external_id` varchar(191) NOT NULL,
	`game_url` varchar(1024) NOT NULL,
	`source_url` varchar(1024) NOT NULL,
	`away_team_code` varchar(3) NOT NULL,
	`home_team_code` varchar(3) NOT NULL,
	`payload` text NOT NULL,
	`fetched_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `official_game_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `official_game_stats_external_uq` UNIQUE(`game_external_id`)
);
