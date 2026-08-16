CREATE TABLE `official_scoreboard_games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`external_id` varchar(191) NOT NULL,
	`season` int NOT NULL,
	`season_phase` enum('preseason','regular','postseason') NOT NULL,
	`week_label` varchar(32),
	`away_team_code` varchar(3) NOT NULL,
	`home_team_code` varchar(3) NOT NULL,
	`away_score` int,
	`home_score` int,
	`game_state` varchar(32) NOT NULL,
	`game_url` varchar(1024) NOT NULL,
	`source_url` varchar(1024) NOT NULL,
	`fetched_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `official_scoreboard_games_id` PRIMARY KEY(`id`),
	CONSTRAINT `official_scoreboard_games_external_id_uq` UNIQUE(`external_id`)
);
--> statement-breakpoint
CREATE TABLE `official_standings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`external_id` varchar(191) NOT NULL,
	`season` int NOT NULL,
	`season_type` varchar(24) NOT NULL,
	`team_code` varchar(3) NOT NULL,
	`wins` int NOT NULL,
	`losses` int NOT NULL,
	`ties` int NOT NULL,
	`pct` varchar(12) NOT NULL,
	`points_for` int,
	`points_against` int,
	`source_url` varchar(1024) NOT NULL,
	`fetched_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `official_standings_id` PRIMARY KEY(`id`),
	CONSTRAINT `official_standings_external_id_uq` UNIQUE(`external_id`)
);
--> statement-breakpoint
CREATE INDEX `official_scoreboard_games_season_state_idx` ON `official_scoreboard_games` (`season`,`game_state`);--> statement-breakpoint
CREATE INDEX `official_standings_season_team_idx` ON `official_standings` (`season`,`team_code`);