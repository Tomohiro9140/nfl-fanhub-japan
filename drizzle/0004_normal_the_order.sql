ALTER TABLE `official_scoreboard_games` ADD `nfl_highlight_url` varchar(1024);--> statement-breakpoint
ALTER TABLE `official_scoreboard_games` ADD `nfl_highlight_source_url` varchar(1024);--> statement-breakpoint
ALTER TABLE `official_scoreboard_games` ADD `nfl_highlight_matched_at` timestamp;--> statement-breakpoint
CREATE INDEX `official_scoreboard_games_nfl_highlight_idx` ON `official_scoreboard_games` (`nfl_highlight_url`);