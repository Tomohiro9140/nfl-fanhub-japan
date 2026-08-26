import { and, asc, desc, eq, gt, gte, inArray, lt, ne, sql } from "drizzle-orm";
import { attachOfficialScore, findOfficialScoreForGame } from "./gameStatus";
import { getRegularSeasonByeWeek, isOfficialFinal, isWithinJstReplayWindow, selectGameTicketGame } from "./gameTicketWindow";
import { selectRelevantCalendarGames } from "./leagueDashboardPayload";
import { dedupeOfficialFeedItems } from "./officialFeedDeduplication";
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
      desc(officialFeedItems.publishedAt),
      sql`case when ${officialFeedItems.sourceKind} = 'team_official' then 0 when ${officialFeedItems.sourceKind} = 'nfl_official' then 1 when ${officialFeedItems.sourceKind} = 'pft' then 2 else 3 end`,
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
    await db.delete(officialFeedItems).where(and(
      eq(officialFeedItems.teamCode, item.teamCode),
      eq(officialFeedItems.sourceUrl, item.sourceUrl),
      ne(officialFeedItems.externalId, item.externalId),
    ));
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
  const existingGames = await db.select().from(officialGames).where(eq(officialGames.teamCode, teamCode));
  const daznByExternalId = new Map(existingGames.map((game) => [game.externalId, game]));
  const incomingExternalIds = new Set(items.map((item) => item.externalId));
  const preservedTodayGames = existingGames
    .filter((game) => !incomingExternalIds.has(game.externalId) && isSameJstCalendarDay(game.kickoffAt, new Date()))
    .map(({ id: _id, ...game }) => game);
  await db.delete(officialGames).where(eq(officialGames.teamCode, teamCode));
  await upsertOfficialGames([
    ...items.map((item) => {
      const existing = daznByExternalId.get(item.externalId);
      return {
        ...item,
        daznUrl: existing?.daznUrl ?? item.daznUrl,
        daznSourceUrl: existing?.daznSourceUrl ?? item.daznSourceUrl,
        daznMatchedAt: existing?.daznMatchedAt ?? item.daznMatchedAt,
      };
    }),
    ...preservedTodayGames,
  ]);
}

/** A partial official schedule page must never erase a matchup that is still on the current Japan calendar day. */
export function isSameJstCalendarDay(left: Date, right: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" });
  return formatter.format(left) === formatter.format(right);
}

/** A missing schedule row must not hide a current Japan-day official result after it flips from LIVE to FINAL. */
export function shouldCreateScoreboardCalendarFallback(
  score: { gameState: string | null; kickoffAt: Date | null; fetchedAt: Date },
  hasScheduleRow: boolean,
  now: Date,
) {
  if (hasScheduleRow) return false;
  if (!isOfficialFinal(score)) return true;
  return isSameJstCalendarDay(score.kickoffAt ?? score.fetchedAt, now);
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

export async function replaceOfficialRosterEntriesForTeam(teamCode: string, items: InsertOfficialRosterEntry[]) {
  if (items.length === 0) return;
  const db = await getDb();
  if (!db) throw new Error("Database is not available for official roster cache");
  await db.delete(officialRosterEntries).where(eq(officialRosterEntries.teamCode, teamCode));
  await upsertOfficialRosterEntries(items);
}

export async function getOfficialRosterEntriesForPftMatching() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ teamCode: officialRosterEntries.teamCode, playerName: officialRosterEntries.playerName }).from(officialRosterEntries).limit(4_000);
}

export async function getPftAvailabilityInsightsForValidation() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: externalAvailabilityInsights.id, teamCode: externalAvailabilityInsights.teamCode, headline: externalAvailabilityInsights.headline }).from(externalAvailabilityInsights);
}

export async function deleteExternalAvailabilityInsights(ids: number[]) {
  if (!ids.length) return;
  const db = await getDb();
  if (!db) throw new Error("Database is not available for PFT availability cache");
  for (const id of ids) await db.delete(externalAvailabilityInsights).where(eq(externalAvailabilityInsights.id, id));
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

type OfficialTeamSnapshotDb = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export async function getOfficialTeamSnapshot(teamCode: string, skipGameUrl?: string, forceLastGame = false, dbOverride?: OfficialTeamSnapshotDb, includeRoster = true) {
  const db = dbOverride ?? await getDb();
  if (!db) return { nextGame: undefined, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null }, lastUpdatedAt: undefined };
  const now = new Date();
  const activeWindowStart = new Date(now.getTime() - 6 * 60 * 60 * 1_000);
  const officialInjuryWindowStart = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1_000);
  const rosterMoveWindowStart = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1_000);
  const externalInsightWindowStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1_000);
  const [activeGameRows, recentlyFinishedGames, scheduledGameRows, completedScoreboardRows, roster, injuryRows, rosterMoveRows, newsRows, externalInsights, inactiveAnnouncements] = await Promise.all([
    db.select().from(officialGames).where(and(eq(officialGames.teamCode, teamCode), gte(officialGames.kickoffAt, activeWindowStart), lt(officialGames.kickoffAt, now))).orderBy(desc(officialGames.kickoffAt)).limit(1),
    db.select().from(officialGames).where(and(eq(officialGames.teamCode, teamCode), lt(officialGames.kickoffAt, now))).orderBy(desc(officialGames.kickoffAt)).limit(4),
    db.select().from(officialGames).where(and(eq(officialGames.teamCode, teamCode), gt(officialGames.kickoffAt, now))).orderBy(asc(officialGames.kickoffAt)).limit(1),
    db.select({ externalId: officialScoreboardGames.externalId, seasonPhase: officialScoreboardGames.seasonPhase, weekLabel: officialScoreboardGames.weekLabel, awayTeamCode: officialScoreboardGames.awayTeamCode, homeTeamCode: officialScoreboardGames.homeTeamCode, awayScore: officialScoreboardGames.awayScore, homeScore: officialScoreboardGames.homeScore, gameState: officialScoreboardGames.gameState, gameDate: officialScoreboardGames.gameDate, kickoffAt: officialScoreboardGames.kickoffAt, finalRecordedAt: officialScoreboardGames.finalRecordedAt, gameUrl: officialScoreboardGames.gameUrl, nflHighlightUrl: officialScoreboardGames.nflHighlightUrl, fetchedAt: officialScoreboardGames.fetchedAt }).from(officialScoreboardGames).orderBy(desc(officialScoreboardGames.finalRecordedAt), desc(officialScoreboardGames.fetchedAt)).limit(80),
    includeRoster
      ? db.select({ id: officialRosterEntries.id, playerName: officialRosterEntries.playerName, jerseyNumber: officialRosterEntries.jerseyNumber, position: officialRosterEntries.position, rosterStatus: officialRosterEntries.rosterStatus, sourceUrl: officialRosterEntries.sourceUrl, fetchedAt: officialRosterEntries.fetchedAt }).from(officialRosterEntries).where(eq(officialRosterEntries.teamCode, teamCode)).orderBy(asc(officialRosterEntries.rosterStatus), asc(officialRosterEntries.position), asc(officialRosterEntries.playerName)).limit(160)
      : Promise.resolve([]),
    db.select({ id: officialFeedItems.id, title: officialFeedItems.title, sourceName: officialFeedItems.sourceName, sourceKind: officialFeedItems.sourceKind, sourceUrl: officialFeedItems.sourceUrl, publishedAt: officialFeedItems.publishedAt, category: officialFeedItems.category, fetchedAt: officialFeedItems.fetchedAt }).from(officialFeedItems).where(and(eq(officialFeedItems.teamCode, teamCode), eq(officialFeedItems.category, "injury"), gte(officialFeedItems.publishedAt, officialInjuryWindowStart))).orderBy(sql`case when ${officialFeedItems.sourceKind} = 'team_official' then 0 else 1 end`, desc(officialFeedItems.publishedAt)).limit(24),
    db.select({ id: officialFeedItems.id, title: officialFeedItems.title, sourceName: officialFeedItems.sourceName, sourceKind: officialFeedItems.sourceKind, sourceUrl: officialFeedItems.sourceUrl, publishedAt: officialFeedItems.publishedAt, category: officialFeedItems.category, fetchedAt: officialFeedItems.fetchedAt }).from(officialFeedItems).where(and(eq(officialFeedItems.teamCode, teamCode), eq(officialFeedItems.category, "transaction"), gte(officialFeedItems.publishedAt, rosterMoveWindowStart))).orderBy(sql`case when ${officialFeedItems.sourceKind} = 'team_official' then 0 else 1 end`, desc(officialFeedItems.publishedAt)).limit(24),
    db.select({ id: officialFeedItems.id, title: officialFeedItems.title, summary: officialFeedItems.summary, sourceName: officialFeedItems.sourceName, sourceKind: officialFeedItems.sourceKind, sourceUrl: officialFeedItems.sourceUrl, publishedAt: officialFeedItems.publishedAt, fetchedAt: officialFeedItems.fetchedAt }).from(officialFeedItems).where(and(eq(officialFeedItems.teamCode, teamCode), eq(officialFeedItems.category, "news"))).orderBy(sql`case when ${officialFeedItems.sourceKind} = 'team_official' then 0 else 1 end`, desc(officialFeedItems.publishedAt)).limit(24),
    db.select({ id: externalAvailabilityInsights.id, playerName: externalAvailabilityInsights.playerName, statusLabel: externalAvailabilityInsights.statusLabel, headline: externalAvailabilityInsights.headline, sourceName: externalAvailabilityInsights.sourceName, sourceUrl: externalAvailabilityInsights.sourceUrl, publishedAt: externalAvailabilityInsights.publishedAt, fetchedAt: externalAvailabilityInsights.fetchedAt }).from(externalAvailabilityInsights).where(and(eq(externalAvailabilityInsights.teamCode, teamCode), gte(externalAvailabilityInsights.publishedAt, externalInsightWindowStart))).orderBy(desc(externalAvailabilityInsights.publishedAt)).limit(3),
    db.select({ title: officialFeedItems.title, summary: officialFeedItems.summary, sourceUrl: officialFeedItems.sourceUrl, publishedAt: officialFeedItems.publishedAt }).from(officialFeedItems).where(and(eq(officialFeedItems.teamCode, teamCode), gte(officialFeedItems.publishedAt, new Date(now.getTime() - 2 * 24 * 60 * 60 * 1_000)), sql`lower(${officialFeedItems.title}) like '%inactive%'`)).orderBy(desc(officialFeedItems.publishedAt)).limit(1),
  ]);
  const injuries = dedupeOfficialFeedItems(injuryRows, 3);
  const rosterMoves = dedupeOfficialFeedItems(rosterMoveRows, 3);
  const injuryArticleKeys = new Set(injuries.map((item) => `${item.sourceUrl}|${item.title}`));
  const news = dedupeOfficialFeedItems(newsRows)
    .filter((item) => !injuryArticleKeys.has(`${item.sourceUrl}|${item.title}`))
    .slice(0, 2);
  const activeGame = activeGameRows[0];
  const scheduledGame = scheduledGameRows[0];
  const scoreFor = async (game: typeof officialGames.$inferSelect | undefined) => {
    if (!game) return undefined;
    const scoreboard = await db.select().from(officialScoreboardGames)
      .where(and(eq(officialScoreboardGames.awayTeamCode, game.homeAway === "away" ? teamCode : game.opponentCode), eq(officialScoreboardGames.homeTeamCode, game.homeAway === "away" ? game.opponentCode : teamCode)))
      .orderBy(desc(officialScoreboardGames.fetchedAt)).limit(1);
    const score = scoreboard[0];
    return { ...attachOfficialScore(game, scoreboard), gameDate: score?.gameDate ?? null, finishedAt: score?.finalRecordedAt ?? null };
  };
  const [activeWithScore, scheduledWithScore, ...recentWithScores] = await Promise.all([scoreFor(activeGame), scoreFor(scheduledGame), ...recentlyFinishedGames.map(scoreFor)]);
  const completedScoreboardGames = completedScoreboardRows
    .filter((score) => (score.awayTeamCode === teamCode || score.homeTeamCode === teamCode) && isOfficialFinal(score));
  const activeScoreboardCandidates = completedScoreboardRows
    .filter((score) => (score.awayTeamCode === teamCode || score.homeTeamCode === teamCode) && !isOfficialFinal(score))
    .map((score) => ({
      externalId: `scoreboard:${score.externalId}`,
      teamCode,
      opponentCode: score.homeTeamCode === teamCode ? score.awayTeamCode : score.homeTeamCode,
      homeAway: score.homeTeamCode === teamCode ? "home" as const : "away" as const,
      seasonPhase: score.seasonPhase,
      weekLabel: score.weekLabel,
      // A live score without a published kickoff must still win over a future fixture. Its timestamp is explicitly marked as estimated for the UI.
      kickoffAt: score.kickoffAt ?? score.fetchedAt,
      kickoffAtEstimated: !score.kickoffAt,
      gameDate: score.gameDate,
      venue: null,
      broadcast: null,
      sourceUrl: score.gameUrl,
      daznUrl: null,
      daznSourceUrl: null,
      daznMatchedAt: null,
      nflHighlightUrl: score.nflHighlightUrl,
      fetchedAt: score.fetchedAt,
      gameState: score.gameState,
      awayScore: score.awayScore,
      homeScore: score.homeScore,
      finishedAt: null,
    }))
    .sort((left, right) => right.fetchedAt.getTime() - left.fetchedAt.getTime());
  const scoreboardCompletedCandidates = completedScoreboardGames.map((score) => ({
    externalId: `scoreboard:${score.externalId}`,
    teamCode,
    opponentCode: score.homeTeamCode === teamCode ? score.awayTeamCode : score.homeTeamCode,
    homeAway: score.homeTeamCode === teamCode ? "home" as const : "away" as const,
    seasonPhase: score.seasonPhase,
    weekLabel: score.weekLabel,
    // Prefer the exact official kickoff. The date-only fallback is for historical rows that have no published kickoff.
    kickoffAt: score.kickoffAt ?? (score.gameDate ? new Date(`${score.gameDate}T12:00:00.000Z`) : score.fetchedAt),
    gameDate: score.gameDate,
    venue: null,
    broadcast: null,
    sourceUrl: score.gameUrl,
    daznUrl: null,
    daznSourceUrl: null,
    daznMatchedAt: null,
    nflHighlightUrl: score.nflHighlightUrl,
    fetchedAt: score.fetchedAt,
    gameState: score.gameState,
    awayScore: score.awayScore,
    homeScore: score.homeScore,
    finishedAt: score.finalRecordedAt ?? score.fetchedAt,
  }));
  const completedScheduleCandidates = recentWithScores.filter((game): game is NonNullable<typeof game> => Boolean(game) && isOfficialFinal(game));
  const latestCompletedGame = [...completedScheduleCandidates, ...scoreboardCompletedCandidates]
    .sort((left, right) => right.kickoffAt.getTime() - left.kickoffAt.getTime())[0];
  const canRestoreLastGame = Boolean(latestCompletedGame && isWithinJstReplayWindow(latestCompletedGame, now));
  const nextGame = activeScoreboardCandidates[0] ?? selectGameTicketGame({ now, activeGame: activeWithScore, latestCompletedGame, scheduledGame: scheduledWithScore, skipReplayWindow: Boolean(skipGameUrl && latestCompletedGame?.sourceUrl === skipGameUrl), forceLastGame });
  const byeWeek = getRegularSeasonByeWeek({ now, scheduledGame: scheduledWithScore, latestCompletedGame });
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
    kickoffAtEstimated: "kickoffAtEstimated" in nextGame ? nextGame.kickoffAtEstimated ?? false : false,
    gameState: nextGame.gameState,
    awayScore: nextGame.awayScore,
    homeScore: nextGame.homeScore,
    finishedAt: "finishedAt" in nextGame ? nextGame.finishedAt ?? null : null,
    gameDate: "gameDate" in nextGame ? nextGame.gameDate ?? null : null,
    sourceUrl: nextGame.sourceUrl,
    fetchedAt: nextGame.fetchedAt,
  } : undefined;
  const inactiveReport = buildSnapshotInactiveReport(inactiveAnnouncements);
  return { nextGame, gameDayStatus, canRestoreLastGame, byeWeek, roster, rosterCounts, injuries, rosterMoves, news, externalInsights, inactiveReport, sources: { schedule: nextGame?.sourceUrl ?? null, roster: roster[0]?.sourceUrl ?? null, injury: injuries[0]?.sourceUrl ?? null, moves: rosterMoves[0]?.sourceUrl ?? null, gameDay: nextGame?.sourceUrl ?? null }, lastUpdatedAt };
}

/** Converts the latest official cached announcement into the Game Day snapshot shape. */
export function buildSnapshotInactiveReport<T extends { title: string; summary: string | null; sourceUrl: string; publishedAt: Date }>(announcements: T[]) {
  const announcement = announcements[0];
  return announcement ? { title: announcement.title, summary: announcement.summary, sourceUrl: announcement.sourceUrl, publishedAt: announcement.publishedAt } : null;
}

/** Avoids external score polling unless an official game is underway or has just ended. */
export async function hasOfficialScorePulseWindow(now = new Date()) {
  const db = await getDb();
  if (!db) return false;
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1_000);
  const japanDayStart = new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()) - 9 * 60 * 60 * 1_000);
  // Retain the whole Japan game day and a small prior-day buffer for US evening kickoffs.
  const windowStart = new Date(japanDayStart.getTime() - 6 * 60 * 60 * 1_000);
  const windowEnd = new Date(japanDayStart.getTime() + 24 * 60 * 60 * 1_000);
  const games = await db.select({ id: officialGames.id }).from(officialGames)
    .where(and(gte(officialGames.kickoffAt, windowStart), lt(officialGames.kickoffAt, windowEnd))).limit(1);
  return games.length > 0;
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
  const existingLinks = await db.select({ externalId: officialScoreboardGames.externalId, gameDate: officialScoreboardGames.gameDate, kickoffAt: officialScoreboardGames.kickoffAt, nflHighlightUrl: officialScoreboardGames.nflHighlightUrl, nflHighlightSourceUrl: officialScoreboardGames.nflHighlightSourceUrl, nflHighlightMatchedAt: officialScoreboardGames.nflHighlightMatchedAt, finalRecordedAt: officialScoreboardGames.finalRecordedAt }).from(officialScoreboardGames).where(eq(officialScoreboardGames.season, season));
  const existingByExternalId = new Map(existingLinks.map((link) => [link.externalId, link]));
  if (!items.length) return;
  for (const item of items) {
    const existing = existingByExternalId.get(item.externalId);
    const finalRecordedAt = isOfficialFinal(item) ? existing?.finalRecordedAt ?? item.fetchedAt : null;
    const gameDate = item.gameDate ?? existing?.gameDate ?? null;
    const kickoffAt = item.kickoffAt ?? existing?.kickoffAt ?? null;
    await db.insert(officialScoreboardGames).values({ ...item, ...(existing ?? {}), gameDate, kickoffAt, finalRecordedAt }).onDuplicateKeyUpdate({ set: { awayScore: item.awayScore, homeScore: item.homeScore, gameState: item.gameState, gameDate, kickoffAt, finalRecordedAt, sourceUrl: item.sourceUrl, fetchedAt: item.fetchedAt } });
  }
}

/** Returns cached official kickoff times so an existing result is not fetched repeatedly. */
export async function getOfficialScoreboardKickoffTimes(season: number, externalIds: string[]) {
  if (!externalIds.length) return new Map<string, Date>();
  const db = await getDb();
  if (!db) return new Map<string, Date>();
  const rows = await db.select({ externalId: officialScoreboardGames.externalId, kickoffAt: officialScoreboardGames.kickoffAt })
    .from(officialScoreboardGames)
    .where(and(eq(officialScoreboardGames.season, season), inArray(officialScoreboardGames.externalId, externalIds)));
  return new Map(rows.flatMap((row) => row.kickoffAt ? [[row.externalId, row.kickoffAt] as const] : []));
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

export async function getOfficialLeagueDashboardSummary() {
  const db = await getDb();
  if (!db) return { standings: [], results: [], lastUpdatedAt: undefined };
  const [standings, rawResults, games] = await Promise.all([
    db.select({ teamCode: officialStandings.teamCode, wins: officialStandings.wins, losses: officialStandings.losses, ties: officialStandings.ties, pct: officialStandings.pct, pointsFor: officialStandings.pointsFor, pointsAgainst: officialStandings.pointsAgainst, sourceUrl: officialStandings.sourceUrl, fetchedAt: officialStandings.fetchedAt }).from(officialStandings).orderBy(desc(officialStandings.pct), desc(officialStandings.wins), asc(officialStandings.losses)),
    db.select({ id: officialScoreboardGames.id, weekLabel: officialScoreboardGames.weekLabel, awayTeamCode: officialScoreboardGames.awayTeamCode, homeTeamCode: officialScoreboardGames.homeTeamCode, awayScore: officialScoreboardGames.awayScore, homeScore: officialScoreboardGames.homeScore, gameState: officialScoreboardGames.gameState, gameDate: officialScoreboardGames.gameDate, kickoffAt: officialScoreboardGames.kickoffAt, gameUrl: officialScoreboardGames.gameUrl, nflHighlightUrl: officialScoreboardGames.nflHighlightUrl, sourceUrl: officialScoreboardGames.sourceUrl, fetchedAt: officialScoreboardGames.fetchedAt }).from(officialScoreboardGames).orderBy(desc(officialScoreboardGames.gameDate), desc(officialScoreboardGames.fetchedAt)),
    db.select({ teamCode: officialGames.teamCode, opponentCode: officialGames.opponentCode, weekLabel: officialGames.weekLabel, kickoffAt: officialGames.kickoffAt, venue: officialGames.venue, daznUrl: officialGames.daznUrl }).from(officialGames),
  ]);
  const relatedGame = (awayTeamCode: string, homeTeamCode: string, weekLabel: string | null) => games.find((game) => findOfficialScoreForGame([{ awayTeamCode, homeTeamCode, weekLabel, gameState: "", awayScore: null, homeScore: null }], game));
  const results = rawResults.map((result) => {
    const scheduleGame = relatedGame(result.awayTeamCode, result.homeTeamCode, result.weekLabel);
    return { ...result, kickoffAt: result.kickoffAt ?? scheduleGame?.kickoffAt ?? null, venue: scheduleGame?.venue ?? null, daznUrl: scheduleGame?.daznUrl ?? null };
  });
  const lastUpdatedAt = [standings[0]?.fetchedAt, results[0]?.fetchedAt].filter((value): value is Date => Boolean(value)).sort((a, b) => b.getTime() - a.getTime())[0];
  return { standings, results, lastUpdatedAt };
}

export async function getOfficialLeagueCalendar(teamCode: string) {
  const db = await getDb();
  if (!db) return { calendar: [], lastUpdatedAt: undefined };
  const [games, rawResults] = await Promise.all([
    db.select({ id: officialGames.id, teamCode: officialGames.teamCode, opponentCode: officialGames.opponentCode, homeAway: officialGames.homeAway, seasonPhase: officialGames.seasonPhase, weekLabel: officialGames.weekLabel, kickoffAt: officialGames.kickoffAt, broadcast: officialGames.broadcast, sourceUrl: officialGames.sourceUrl, daznUrl: officialGames.daznUrl, fetchedAt: officialGames.fetchedAt }).from(officialGames).orderBy(asc(officialGames.kickoffAt)),
    db.select({ externalId: officialScoreboardGames.externalId, seasonPhase: officialScoreboardGames.seasonPhase, weekLabel: officialScoreboardGames.weekLabel, awayTeamCode: officialScoreboardGames.awayTeamCode, homeTeamCode: officialScoreboardGames.homeTeamCode, awayScore: officialScoreboardGames.awayScore, homeScore: officialScoreboardGames.homeScore, gameState: officialScoreboardGames.gameState, kickoffAt: officialScoreboardGames.kickoffAt, gameUrl: officialScoreboardGames.gameUrl, sourceUrl: officialScoreboardGames.sourceUrl, fetchedAt: officialScoreboardGames.fetchedAt, nflHighlightUrl: officialScoreboardGames.nflHighlightUrl }).from(officialScoreboardGames).orderBy(desc(officialScoreboardGames.fetchedAt)),
  ]);
  const now = new Date();
  const liveScoreboardFallbacks = rawResults.flatMap((score, index) => {
    const hasScheduleRow = games.some((game) => findOfficialScoreForGame([score], game));
    if (!shouldCreateScoreboardCalendarFallback(score, hasScheduleRow, now)) return [];
    const kickoffAt = score.kickoffAt ?? score.fetchedAt;
    return [
      { id: -(index * 2 + 1), teamCode: score.awayTeamCode, opponentCode: score.homeTeamCode, homeAway: "away" as const, seasonPhase: score.seasonPhase, weekLabel: score.weekLabel, kickoffAt, broadcast: null, sourceUrl: score.gameUrl, daznUrl: null, fetchedAt: score.fetchedAt, liveScoreboardFallback: !isOfficialFinal(score) && !score.kickoffAt },
      { id: -(index * 2 + 2), teamCode: score.homeTeamCode, opponentCode: score.awayTeamCode, homeAway: "home" as const, seasonPhase: score.seasonPhase, weekLabel: score.weekLabel, kickoffAt, broadcast: null, sourceUrl: score.gameUrl, daznUrl: null, fetchedAt: score.fetchedAt, liveScoreboardFallback: !isOfficialFinal(score) && !score.kickoffAt },
    ];
  });
  const calendar = selectRelevantCalendarGames([...games, ...liveScoreboardFallbacks], teamCode, now).map((game) => attachOfficialScore(game, rawResults));
  const lastUpdatedAt = calendar.map((game) => game.fetchedAt).filter((value): value is Date => Boolean(value)).sort((a, b) => b.getTime() - a.getTime())[0];
  return { calendar, lastUpdatedAt };
}

export async function getOfficialLeagueDashboard() {
  const [summary, calendar] = await Promise.all([getOfficialLeagueDashboardSummary(), getOfficialLeagueCalendar("XXX")]);
  const lastUpdatedAt = [summary.lastUpdatedAt, calendar.lastUpdatedAt].filter((value): value is Date => Boolean(value)).sort((a, b) => b.getTime() - a.getTime())[0];
  return { ...summary, calendar: calendar.calendar, lastUpdatedAt };
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
