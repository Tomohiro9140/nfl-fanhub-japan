import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getFreshOfficialTeamFeed, refreshOfficialTeamFeed } from "./officialFeeds";
import { getOfficialFeedItemById, getOfficialLeagueDashboard, getOfficialTeamSnapshot, saveOfficialFeedEnglishSummary, saveOfficialFeedJapaneseSummary } from "./db";
import { generateOfficialNewsEnglishSummary, generateOfficialNewsJapaneseSummary } from "./newsJapaneseSummary";
import { z } from "zod";

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
    summary: publicProcedure.query(() => getOfficialLeagueDashboard()),
  }),
});

export type AppRouter = typeof appRouter;
