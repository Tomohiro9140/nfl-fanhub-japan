import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

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

/** Cached snippets from an official NFL team RSS feed. Full article bodies are not stored. */
export const officialFeedItems = mysqlTable("official_feed_items", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("external_id", { length: 191 }).notNull(),
  teamCode: varchar("team_code", { length: 3 }).notNull(),
  sourceKind: mysqlEnum("source_kind", ["team_official", "nfl_official"]).notNull(),
  sourceName: varchar("source_name", { length: 128 }).notNull(),
  sourceUrl: varchar("source_url", { length: 1024 }).notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  /** Generated from a transient fetch of the official source; article bodies are never persisted. */
  japaneseSummary: text("japanese_summary"),
  japaneseSummaryFetchedAt: timestamp("japanese_summary_fetched_at"),
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
