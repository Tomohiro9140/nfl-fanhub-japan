import { and, asc, desc, eq, gt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertOfficialFeedItem, InsertOfficialGame, InsertOfficialRosterEntry, InsertOfficialScoreboardGame, InsertOfficialStanding, InsertUser, officialFeedItems, officialGames, officialRosterEntries, officialScoreboardGames, officialStandings, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getOfficialFeedItems(teamCode: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(officialFeedItems)
    .where(eq(officialFeedItems.teamCode, teamCode))
    .orderBy(
      sql`case when ${officialFeedItems.sourceKind} = 'team_official' then 0 else 1 end`,
      desc(officialFeedItems.publishedAt),
    )
    .limit(24);
}

export async function upsertOfficialFeedItems(items: InsertOfficialFeedItem[]) {
  if (items.length === 0) return;
  const db = await getDb();
  if (!db) throw new Error("Database is not available for official feed cache");
  for (const item of items) {
    await db.insert(officialFeedItems).values(item).onDuplicateKeyUpdate({
      set: {
        title: item.title,
        summary: item.summary,
        category: item.category,
        publishedAt: item.publishedAt,
        fetchedAt: item.fetchedAt,
      },
    });
  }
}

export async function upsertOfficialGames(items: InsertOfficialGame[]) {
  if (items.length === 0) return;
  const db = await getDb();
  if (!db) throw new Error("Database is not available for official schedule cache");
  for (const item of items) {
    await db.insert(officialGames).values(item).onDuplicateKeyUpdate({
      set: { opponentCode: item.opponentCode, homeAway: item.homeAway, seasonPhase: item.seasonPhase, weekLabel: item.weekLabel, kickoffAt: item.kickoffAt, venue: item.venue, broadcast: item.broadcast, sourceUrl: item.sourceUrl, fetchedAt: item.fetchedAt },
    });
  }
}

export async function replaceOfficialGamesForTeam(teamCode: string, items: InsertOfficialGame[]) {
  if (items.length === 0) return;
  const db = await getDb();
  if (!db) throw new Error("Database is not available for official schedule cache");
  await db.delete(officialGames).where(eq(officialGames.teamCode, teamCode));
  await upsertOfficialGames(items);
}

export async function upsertOfficialRosterEntries(items: InsertOfficialRosterEntry[]) {
  if (items.length === 0) return;
  const db = await getDb();
  if (!db) throw new Error("Database is not available for official roster cache");
  for (const item of items) {
    await db.insert(officialRosterEntries).values(item).onDuplicateKeyUpdate({
      set: { jerseyNumber: item.jerseyNumber, position: item.position, rosterStatus: item.rosterStatus, fetchedAt: item.fetchedAt },
    });
  }
}

export async function getOfficialTeamSnapshot(teamCode: string) {
  const db = await getDb();
  if (!db) return { nextGame: undefined, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null }, lastUpdatedAt: undefined };
  const now = new Date();
  const nextGame = (await db.select().from(officialGames)
    .where(and(eq(officialGames.teamCode, teamCode), gt(officialGames.kickoffAt, now)))
    .orderBy(asc(officialGames.kickoffAt)).limit(1))[0];
  const roster = await db.select().from(officialRosterEntries)
    .where(eq(officialRosterEntries.teamCode, teamCode))
    .orderBy(asc(officialRosterEntries.rosterStatus), asc(officialRosterEntries.position), asc(officialRosterEntries.playerName)).limit(160);
  const injuries = await db.select().from(officialFeedItems)
    .where(and(eq(officialFeedItems.teamCode, teamCode), eq(officialFeedItems.category, "injury")))
    .orderBy(sql`case when ${officialFeedItems.sourceKind} = 'team_official' then 0 else 1 end`, desc(officialFeedItems.publishedAt)).limit(3);
  const news = await db.select().from(officialFeedItems)
    .where(and(eq(officialFeedItems.teamCode, teamCode), eq(officialFeedItems.category, "news")))
    .orderBy(sql`case when ${officialFeedItems.sourceKind} = 'team_official' then 0 else 1 end`, desc(officialFeedItems.publishedAt)).limit(2);
  const rosterCounts = Array.from(roster.reduce((counts, entry) => {
    counts.set(entry.rosterStatus, (counts.get(entry.rosterStatus) ?? 0) + 1);
    return counts;
  }, new Map<string, number>()).entries()).map(([status, count]) => ({ status, count }));
  const lastUpdatedAt = [nextGame?.fetchedAt, ...roster.map((entry) => entry.fetchedAt), ...injuries.map((entry) => entry.fetchedAt)]
    .filter((value): value is Date => Boolean(value)).sort((a, b) => b.getTime() - a.getTime())[0];
  return { nextGame, roster, rosterCounts, injuries, news, sources: { schedule: nextGame?.sourceUrl ?? null, roster: roster[0]?.sourceUrl ?? null, injury: injuries[0]?.sourceUrl ?? null }, lastUpdatedAt };
}

export async function upsertOfficialStandings(items: InsertOfficialStanding[]) {
  if (!items.length) return;
  const db = await getDb();
  if (!db) throw new Error("Database is not available for standings cache");
  for (const item of items) await db.insert(officialStandings).values(item).onDuplicateKeyUpdate({ set: { wins: item.wins, losses: item.losses, ties: item.ties, pct: item.pct, pointsFor: item.pointsFor, pointsAgainst: item.pointsAgainst, sourceUrl: item.sourceUrl, fetchedAt: item.fetchedAt } });
}

export async function replaceOfficialScoreboardGames(season: number, items: InsertOfficialScoreboardGame[]) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for official scoreboard cache");
  await db.delete(officialScoreboardGames).where(eq(officialScoreboardGames.season, season));
  if (!items.length) return;
  for (const item of items) await db.insert(officialScoreboardGames).values(item).onDuplicateKeyUpdate({ set: { awayScore: item.awayScore, homeScore: item.homeScore, gameState: item.gameState, sourceUrl: item.sourceUrl, fetchedAt: item.fetchedAt } });
}

export async function getOfficialLeagueDashboard() {
  const db = await getDb();
  if (!db) return { standings: [], results: [], calendar: [], lastUpdatedAt: undefined };
  const standings = await db.select().from(officialStandings).orderBy(desc(officialStandings.pct), desc(officialStandings.wins), asc(officialStandings.losses));
  const results = await db.select().from(officialScoreboardGames).orderBy(desc(officialScoreboardGames.fetchedAt)).limit(24);
  const games = await db.select().from(officialGames).orderBy(asc(officialGames.kickoffAt));
  const seen = new Set<string>();
  const calendar = games.filter((game) => {
    const key = `${game.kickoffAt.toISOString()}:${[game.teamCode, game.opponentCode].sort().join("-")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const lastUpdatedAt = [standings[0]?.fetchedAt, results[0]?.fetchedAt, calendar[0]?.fetchedAt].filter((value): value is Date => Boolean(value)).sort((a, b) => b.getTime() - a.getTime())[0];
  return { standings, results, calendar, lastUpdatedAt };
}
