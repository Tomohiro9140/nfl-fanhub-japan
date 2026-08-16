ALTER TABLE `official_games` ADD `dazn_url` varchar(1024);--> statement-breakpoint
ALTER TABLE `official_games` ADD `dazn_source_url` varchar(1024);--> statement-breakpoint
ALTER TABLE `official_games` ADD `dazn_matched_at` timestamp;--> statement-breakpoint
CREATE INDEX `official_games_dazn_url_idx` ON `official_games` (`dazn_url`);