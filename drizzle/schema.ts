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
  category: mysqlEnum("category", ["news", "injury"]).notNull().default("news"),
  publishedAt: timestamp("published_at").notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("official_feed_items_external_id_uq").on(table.externalId),
  index("official_feed_items_team_published_idx").on(table.teamCode, table.publishedAt),
]);

export type OfficialFeedItem = typeof officialFeedItems.$inferSelect;
export type InsertOfficialFeedItem = typeof officialFeedItems.$inferInsert;
