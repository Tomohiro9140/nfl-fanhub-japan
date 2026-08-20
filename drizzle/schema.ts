import { boolean, double, index, int, mysqlEnum, mysqlTable, text, timestamp, tinyint, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Cached snippets from official and approved public NFL news feeds. Full article bodies are not stored. */
export const officialFeedItems = mysqlTable("official_feed_items", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("external_id", { length: 191 }).notNull(),
  teamCode: varchar("team_code", { length: 3 }).notNull(),
  sourceKind: mysqlEnum("source_kind", ["team_official", "nfl_official", "pft", "cbs"]).notNull(),
  sourceName: varchar("source_name", { length: 128 }).notNull(),
  sourceUrl: varchar("source_url", { length: 1024 }).notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  /** Generated from a transient fetch of the official source; article bodies are never persisted. */
  japaneseSummary: text("japanese_summary"),
  japaneseSummaryFetchedAt: timestamp("japanese_summary_fetched_at"),
  /** Detailed English summary generated from a transient official article fetch; article bodies are never persisted. */
  englishSummary: text("english_summary"),
  englishSummaryFetchedAt: timestamp("english_summary_fetched_at"),
  category: mysqlEnum("category", ["news", "injury", "transaction"]).notNull().default("news"),
  publishedAt: timestamp("published_at").notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("official_feed_items_external_id_uq").on(table.externalId),
  index("official_feed_items_team_published_idx").on(table.teamCode, table.publishedAt),
]);

export type OfficialFeedItem = typeof officialFeedItems.$inferSelect;
export type InsertOfficialFeedItem = typeof officialFeedItems.$inferInsert;

/** Next and recent games parsed from an official team schedule page. */
export const officialGames = mysqlTable("official_games", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("external_id", { length: 191 }).notNull(),
  teamCode: varchar("team_code", { length: 3 }).notNull(),
  opponentCode: varchar("opponent_code", { length: 3 }).notNull(),
  homeAway: mysqlEnum("home_away", ["home", "away"]).notNull(),
  seasonPhase: mysqlEnum("season_phase", ["preseason", "regular", "postseason"]).notNull(),
  weekLabel: varchar("week_label", { length: 32 }),
  kickoffAt: timestamp("kickoff_at").notNull(),
  venue: varchar("venue", { length: 191 }),
  broadcast: varchar("broadcast", { length: 191 }),
  sourceUrl: varchar("source_url", { length: 1024 }).notNull(),
  /** Optional individual DAZN event URL, filled only from a published structured source. */
  daznUrl: varchar("dazn_url", { length: 1024 }),
  daznSourceUrl: varchar("dazn_source_url", { length: 1024 }),
  daznMatchedAt: timestamp("dazn_matched_at"),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("official_games_external_id_uq").on(table.externalId),
  index("official_games_team_kickoff_idx").on(table.teamCode, table.kickoffAt),
  index("official_games_dazn_url_idx").on(table.daznUrl),
]);

export type OfficialGame = typeof officialGames.$inferSelect;
export type InsertOfficialGame = typeof officialGames.$inferInsert;

/** Official roster snapshots, with the club-provided roster bucket retained as status. */
export const officialRosterEntries = mysqlTable("official_roster_entries", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("external_id", { length: 191 }).notNull(),
  teamCode: varchar("team_code", { length: 3 }).notNull(),
  playerName: varchar("player_name", { length: 191 }).notNull(),
  jerseyNumber: varchar("jersey_number", { length: 16 }),
  position: varchar("position", { length: 24 }).notNull(),
  rosterStatus: varchar("roster_status", { length: 96 }).notNull(),
  sourceUrl: varchar("source_url", { length: 1024 }).notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("official_roster_entries_external_id_uq").on(table.externalId),
  index("official_roster_entries_team_status_idx").on(table.teamCode, table.rosterStatus),
]);

export type OfficialRosterEntry = typeof officialRosterEntries.$inferSelect;
export type InsertOfficialRosterEntry = typeof officialRosterEntries.$inferInsert;

/** Public PFT availability headlines matched to a current official roster entry. Article bodies are never stored. */
export const externalAvailabilityInsights = mysqlTable("external_availability_insights", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("external_id", { length: 191 }).notNull(),
  teamCode: varchar("team_code", { length: 3 }).notNull(),
  playerName: varchar("player_name", { length: 191 }).notNull(),
  statusLabel: varchar("status_label", { length: 64 }).notNull(),
  headline: text("headline").notNull(),
  sourceName: varchar("source_name", { length: 128 }).notNull(),
  sourceUrl: varchar("source_url", { length: 1024 }).notNull(),
  publishedAt: timestamp("published_at").notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("external_availability_insights_external_id_uq").on(table.externalId),
  index("external_availability_insights_team_published_idx").on(table.teamCode, table.publishedAt),
]);

export type ExternalAvailabilityInsight = typeof externalAvailabilityInsights.$inferSelect;
export type InsertExternalAvailabilityInsight = typeof externalAvailabilityInsights.$inferInsert;

/** Regular-season standings parsed from the official NFL standings page. */
export const officialStandings = mysqlTable("official_standings", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("external_id", { length: 191 }).notNull(),
  season: int("season").notNull(),
  seasonType: varchar("season_type", { length: 24 }).notNull(),
  teamCode: varchar("team_code", { length: 3 }).notNull(),
  wins: int("wins").notNull(),
  losses: int("losses").notNull(),
  ties: int("ties").notNull(),
  pct: varchar("pct", { length: 12 }).notNull(),
  pointsFor: int("points_for"),
  pointsAgainst: int("points_against"),
  sourceUrl: varchar("source_url", { length: 1024 }).notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("official_standings_external_id_uq").on(table.externalId),
  index("official_standings_season_team_idx").on(table.season, table.teamCode),
]);

export type OfficialStanding = typeof officialStandings.$inferSelect;
export type InsertOfficialStanding = typeof officialStandings.$inferInsert;

/** Current official scores/results parsed from the NFL schedules page. */
export const officialScoreboardGames = mysqlTable("official_scoreboard_games", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("external_id", { length: 191 }).notNull(),
  season: int("season").notNull(),
  seasonPhase: mysqlEnum("season_phase", ["preseason", "regular", "postseason"]).notNull(),
  weekLabel: varchar("week_label", { length: 32 }),
  awayTeamCode: varchar("away_team_code", { length: 3 }).notNull(),
  homeTeamCode: varchar("home_team_code", { length: 3 }).notNull(),
  awayScore: int("away_score"),
  homeScore: int("home_score"),
  gameState: varchar("game_state", { length: 32 }).notNull(),
  /** Official local calendar date for a completed game when a kickoff time is no longer published. */
  gameDate: varchar("game_date", { length: 10 }),
  /** First time this game was confirmed FINAL/COMPLETED by the official scoreboard. */
  finalRecordedAt: timestamp("final_recorded_at"),
  gameUrl: varchar("game_url", { length: 1024 }).notNull(),
  /** Individual NFL-published highlights URL, retained only after team/week verification. */
  nflHighlightUrl: varchar("nfl_highlight_url", { length: 1024 }),
  nflHighlightSourceUrl: varchar("nfl_highlight_source_url", { length: 1024 }),
  nflHighlightMatchedAt: timestamp("nfl_highlight_matched_at"),
  sourceUrl: varchar("source_url", { length: 1024 }).notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("official_scoreboard_games_external_id_uq").on(table.externalId),
  index("official_scoreboard_games_season_state_idx").on(table.season, table.gameState),
  index("official_scoreboard_games_nfl_highlight_idx").on(table.nflHighlightUrl),
]);

export type OfficialScoreboardGame = typeof officialScoreboardGames.$inferSelect;
export type InsertOfficialScoreboardGame = typeof officialScoreboardGames.$inferInsert;

/** FIELDLINE season-level import state for the nflverse play-by-play source. */
export const seasonImports = mysqlTable("season_imports", {
  id: int("id").autoincrement().primaryKey(),
  season: int("season").notNull(),
  status: mysqlEnum("status", ["ready", "importing", "failed"]).default("ready").notNull(),
  sourceUrl: text("sourceUrl"),
  gamesImported: int("gamesImported").default(0).notNull(),
  rowsImported: int("rowsImported").default(0).notNull(),
  importedBy: varchar("importedBy", { length: 64 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastReadyAt: timestamp("lastReadyAt"),
}, table => [uniqueIndex("season_imports_season_unique").on(table.season)]);

/** FIELDLINE's exact per-team, per-week aggregate used for comparison and ranks. */
export const teamWeekStats = mysqlTable("team_week_stats", {
  id: int("id").autoincrement().primaryKey(),
  season: int("season").notNull(),
  team: varchar("team", { length: 3 }).notNull(),
  week: tinyint("week").notNull(),
  games: int("games").default(0).notNull(),
  pointsFor: double("pointsFor").default(0).notNull(),
  pointsAgainst: double("pointsAgainst").default(0).notNull(),
  yardsFor: double("yardsFor").default(0).notNull(),
  yardsAgainst: double("yardsAgainst").default(0).notNull(),
  passYardsFor: double("passYardsFor").default(0).notNull(),
  rushYardsFor: double("rushYardsFor").default(0).notNull(),
  passYardsAgainst: double("passYardsAgainst").default(0).notNull(),
  rushYardsAgainst: double("rushYardsAgainst").default(0).notNull(),
  offenseEpa: double("offenseEpa").default(0).notNull(),
  offenseEpaPlays: int("offenseEpaPlays").default(0).notNull(),
  defenseEpaAllowed: double("defenseEpaAllowed").default(0).notNull(),
  defenseEpaPlays: int("defenseEpaPlays").default(0).notNull(),
  passAttempts: int("passAttempts").default(0).notNull(),
  passCompletions: int("passCompletions").default(0).notNull(),
  passTouchdowns: int("passTouchdowns").default(0).notNull(),
  interceptionsThrown: int("interceptionsThrown").default(0).notNull(),
  sacksAllowed: int("sacksAllowed").default(0).notNull(),
  sacksDefense: int("sacksDefense").default(0).notNull(),
  interceptionsDefense: int("interceptionsDefense").default(0).notNull(),
  turnovers: int("turnovers").default(0).notNull(),
  thirdDownAttempts: int("thirdDownAttempts").default(0).notNull(),
  thirdDownConversions: int("thirdDownConversions").default(0).notNull(),
  opponentThirdDownAttempts: int("opponentThirdDownAttempts").default(0).notNull(),
  opponentThirdDownConversions: int("opponentThirdDownConversions").default(0).notNull(),
  redZoneAttempts: int("redZoneAttempts").default(0).notNull(),
  redZoneTouchdowns: int("redZoneTouchdowns").default(0).notNull(),
  opponentRedZoneAttempts: int("opponentRedZoneAttempts").default(0).notNull(),
  opponentRedZoneTouchdowns: int("opponentRedZoneTouchdowns").default(0).notNull(),
  fieldGoalAttempts: int("fieldGoalAttempts").default(0).notNull(),
  fieldGoalsMade: int("fieldGoalsMade").default(0).notNull(),
  extraPointAttempts: int("extraPointAttempts").default(0).notNull(),
  extraPointsMade: int("extraPointsMade").default(0).notNull(),
  puntAttempts: int("puntAttempts").default(0).notNull(),
  puntsInside20: int("puntsInside20").default(0).notNull(),
  penalties: int("penalties").default(0).notNull(),
  penaltyYards: int("penaltyYards").default(0).notNull(),
  blitzPct: double("blitzPct"),
  missedTackles: int("missedTackles"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("team_week_stats_season_team_week_unique").on(table.season, table.team, table.week)]);

/** Per-week opponent and venue mapping, preserving the original FIELDLINE filters. */
export const teamWeekMatchups = mysqlTable("team_week_matchups", {
  id: int("id").autoincrement().primaryKey(),
  season: int("season").notNull(),
  team: varchar("team", { length: 3 }).notNull(),
  week: tinyint("week").notNull(),
  opponent: varchar("opponent", { length: 3 }).notNull(),
  isHome: boolean("isHome").notNull(),
  gameId: varchar("gameId", { length: 32 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("team_week_matchups_season_team_week_unique").on(table.season, table.team, table.week)]);

/** Source audit trail retained from the original FIELDLINE operational schema. */
export const advancedSupplementImports = mysqlTable("advanced_supplement_imports", {
  id: int("id").autoincrement().primaryKey(),
  season: int("season").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  rowsApplied: int("rowsApplied").default(0).notNull(),
  uploadedBy: varchar("uploadedBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Project-owned Heartbeat state for the original weekly FIELDLINE refresh. */
export const seasonRefreshSchedules = mysqlTable("season_refresh_schedules", {
  id: int("id").autoincrement().primaryKey(),
  season: int("season").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  cronExpression: varchar("cronExpression", { length: 64 }).notNull(),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
  isEnabled: boolean("isEnabled").default(false).notNull(),
  lastStatus: mysqlEnum("lastStatus", ["pending_deploy", "ready", "running", "waiting_for_source", "failed"]).default("pending_deploy").notNull(),
  lastRunAt: timestamp("lastRunAt"),
  lastSuccessAt: timestamp("lastSuccessAt"),
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  uniqueIndex("season_refresh_schedules_season_unique").on(table.season),
  uniqueIndex("season_refresh_schedules_task_uid_unique").on(table.scheduleCronTaskUid),
]);

export type TeamWeekStat = typeof teamWeekStats.$inferSelect;
export type TeamWeekMatchup = typeof teamWeekMatchups.$inferSelect;
