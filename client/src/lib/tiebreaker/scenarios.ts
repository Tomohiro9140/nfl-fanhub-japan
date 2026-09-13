import { ScheduledGame } from "./types";
import { DIVISIONS } from "./nflTeams";

export type ScenarioPreset = {
  id: string;
  name: string;
  descriptionJa: string;
  targetWeek: number; // 注目するWeek
  games: ScheduledGame[];
};

/**
 * 32チームによる18週（全272試合）の基本スケジュールを生成するヘルパー
 */
function createBaseSchedule(): ScheduledGame[] {
  const games: ScheduledGame[] = [];
  let gameId = 1;

  // 1. 各地区内の総当り対決（ホーム＆アウェー 6試合 × 8地区 = 48対戦 / 96チーム枠）
  const divList = Object.values(DIVISIONS);
  for (const teams of divList) {
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const homeTeam = teams[i];
        const awayTeam = teams[j];

        // 1戦目（Week 2〜9の前半）
        const week1 = ((gameId * 3) % 8) + 2;
        games.push({
          id: gameId++,
          season: 2026,
          week: week1,
          homeTeam,
          awayTeam,
          isFinished: false,
        });

        // 2戦目（Week 12〜18の終盤直接対決）
        const week2 = ((gameId * 7) % 7) + 12;
        games.push({
          id: gameId++,
          season: 2026,
          week: week2,
          homeTeam: awayTeam,
          awayTeam: homeTeam,
          isFinished: false,
        });
      }
    }
  }

  // 2. カンファレンス内・外の対戦カードを補完（Week 1〜18の枠を生成）
  const allTeams = divList.flat();
  for (let w = 1; w <= 18; w++) {
    const currentWeekGames = games.filter((g) => g.week === w);
    const busyTeams = new Set<string>();
    for (const g of currentWeekGames) {
      busyTeams.add(g.homeTeam);
      busyTeams.add(g.awayTeam);
    }

    const freeTeams = allTeams.filter((t) => !busyTeams.has(t));
    for (let i = 0; i + 1 < freeTeams.length; i += 2) {
      games.push({
        id: gameId++,
        season: 2026,
        week: w,
        homeTeam: freeTeams[i],
        awayTeam: freeTeams[i + 1],
        isFinished: false,
      });
    }
  }

  return games.sort((a, b) => a.week - b.week || a.id - b.id);
}

// 基本スケジュール枠
const baseGames = createBaseSchedule();

/**
 * シナリオA: Week 12 混戦ワイルドカード争奪シナリオ
 * （Week 1〜11の試合結果をシミュレーション確定させ、Week 12以降の勝敗トグルを解放）
 */
function buildWeek12Scenario(): ScheduledGame[] {
  return baseGames.map((game) => {
    if (game.week < 12) {
      // 確定済みの勝敗（強豪チームが競り合う現実的な勝率バランス）
      const homeFavorite = ["KC", "BUF", "BAL", "DET", "SF", "PHI", "GB"].includes(game.homeTeam);
      const awayFavorite = ["KC", "BUF", "BAL", "DET", "SF", "PHI", "GB"].includes(game.awayTeam);

      let outcome: "home" | "away" = "home";
      if (awayFavorite && !homeFavorite) {
        outcome = "away";
      } else if (game.id % 3 === 0) {
        outcome = "away";
      }

      return {
        ...game,
        outcome,
        isFinished: true,
      };
    }
    return { ...game, isFinished: false };
  });
}

/**
 * シナリオB: Week 18 運命の最終節決戦シナリオ
 * （Week 1〜17まで全て確定し、Week 18の1試合ごとにシード順位やプレイオフ圏内が激変）
 */
function buildWeek18Scenario(): ScheduledGame[] {
  return baseGames.map((game) => {
    if (game.week < 18) {
      const outcome = (game.id * 7 + game.week) % 2 === 0 ? "home" : "away";
      return {
        ...game,
        outcome,
        isFinished: true,
      };
    }
    return { ...game, isFinished: false };
  });
}

/**
 * シナリオC: 2026年 Week 1 開幕シナリオ
 * （初期状態：Week 1の対戦カードを自由にトグル可能）
 */
function build2026OpeningScenario(): ScheduledGame[] {
  return baseGames.map((game) => ({
    ...game,
    isFinished: false,
  }));
}

export const PLAYOFF_SCENARIOS: ScenarioPreset[] = [
  {
    id: "week12_race",
    name: "Week 12 混戦ワイルドカード争覇モデル",
    descriptionJa: "シーズン終盤戦に突入した時点の検証済みモデル。タイブレーカーの直接対決やカンファレンス勝率が活発に発動します。",
    targetWeek: 12,
    games: buildWeek12Scenario(),
  },
  {
    id: "week18_finale",
    name: "Week 18 最終節決戦モデル",
    descriptionJa: "最終第18週のみを残したクライマックスモデル。1試合のトグルで第1シードや地区優勝チームが即座に入れ替わります。",
    targetWeek: 18,
    games: buildWeek18Scenario(),
  },
  {
    id: "2026_opening",
    name: "2026 シーズン開幕モデル",
    descriptionJa: "全272試合が未消化のフルシミュレーションモデル。シーズン全体の星取表をゼロから作成できます。",
    targetWeek: 1,
    games: build2026OpeningScenario(),
  },
];

export function getScenario(id: string): ScenarioPreset {
  return PLAYOFF_SCENARIOS.find((s) => s.id === id) ?? PLAYOFF_SCENARIOS[0];
}
