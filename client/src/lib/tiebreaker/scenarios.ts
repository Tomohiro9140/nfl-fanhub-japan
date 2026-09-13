import { ScheduledGame } from "./types";
import { ALL_TEAMS } from "./nflTeams";

export type ScenarioPreset = {
  id: string;
  name: string;
  descriptionJa: string;
  targetWeek: number;
  games: ScheduledGame[];
};

/**
 * 32チームが各週「必ず1試合（16カード）」を行う重複なしのスケジュールを生成
 */
function createValidSchedule(): ScheduledGame[] {
  const games: ScheduledGame[] = [];
  const teams = [...ALL_TEAMS]; // 32チーム
  const n = teams.length;
  let gameId = 1;

  // ラウンドロビン方式で18週の対戦カードを生成（同一週内のチーム重複を完全防止）
  for (let round = 0; round < 18; round++) {
    const week = round + 1;
    const roundTeams = [...teams];

    // ラウンドごとに配列を回転させて対戦相手を変動
    const offset = round % (n - 1);
    const rotated = [roundTeams[0], ...roundTeams.slice(1 + offset), ...roundTeams.slice(1, 1 + offset)];

    for (let i = 0; i < n / 2; i++) {
      const home = rotated[i];
      const away = rotated[n - 1 - i];

      games.push({
        id: gameId++,
        season: 2026,
        week,
        homeTeam: round % 2 === 0 ? home : away,
        awayTeam: round % 2 === 0 ? away : home,
        isFinished: false,
      });
    }
  }

  return games;
}

const baseGames = createValidSchedule();

/**
 * 強豪チームの基本戦績シミュレーション重み付け
 */
const STRONG_TEAMS = new Set(["KC", "BUF", "BAL", "DET", "SF", "PHI", "GB", "CIN"]);
const WEAK_TEAMS = new Set(["CAR", "NE", "NYG", "TEN", "DEN", "LV"]);

function determineOutcome(home: string, away: string, salt: number): "home" | "away" {
  if (STRONG_TEAMS.has(home) && WEAK_TEAMS.has(away)) return "home";
  if (WEAK_TEAMS.has(home) && STRONG_TEAMS.has(away)) return "away";
  return salt % 2 === 0 ? "home" : "away";
}

function buildWeek12Scenario(): ScheduledGame[] {
  return baseGames.map((game) => {
    if (game.week < 12) {
      return {
        ...game,
        outcome: determineOutcome(game.homeTeam, game.awayTeam, game.id),
        isFinished: true,
      };
    }
    return { ...game, isFinished: false };
  });
}

function buildWeek18Scenario(): ScheduledGame[] {
  return baseGames.map((game) => {
    if (game.week < 18) {
      return {
        ...game,
        outcome: determineOutcome(game.homeTeam, game.awayTeam, game.id + game.week),
        isFinished: true,
      };
    }
    return { ...game, isFinished: false };
  });
}

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
    descriptionJa: "シーズン終盤戦に突入した時点の検証モデル。タイブレーカーの直接対決やカンファレンス勝率が活発に発動します。",
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
