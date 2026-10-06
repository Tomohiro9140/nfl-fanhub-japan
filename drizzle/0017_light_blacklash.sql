ALTER TABLE `team_week_stats` ADD `offensePassEpa` double DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `offensePassEpaPlays` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `offenseRushEpa` double DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `offenseRushEpaPlays` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `offenseSuccessPlays` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `offenseTotalPlays` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `giveaways` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `defensePassEpaAllowed` double DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `defensePassEpaPlays` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `defenseRushEpaAllowed` double DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `defenseRushEpaPlays` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `defenseSuccessPlays` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `defenseTotalPlays` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `netPuntYards` double DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `startYardlineSum` double DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `team_week_stats` ADD `startDriveCount` int DEFAULT 0 NOT NULL;