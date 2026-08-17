import { and, asc, desc, eq, gt, gte, inArray, lt, sql } from "drizzle-orm";
import { attachOfficialScore, findOfficialScoreForGame } from "./gameStatus";
import { isOfficialFinal, selectGameTicketGame } from "./gameTicketWindow";
import { isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { ExternalAvailabilityInsight, InsertExternalAvailabilityInsight, InsertOfficialFeedItem, InsertOfficialGame, InsertOfficialRosterEntry, InsertOfficialScoreboardGame, InsertOfficialStanding, InsertUser, externalAvailabilityInsights, officialFeedItems, officialGames, officialRosterEntries, officialScoreboardGames, officialStandings, users } from "../drizzle/schema";
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

export async function getOfficialFeedItemById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(officialFeedItems).where(eq(officialFeedItems.id, id)).limit(1))[0];
}

export async function saveOfficialFeedJapaneseSummary(id: number, japaneseSummary: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for Japanese summary cache");
  await db.update(officialFeedItems).set({ japaneseSummary, japaneseSummaryFetchedAt: new Date() }).where(eq(officialFeedItems.id, id));
}

export async function saveOfficialFeedEnglishSummary(id: number, englishSummary: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for English summary cache");
  await db.update(officialFeedItems).set({ englishSummary, englishSummaryFetchedAt: new Date() }).where(eq(officialFeedItems.id, id));
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
  const existingLinks = await db.select({ externalId: officialGames.externalId, daznUrl: officialGames.daznUrl, daznSourceUrl: officialGames.daznSourceUrl, daznMatchedAt: officialGames.daznMatchedAt }).from(officialGames).where(eq(officialGames.teamCode, teamCode));
  const daznByExternalId = new Map(existingLinks.map((link) => [link.externalId, link]));
  await db.delete(officialGames).where(eq(officialGames.teamCode, teamCode));
  await upsertOfficialGames(items.map((item) => ({ ...item, ...(daznByExternalId.get(item.externalId) ?? {}) })));
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

export async function getOfficialRosterEntriesForPftMatching() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ teamCode: officialRosterEntries.teamCode, playerName: officialRosterEntries.playerName }).from(officialRosterEntries).limit(4_000);
}

export async function upsertExternalAvailabilityInsights(items: InsertExternalAvailabilityInsight[]) {
  if (!items.length) return;
  const db = await getDb();
  if (!db) throw new Error("Database is not available for PFT availability cache");
  for (const item of items) {
    await db.insert(externalAvailabilityInsights).values(item).onDuplicateKeyUpdate({
      set: { statusLabel: item.statusLabel, headline: item.headline, publishedAt: item.publishedAt, fetchedAt: item.fetchedAt },
    });
  }
}

export async function replaceExternalAvailabilityInsightsForSources(sourceUrls: string[], items: InsertExternalAvailabilityInsight[]) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for PFT availability cache");
  for (const sourceUrl of Array.from(new Set(sourceUrls))) {
    await db.delete(externalAvailabilityInsights).where(eq(externalAvailabilityInsights.sourceUrl, sourceUrl));
  }
  await upsertExternalAvailabilityInsights(items);
}

export async function getOfficialTeamSnapshot(teamCode: string, skipGameUrl?: string) {
  const db = await getDb();
  if (!db) return { nextGame: undefined, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null }, lastUpdatedAt: undefined };
  const now = new Date();
  const activeWindowStart = new Date(now.getTime() - 6 * 60 * 60 * 1_000);
  const activeGame = (await db.select().from(officialGames)
    .where(and(eq(officialGames.teamCode, teamCode), gte(officialGames.kickoffAt, activeWindowStart), lt(officialGames.kickoffAt, now)))
    .orderBy(desc(officialGames.kickoffAt)).limit(1))[0];
  const recentlyFinishedGames = await db.select().from(officialGames)
    .where(and(eq(officialGames.teamCode, teamCode), lt(officialGames.kickoffAt, now)))
    .orderBy(desc(officialGames.kickoffAt)).limit(4);
  const scheduledGame = (await db.select().from(officialGames)
    .where(and(eq(officialGames.teamCode, teamCode), gt(officialGames.kickoffAt, now)))
    .orderBy(asc(officialGames.kickoffAt)).limit(1))[0];
  const scoreFor = async (game: typeof officialGames.$inferSelect | undefined) => {
    if (!game) return undefined;
    const scoreboard = await db.select().from(officialScoreboardGames)
      .where(and(eq(officialScoreboardGames.awayTeamCode, game.homeAway === "away" ? teamCode : game.opponentCode), eq(officialScoreboardGames.homeTeamCode, game.homeAway === "away" ? game.opponentCode : teamCode)))
      .orderBy(desc(officialScoreboardGames.fetchedAt)).limit(1);
    return attachOfficialScore(game, scoreboard);
  };
  const [activeWithScore, scheduledWithScore, ...recentWithScores] = await Promise.all([scoreFor(activeGame), scoreFor(scheduledGame), ...recentlyFinishedGames.map(scoreFor)]);
  const completedScoreboardGames = (await db.select().from(officialScoreboardGames)
    .orderBy(desc(officialScoreboardGames.finalRecordedAt), desc(officialScoreboardGames.fetchedAt)).limit(80))
    .filter((score) => (score.awayTeamCode === teamCode || score.homeTeamCode === teamCode) && isOfficialFinal(score));
  const scoreboardCompletedCandidates = completedScoreboardGames.map((score) => ({
    externalId: `scoreboard:${score.externalId}`,
    teamCode,
    opponentCode: score.homeTeamCode === teamCode ? score.awayTeamCode : score.homeTeamCode,
    homeAway: score.homeTeamCode === teamCode ? "home" as const : "away" as const,
    seasonPhase: score.seasonPhase,
    weekLabel: score.weekLabel,
    kickoffAt: score.finalRecordedAt ?? score.fetchedAt,
    venue: null,
    broadcast: null,
    sourceUrl: score.gameUrl,
    daznUrl: null,
    daznSourceUrl: null,
    daznMatchedAt: null,
    fetchedAt: score.fetchedAt,
    gameState: score.gameState,
    awayScore: score.awayScore,
    homeScore: score.homeScore,
  }));
  const completedScheduleCandidates = recentWithScores.filter((game): game is NonNullable<typeof game> => Boolean(game) && isOfficialFinal(game));
  const latestCompletedGame = [...completedScheduleCandidates, ...scoreboardCompletedCandidates]
    .sort((left, right) => right.kickoffAt.getTime() - left.kickoffAt.getTime())[0];
  const nextGame = selectGameTicketGame({ now, activeGame: activeWithScore, latestCompletedGame, scheduledGame: scheduledWithScore, skipReplayWindow: Boolean(skipGameUrl && latestCompletedGame?.sourceUrl === skipGameUrl) });
  const roster = await db.select().from(officialRosterEntries)
    .where(eq(officialRosterEntries.teamCode, teamCode))
    .orderBy(asc(officialRosterEntries.rosterStatus), asc(officialRosterEntries.position), asc(officialRosterEntries.playerName)).limit(160);
  const officialInjuryWindowStart = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1_000);
  const injuries = await db.select().from(officialFeedItems)
    .where(and(eq(officialFeedItems.teamCode, teamCode), eq(officialFeedItems.category, "injury"), gte(officialFeedItems.publishedAt, officialInjuryWindowStart)))
    .orderBy(sql`case when ${officialFeedItems.sourceKind} = 'team_official' then 0 else 1 end`, desc(officialFeedItems.publishedAt)).limit(3);
  const rosterMoves = await db.select().from(officialFeedItems)
    .where(and(eq(officialFeedItems.teamCode, teamCode), eq(officialFeedItems.category, "transaction"), gte(officialFeedItems.publishedAt, new Date(now.getTime() - 21 * 24 * 60 * 60 * 1_000))))
    .orderBy(sql`case when ${officialFeedItems.sourceKind} = 'team_official' then 0 else 1 end`, desc(officialFeedItems.publishedAt)).limit(3);
  const news = await db.select().from(officialFeedItems)
    .where(and(eq(officialFeedItems.teamCode, teamCode), eq(officialFeedItems.category, "news")))
    .orderBy(sql`case when ${officialFeedItems.sourceKind} = 'team_official' then 0 else 1 end`, desc(officialFeedItems.publishedAt)).limit(2);
  const externalInsights = await db.select().from(externalAvailabilityInsights)
    .where(and(eq(externalAvailabilityInsights.teamCode, teamCode), gte(externalAvailabilityInsights.publishedAt, new Date(now.getTime() - 14 * 24 * 60 * 60 * 1_000))))
    .orderBy(desc(externalAvailabilityInsights.publishedAt)).limit(3);
  const rosterCounts = Array.from(roster.reduce((counts, entry) => {
    counts.set(entry.rosterStatus, (counts.get(entry.rosterStatus) ?? 0) + 1);
    return counts;
  }, new Map<string, number>()).entries()).map(([status, count]) => ({ status, count }));
  const lastUpdatedAt = [nextGame?.fetchedAt, ...roster.map((entry) => entry.fetchedAt), ...injuries.map((entry) => entry.fetchedAt), ...rosterMoves.map((entry) => entry.fetchedAt), ...externalInsights.map((entry) => entry.fetchedAt)]
    .filter((value): value is Date => Boolean(value)).sort((a, b) => b.getTime() - a.getTime())[0];
  const gameDayStatus = nextGame ? {
    opponentCode: nextGame.opponentCode,
    homeAway: nextGame.homeAway,
    weekLabel: nextGame.weekLabel,
    kickoffAt: nextGame.kickoffAt,
    gameState: nextGame.gameState,
    awayScore: nextGame.awayScore,
    homeScore: nextGame.homeScore,
    sourceUrl: nextGame.sourceUrl,
    fetchedAt: nextGame.fetchedAt,
  } : undefined;
  return { nextGame, gameDayStatus, roster, rosterCounts, injuries, rosterMoves, news, externalInsights, sources: { schedule: nextGame?.sourceUrl ?? null, roster: roster[0]?.sourceUrl ?? null, injury: injuries[0]?.sourceUrl ?? null, moves: rosterMoves[0]?.sourceUrl ?? null, gameDay: nextGame?.sourceUrl ?? null }, lastUpdatedAt };
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
  const existingLinks = await db.select({ externalId: officialScoreboardGames.externalId, nflHighlightUrl: officialScoreboardGames.nflHighlightUrl, nflHighlightSourceUrl: officialScoreboardGames.nflHighlightSourceUrl, nflHighlightMatchedAt: officialScoreboardGames.nflHighlightMatchedAt, finalRecordedAt: officialScoreboardGames.finalRecordedAt }).from(officialScoreboardGames).where(eq(officialScoreboardGames.season, season));
  const existingByExternalId = new Map(existingLinks.map((link) => [link.externalId, link]));
  await db.delete(officialScoreboardGames).where(eq(officialScoreboardGames.season, season));
  if (!items.length) return;
  for (const item of items) {
    const existing = existingByExternalId.get(item.externalId);
    const finalRecordedAt = isOfficialFinal(item) ? existing?.finalRecordedAt ?? item.fetchedAt : null;
    await db.insert(officialScoreboardGames).values({ ...item, ...(existing ?? {}), finalRecordedAt }).onDuplicateKeyUpdate({ set: { awayScore: item.awayScore, homeScore: item.homeScore, gameState: item.gameState, finalRecordedAt, sourceUrl: item.sourceUrl, fetchedAt: item.fetchedAt } });
  }
}

export async function getOfficialScoreboardGamesForHighlightMatching() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(officialScoreboardGames).where(and(eq(officialScoreboardGames.gameState, "FINAL"), isNull(officialScoreboardGames.nflHighlightUrl)));
}

export async function upsertOfficialScoreboardHighlights(links: Array<{ externalId: string; nflHighlightUrl: string; sourceUrl: string }>) {
  if (!links.length) return;
  const db = await getDb();
  if (!db) throw new Error("Database is not available for NFL official highlight cache");
  const matchedAt = new Date();
  for (const link of links) await db.update(officialScoreboardGames).set({ nflHighlightUrl: link.nflHighlightUrl, nflHighlightSourceUrl: link.sourceUrl, nflHighlightMatchedAt: matchedAt }).where(eq(officialScoreboardGames.externalId, link.externalId));
}

export async function getOfficialLeagueDashboard() {
  const db = await getDb();
  if (!db) return { standings: [], results: [], calendar: [], lastUpdatedAt: undefined };
  const standings = await db.select().from(officialStandings).orderBy(desc(officialStandings.pct), desc(officialStandings.wins), asc(officialStandings.losses));
  const rawResults = await db.select().from(officialScoreboardGames).orderBy(desc(officialScoreboardGames.fetchedAt)).limit(24);
  const games = await db.select().from(officialGames).orderBy(asc(officialGames.kickoffAt));
  const relatedGame = (awayTeamCode: string, homeTeamCode: string, weekLabel: string | null) => games.find((game) => findOfficialScoreForGame([{ awayTeamCode, homeTeamCode, weekLabel, gameState: "", awayScore: null, homeScore: null }], game));
  const results = rawResults.map((result) => ({ ...result, daznUrl: relatedGame(result.awayTeamCode, result.homeTeamCode, result.weekLabel)?.daznUrl ?? null }));
  const seen = new Set<string>();
  const calendar = games.filter((game) => {
    const key = `${game.kickoffAt.toISOString()}:${[game.teamCode, game.opponentCode].sort().join("-")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((game) => attachOfficialScore(game, rawResults));
  const lastUpdatedAt = [standings[0]?.fetchedAt, results[0]?.fetchedAt, calendar[0]?.fetchedAt].filter((value): value is Date => Boolean(value)).sort((a, b) => b.getTime() - a.getTime())[0];
  return { standings, results, calendar, lastUpdatedAt };
}

export async function getOfficialGamesForDaznMatching() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(officialGames).orderBy(asc(officialGames.kickoffAt));
}

export async function upsertOfficialGameDaznLinks(links: Array<{ externalId: string; daznUrl: string; sourceUrl: string }>) {
  if (!links.length) return;
  const db = await getDb();
  if (!db) throw new Error("Database is not available for DAZN link cache");
  const matchedAt = new Date();
  for (const link of links) await db.update(officialGames).set({ daznUrl: link.daznUrl, daznSourceUrl: link.sourceUrl, daznMatchedAt: matchedAt }).where(eq(officialGames.externalId, link.externalId));
}
