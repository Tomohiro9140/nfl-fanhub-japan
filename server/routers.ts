import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getFreshOfficialTeamFeed, refreshOfficialTeamFeed } from "./officialFeeds";
import { getOfficialFeedItemById, saveOfficialFeedEnglishSummary, saveOfficialFeedJapaneseSummary } from "./db";
import { getCachedOfficialLatestResult, getCachedOfficialLeagueCalendar, getCachedOfficialLeagueDashboardSummary, getCachedOfficialTeamSnapshot } from "./officialDashboardCache";
import { generateBilingualSummary } from "./geminiSummary";
import { NEWS_SUMMARIES_ENABLED } from "@shared/newsSummaryFeature";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { atlasAwards, atlasBrowse, atlasCareer, atlasContracts, atlasFilters, atlasProfile, atlasResolveGameBookPlayers, atlasSearch, atlasSearchSuggestions, atlasStats } from "./atlasData";
import { compareFieldlineSelections, FIELDLINE_TEAM_CODES, FIELDLINE_TEAM_NAMES, getFieldlineFreshness, getFieldlineRefreshSchedules, getFieldlineSeasons, getFieldlineWeeks, importFieldlineSeasonFromNflverse } from "./fieldlineData";
import { getOfficialGameStats } from "./officialGameStats";
import { playoffRouter } from "./playoffRouter";

const fieldlineVenueSchema = z.enum(["all", "home", "away"]);
const fieldlineSelectionSchema = z.object({
  season: z.number().int().min(2025).max(2100),
  team: z.string().length(2).or(z.string().length(3)),
  weeks: z.array(z.number().int().min(1).max(18)).min(1).max(18),
  venue: fieldlineVenueSchema.default("all"),
});
const fieldlineAdminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "管理者権限が必要です。" });
  return next({ ctx });
});

// 重複生成を防ぐための処理中アイテム管理
const activeSummaryItemIds = new Set<number>();

/**
 * トップページ表示をブロックせず、裏側で未要約の最新ニュースを1件ずつ直列に先回り生成する
 */
async function prefetchUnsummarizedNews(
  items: Array<{ id: number; title: string; summary: string | null; japaneseSummary?: string | null; category: string }>,
  limit = 5
) {
  if (!NEWS_SUMMARIES_ENABLED || !items || items.length === 0) return;

  // 未要約の最新ニュース記事（最大 limit 件）を抽出
  const targets = items
    .filter((item) => item.category === "news" && !item.japaneseSummary && !activeSummaryItemIds.has(item.id))
    .slice(0, limit);

  if (targets.length === 0) return;

  for (const item of targets) {
    activeSummaryItemIds.add(item.id);
    try {
      // 既にDBで要約されていないか念のため再確認
      const freshItem = await getOfficialFeedItemById(item.id);
      if (freshItem?.japaneseSummary) {
        continue;
      }

      const textToSummarize = item.summary || item.title;
      const result = await generateBilingualSummary(item.title, textToSummarize);
      if (result?.japaneseSummary) {
        await saveOfficialFeedJapaneseSummary(item.id, result.japaneseSummary);
      }

      // API過負荷（429 / 503）を防ぐため、1件完了ごとに1.5秒のインターバルを設ける
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.warn("[Background News Summary] Failed for item", {
        itemId: item.id,
        error: error instanceof Error ? error.message : error,
      });
    } finally {
      activeSummaryItemIds.delete(item.id);
    }
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  officialFeed: router({
    byTeam: publicProcedure.input(z.object({ teamCode: z.string().length(2).or(z.string().length(3)) })).query(async ({ input }) => {
      const feed = await getFreshOfficialTeamFeed(input.teamCode.toUpperCase());

      // 画面の返却を一切待たせず、バックグラウンドで最新5件の未要約ニュースを順次先回り生成
      if (feed?.items?.length) {
        void prefetchUnsummarizedNews(feed.items, 5);
      }

      return feed;
    }),
    refresh: publicProcedure.input(z.object({ teamCode: z.string().length(2).or(z.string().length(3)) })).mutation(async ({ input }) => {
      const count = await refreshOfficialTeamFeed(input.teamCode.toUpperCase());
      return { count };
    }),
    japaneseSummary: publicProcedure.input(z.object({ itemId: z.number().int().positive() })).mutation(async ({ input }) => {
      if (!NEWS_SUMMARIES_ENABLED) return { itemId: input.itemId, summary: null, generated: false, frozen: true };
      const item = await getOfficialFeedItemById(input.itemId);
      if (!item) throw new Error("Official news item was not found");
      
      // バックグラウンド等で既にDBに保存されていれば即座に返却（0.1秒表示）
      if (item.japaneseSummary) {
        return { itemId: item.id, summary: item.japaneseSummary, generated: true };
      }

      try {
        const textToSummarize = item.summary || item.title;
        const result = await generateBilingualSummary(item.title, textToSummarize);
        if (result?.japaneseSummary) {
          await saveOfficialFeedJapaneseSummary(item.id, result.japaneseSummary);
          return { itemId: item.id, summary: result.japaneseSummary, generated: true };
        }
      } catch (error) {
        console.warn("[Official news summary] generation unavailable", { itemId: item.id, error: error instanceof Error ? error.message : error });
      }
      return { itemId: item.id, summary: null, generated: false };
    }),
    englishSummary: publicProcedure.input(z.object({ itemId: z.number().int().positive() })).mutation(async ({ input }) => {
      if (!NEWS_SUMMARIES_ENABLED) return { itemId: input.itemId, summary: null, generated: false, frozen: true };
      const item = await getOfficialFeedItemById(input.itemId);
      if (!item) throw new Error("Official news item was not found");
      if (item.englishSummary) return { itemId: item.id, summary: item.englishSummary, generated: true };

      try {
        const textToSummarize = item.summary || item.title;
        const result = await generateBilingualSummary(item.title, textToSummarize);
        if (result?.englishSummary) {
          await saveOfficialFeedEnglishSummary(item.id, result.englishSummary);
          return { itemId: item.id, summary: result.englishSummary, generated: true };
        }
      } catch (error) {
        console.warn("[Official English news summary] generation unavailable", { itemId: item.id, error: error instanceof Error ? error.message : error });
      }
      return { itemId: item.id, summary: null, generated: false };
    }),
  }),
  teamSnapshot: router({
    byTeam: publicProcedure.input(z.object({ teamCode: z.string().length(2).or(z.string().length(3)), skipGameUrl: z.string().url().optional(), forceLastGame: z.boolean().optional(), includeRoster: z.boolean().optional() })).query(({ input }) => {
      return getCachedOfficialTeamSnapshot(input.teamCode, input.skipGameUrl, input.forceLastGame, input.includeRoster ?? true);
    }),
  }),
  leagueDashboard: router({
    summary: publicProcedure.query(() => getCachedOfficialLeagueDashboardSummary()),
    latestResult: publicProcedure.input(z.object({ teamCode: z.string().length(2).or(z.string().length(3)) })).query(({ input }) => getCachedOfficialLatestResult(input.teamCode)),
    calendar: publicProcedure.input(z.object({ teamCode: z.string().length(2).or(z.string().length(3)) })).query(({ input }) => getCachedOfficialLeagueCalendar(input.teamCode)),
  }),
  gameStats: router({
    byGameUrl: publicProcedure.input(z.object({ gameUrl: z.string().url().refine((value) => /^https:\/\/www\.nfl\.com\/games\//.test(value), "NFL公式Game Center URLが必要です。") })).query(({ input }) => getOfficialGameStats(input.gameUrl)),
  }),
  atlas: router({
    filters: publicProcedure.input(z.object({ team: z.string().min(2).optional() }).optional()).query(({ input }) => atlasFilters(input?.team)),
    searchSuggestions: publicProcedure.input(z.object({ query: z.string().trim().max(80) })).query(({ input }) => atlasSearchSuggestions(input.query)),
    search: publicProcedure.input(z.object({ query: z.string().trim().max(80) })).query(({ input }) => atlasSearch(input.query)),
    resolveGameBookPlayers: publicProcedure.input(z.object({ entries: z.array(z.object({ team: z.string().min(2).max(4), name: z.string().trim().min(1).max(80) })).max(240) })).query(({ input }) => atlasResolveGameBookPlayers(input.entries)),
    browse: publicProcedure.input(z.object({ team: z.string().min(2), position: z.string().min(1).optional(), jersey: z.string().trim().max(3).optional() })).query(({ input }) => atlasBrowse(input)),
    profile: publicProcedure.input(z.object({ playerId: z.string().min(1) })).query(({ input }) => atlasProfile(input.playerId)),
    career: publicProcedure.input(z.object({ playerId: z.string().min(1) })).query(({ input }) => atlasCareer(input.playerId)),
    awards: publicProcedure.input(z.object({ playerId: z.string().min(1) })).query(({ input }) => atlasAwards(input.playerId)),
    stats: publicProcedure.input(z.object({ playerId: z.string().min(1) })).query(({ input }) => atlasStats(input.playerId)),
    contracts: publicProcedure.input(z.object({ playerId: z.string().min(1) })).query(({ input }) => atlasContracts(input.playerId)),
  }),
  fieldline: router({
    teams: publicProcedure.query(() => FIELDLINE_TEAM_CODES.map(code => ({ code, name: FIELDLINE_TEAM_NAMES[code] }))),
    seasons: publicProcedure.query(getFieldlineSeasons),
    freshness: publicProcedure.input(z.object({ seasons: z.array(z.number().int().min(2025).max(2100)).min(1).max(2) })).query(({ input }) => getFieldlineFreshness(input.seasons)),
    weeks: publicProcedure.input(z.object({ season: z.number().int().min(2025).max(2100), team: z.string().length(2).or(z.string().length(3)), venue: fieldlineVenueSchema.default("all") })).query(({ input }) => getFieldlineWeeks(input.season, input.team, input.venue)),
    compare: publicProcedure.input(z.object({ left: fieldlineSelectionSchema, right: fieldlineSelectionSchema })).query(async ({ input }) => {
      const [left, right] = await compareFieldlineSelections([input.left, input.right]);
      return { left, right };
    }),
  }),
  fieldlineAdmin: router({
    imports: fieldlineAdminProcedure.query(getFieldlineSeasons),
    refreshSchedules: fieldlineAdminProcedure.query(getFieldlineRefreshSchedules),
    importSeason: fieldlineAdminProcedure.input(z.object({ season: z.number().int().min(2025).max(2100) })).mutation(({ input, ctx }) => importFieldlineSeasonFromNflverse(input.season, ctx.user.openId)),
  }),
  playoff: playoffRouter,
});

export type AppRouter = typeof appRouter;
