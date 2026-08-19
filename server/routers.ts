import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getFreshOfficialTeamFeed, refreshOfficialTeamFeed } from "./officialFeeds";
import { getOfficialFeedItemById, getOfficialLeagueCalendar, getOfficialLeagueDashboardSummary, getOfficialTeamSnapshot, saveOfficialFeedEnglishSummary, saveOfficialFeedJapaneseSummary } from "./db";
import { generateOfficialNewsEnglishSummary, generateOfficialNewsJapaneseSummary } from "./newsJapaneseSummary";
import { NEWS_SUMMARIES_ENABLED } from "@shared/newsSummaryFeature";
import { z } from "zod";
import { atlasAwards, atlasBrowse, atlasCareer, atlasContracts, atlasFilters, atlasProfile, atlasSearch, atlasStats } from "./atlasData";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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
      return getFreshOfficialTeamFeed(input.teamCode.toUpperCase());
    }),
    refresh: publicProcedure.input(z.object({ teamCode: z.string().length(2).or(z.string().length(3)) })).mutation(async ({ input }) => {
      const count = await refreshOfficialTeamFeed(input.teamCode.toUpperCase());
      return { count };
    }),
    japaneseSummary: publicProcedure.input(z.object({ itemId: z.number().int().positive() })).mutation(async ({ input }) => {
      if (!NEWS_SUMMARIES_ENABLED) return { itemId: input.itemId, summary: null, generated: false, frozen: true };
      const item = await getOfficialFeedItemById(input.itemId);
      if (!item) throw new Error("Official news item was not found");
      if (item.japaneseSummary) return { itemId: item.id, summary: item.japaneseSummary, generated: true };
      try {
        const summary = await generateOfficialNewsJapaneseSummary(item);
        if (summary) {
          await saveOfficialFeedJapaneseSummary(item.id, summary);
          return { itemId: item.id, summary, generated: true };
        }
      } catch (error) {
        console.warn("[Official news summary] generation unavailable", { itemId: item.id, error: error instanceof Error ? error.message : error });
      }
      return { itemId: item.id, summary: item.summary, generated: false };
    }),
    englishSummary: publicProcedure.input(z.object({ itemId: z.number().int().positive() })).mutation(async ({ input }) => {
      if (!NEWS_SUMMARIES_ENABLED) return { itemId: input.itemId, summary: null, generated: false, frozen: true };
      const item = await getOfficialFeedItemById(input.itemId);
      if (!item) throw new Error("Official news item was not found");
      if (item.englishSummary) return { itemId: item.id, summary: item.englishSummary, generated: true };
      try {
        const summary = await generateOfficialNewsEnglishSummary(item);
        if (summary) {
          await saveOfficialFeedEnglishSummary(item.id, summary);
          return { itemId: item.id, summary, generated: true };
        }
      } catch (error) {
        console.warn("[Official English news summary] generation unavailable", { itemId: item.id, error: error instanceof Error ? error.message : error });
      }
      return { itemId: item.id, summary: item.summary, generated: false };
    }),
  }),
  teamSnapshot: router({
    byTeam: publicProcedure.input(z.object({ teamCode: z.string().length(2).or(z.string().length(3)), skipGameUrl: z.string().url().optional() })).query(({ input }) => {
      return getOfficialTeamSnapshot(input.teamCode.toUpperCase(), input.skipGameUrl);
    }),
  }),
  leagueDashboard: router({
    summary: publicProcedure.query(() => getOfficialLeagueDashboardSummary()),
    calendar: publicProcedure.input(z.object({ teamCode: z.string().length(2).or(z.string().length(3)) })).query(({ input }) => getOfficialLeagueCalendar(input.teamCode.toUpperCase())),
  }),
  atlas: router({
    filters: publicProcedure.input(z.object({ team: z.string().min(2).optional() }).optional()).query(({ input }) => atlasFilters(input?.team)),
    search: publicProcedure.input(z.object({ query: z.string().trim().max(80) })).query(({ input }) => atlasSearch(input.query)),
    browse: publicProcedure.input(z.object({ team: z.string().min(2), position: z.string().min(1).optional(), jersey: z.string().trim().max(3).optional() })).query(({ input }) => atlasBrowse(input)),
    profile: publicProcedure.input(z.object({ playerId: z.string().min(1) })).query(({ input }) => atlasProfile(input.playerId)),
    career: publicProcedure.input(z.object({ playerId: z.string().min(1) })).query(({ input }) => atlasCareer(input.playerId)),
    awards: publicProcedure.input(z.object({ playerId: z.string().min(1) })).query(({ input }) => atlasAwards(input.playerId)),
    stats: publicProcedure.input(z.object({ playerId: z.string().min(1) })).query(({ input }) => atlasStats(input.playerId)),
    contracts: publicProcedure.input(z.object({ playerId: z.string().min(1) })).query(({ input }) => atlasContracts(input.playerId)),
  }),
});

export type AppRouter = typeof appRouter;
