CREATE TABLE `official_games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`external_id` varchar(191) NOT NULL,
	`team_code` varchar(3) NOT NULL,
	`opponent_code` varchar(3) NOT NULL,
	`home_away` enum('home','away') NOT NULL,
	`season_phase` enum('preseason','regular','postseason') NOT NULL,
	`week_label` varchar(32),
	`kickoff_at` timestamp NOT NULL,
	`venue` varchar(191),
	`broadcast` varchar(191),
	`source_url` varchar(1024) NOT NULL,
	`fetched_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `official_games_id` PRIMARY KEY(`id`),
	CONSTRAINT `official_games_external_id_uq` UNIQUE(`external_id`)
);
--> statement-breakpoint
CREATE TABLE `official_roster_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`external_id` varchar(191) NOT NULL,
	`team_code` varchar(3) NOT NULL,
	`player_name` varchar(191) NOT NULL,
	`jersey_number` varchar(16),
	`position` varchar(24) NOT NULL,
	`roster_status` varchar(96) NOT NULL,
	`source_url` varchar(1024) NOT NULL,
	`fetched_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `official_roster_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `official_roster_entries_external_id_uq` UNIQUE(`external_id`)
);
--> statement-breakpoint
CREATE INDEX `official_games_team_kickoff_idx` ON `official_games` (`team_code`,`kickoff_at`);--> statement-breakpoint
CREATE INDEX `official_roster_entries_team_status_idx` ON `official_roster_entries` (`team_code`,`roster_status`);