import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { officialGames, teamWeekStats } from "../drizzle/schema";
import { and, eq } from "drizzle-orm";

export const playoffRouter = router({
  /**
   * レギュラーシーズン公式スケジュール（全272試合）と消化済み勝敗を取得
   */
  getSchedule: publicProcedure
    .input(
      z
        .object({
          season: z.number().int().default(2026),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const season = input?.season ?? 2026;
      const db = await getDb();
      if (!db) {
        return { season, games: [] };
      }

      // 1. 公式レギュラーシーズンの全対戦カード（ホーム視点の272試合）を取得
      const scheduledRows = await db
        .select({
          id: officialGames.id,
          teamCode: officialGames.teamCode,
          opponentCode: officialGames.opponentCode,
          weekLabel: officialGames.weekLabel,
          kickoffAt: officialGames.kickoffAt,
        })
        .from(officialGames)
        .where(
          and(
            eq(officialGames.seasonPhase, "regular"),
            eq(officialGames.homeAway, "home")
          )
        );

      // 同一週・同一対戦カードの重複を排除（確定日程、またはより新しいレコードを優先）
      const dedupedRowsMap = new Map<string, (typeof scheduledRows)[number]>();
      for (const row of scheduledRows) {
        const match = row.weekLabel?.match(/WEEK\s*(\d+)/i);
        const week = match ? Number.parseInt(match[1], 10) : 1;
        const key = `W${week}_${row.teamCode}_${row.opponentCode}`;

        const existing = dedupedRowsMap.get(key);
        if (!existing) {
          dedupedRowsMap.set(key, row);
          continue;
        }

        // 秒が 59（TBD仮日程）かどうかの判定
        const existingIsTbd = existing.kickoffAt ? new Date(existing.kickoffAt).getSeconds() === 59 : true;
        const rowIsTbd = row.kickoffAt ? new Date(row.kickoffAt).getSeconds() === 59 : true;

        // 確定日程（TBDでない方）を優先。両方同条件なら新しいIDを採用
        if (existingIsTbd && !rowIsTbd) {
          dedupedRowsMap.set(key, row);
        } else if (existingIsTbd === rowIsTbd && row.id > existing.id) {
          dedupedRowsMap.set(key, row);
        }
      }
      const uniqueScheduledRows = Array.from(dedupedRowsMap.values());

      // 2. 消化済み週のスタッツ（勝敗判定用）を取得
      const statsRows = await db
        .select({
          team: teamWeekStats.team,
          week: teamWeekStats.week,
          games: teamWeekStats.games,
          pointsFor: teamWeekStats.pointsFor,
          pointsAgainst: teamWeekStats.pointsAgainst,
        })
        .from(teamWeekStats)
        .where(eq(teamWeekStats.season, season));

      const statsMap = new Map<string, { games: number; pf: number; pa: number }>();
      for (const row of statsRows) {
        statsMap.set(`${row.team}_W${row.week}`, {
          games: row.games,
          pf: row.pointsFor,
          pa: row.pointsAgainst,
        });
      }

      // 3. 各試合の週番号と勝敗（終了済みの場合は確定結果）を構築
      const games = uniqueScheduledRows
        .map((row) => {
          const match = row.weekLabel?.match(/WEEK\s*(\d+)/i);
          const week = match ? Number.parseInt(match[1], 10) : 1;

          const homeStat = statsMap.get(`${row.teamCode}_W${week}`);
          const awayStat = statsMap.get(`${row.opponentCode}_W${week}`);

          const isFinished = Boolean(
            homeStat && awayStat && homeStat.games > 0 && awayStat.games > 0
          );

          let outcome: "home" | "away" | "tie" | undefined = undefined;
          if (isFinished && homeStat) {
            if (homeStat.pf > homeStat.pa) {
              outcome = "home";
            } else if (homeStat.pf < homeStat.pa) {
              outcome = "away";
            } else {
              outcome = "tie";
            }
          }

          return {
            id: row.id,
            season,
            week,
            homeTeam: row.teamCode,
            awayTeam: row.opponentCode,
            outcome,
            isFinished,
          };
        })
        .sort((a, b) => a.week - b.week || a.id - b.id);

      return {
        season,
        games,
      };
    }),
});
