import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { officialScoreboardGames } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { calculateExciteIndex } from "./exciteIndex";

export const exciteIndexRouter = router({
  /**
   * 指定シーズン・週の試合一覧と Excite Index（熱狂度指数・星評価・ランキング順位）を取得する
   */
  getWeeklyRankings: publicProcedure
    .input(
      z
        .object({
          season: z.number().int().default(2026),
          weekLabel: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const season = input?.season ?? 2026;
      const db = await getDb();
      if (!db) {
        return { season, weekLabel: null, availableWeeks: [], games: [] };
      }

      // 該当シーズンの全スコアボード試合を取得
      const allGames = await db
        .select()
        .from(officialScoreboardGames)
        .where(eq(officialScoreboardGames.season, season))
        .orderBy(desc(officialScoreboardGames.kickoffAt));

      if (allGames.length === 0) {
        return { season, weekLabel: null, availableWeeks: [], games: [] };
      }

      // 存在する週リスト（重複排除）
      const weekSet = new Set<string>();
      for (const g of allGames) {
        if (g.weekLabel) weekSet.add(g.weekLabel);
      }
      const availableWeeks = Array.from(weekSet);

      // 対象週の選定（指定がなければ、終了試合がある最新週、または最新の週）
      let targetWeek = input?.weekLabel;
      if (!targetWeek) {
        const latestFinal = allGames.find((g) => {
          const s = (g.gameState ?? "").toUpperCase();
          return s.includes("FINAL") || s.includes("COMPLETED");
        });
        targetWeek = latestFinal?.weekLabel ?? allGames[0]?.weekLabel ?? availableWeeks[0] ?? null;
      }

      // 対象週の試合をフィルタ
      const targetGames = targetWeek
        ? allGames.filter((g) => g.weekLabel === targetWeek)
        : allGames;

      // Excite Index の計算（チームコード・週ラベルを渡し、DB の gameState に依存せず自律判定）
      const gamesWithIndex = targetGames.map((game) => {
        const stateUpper = (game.gameState ?? "").toUpperCase();
        const isFinal = stateUpper.includes("FINAL") || stateUpper.includes("COMPLETED");

        let excite = null;
        if (isFinal) {
          excite = calculateExciteIndex({
            awayScore: game.awayScore,
            homeScore: game.homeScore,
            gameState: game.gameState,
            leadChanges: game.leadChanges,
            timesTied: game.timesTied,
            awayTeamCode: game.awayTeamCode,
            homeTeamCode: game.homeTeamCode,
            weekLabel: game.weekLabel,
          });
        }

        return {
          id: game.id,
          externalId: game.externalId,
          season: game.season,
          seasonPhase: game.seasonPhase,
          weekLabel: game.weekLabel,
          awayTeamCode: game.awayTeamCode,
          homeTeamCode: game.homeTeamCode,
          awayScore: game.awayScore,
          homeScore: game.homeScore,
          gameState: game.gameState,
          gameDate: game.gameDate,
          kickoffAt: game.kickoffAt,
          gameUrl: game.gameUrl,
          nflHighlightUrl: game.nflHighlightUrl,
          exciteIndex: excite,
        };
      });

      // 熱狂度スコアが高い順にソート（未終了試合は末尾）
      gamesWithIndex.sort((a, b) => {
        const scoreA = a.exciteIndex?.score ?? -1;
        const scoreB = b.exciteIndex?.score ?? -1;
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        const timeA = a.kickoffAt ? new Date(a.kickoffAt).getTime() : 0;
        const timeB = b.kickoffAt ? new Date(b.kickoffAt).getTime() : 0;
        return timeB - timeA;
      });

      // 順位（rank: 1位〜）を付与
      let rankCounter = 1;
      const gamesWithRank = gamesWithIndex.map((game) => {
        if (game.exciteIndex) {
          return { ...game, rank: rankCounter++ };
        }
        return { ...game, rank: null };
      });

      return {
        season,
        weekLabel: targetWeek,
        availableWeeks,
        games: gamesWithRank,
      };
    }),
});
