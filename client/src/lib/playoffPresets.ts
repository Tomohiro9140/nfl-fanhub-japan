// client/src/lib/playoffPresets.ts

export type SimPickWinner = "home" | "away";
export type SimulationPicks = Record<string | number, SimPickWinner>;

export interface SimGame {
  id: string | number;
  week: number | string;
  awayTeamCode: string;
  homeTeamCode: string;
  isFinished?: boolean;
  actualWinner?: SimPickWinner | null;
}

export interface TeamRecordLookup {
  [teamCode: string]: {
    wins: number;
    losses: number;
    ties: number;
    winPct: number;
  };
}

export type PresetType = "better_record" | "home_wins" | "run_the_table" | "underdogs";

export interface ApplyPresetOptions {
  preset: PresetType;
  favoriteTeam?: string; // "run_the_table" 時に対象とするチームコード
  mode: "fill_remaining" | "overwrite_all";
  currentPicks: SimulationPicks;
  games: SimGame[];
  teamRecords: TeamRecordLookup; // 現在時点（または最新）のチーム成績
}

/**
 * プリセットに基づき勝敗シミュレーション結果を一括生成する
 */
export function generatePresetPicks(options: ApplyPresetOptions): SimulationPicks {
  const { preset, favoriteTeam, mode, currentPicks, games, teamRecords } = options;
  const newPicks: SimulationPicks = mode === "overwrite_all" ? {} : { ...currentPicks };

  const getTeamWinPct = (code: string) => teamRecords[code]?.winPct ?? 0.5;

  for (const game of games) {
    // 既に公式終了している試合はシミュレーション対象外
    if (game.isFinished) continue;

    // 「未選択のみ埋める」モードで既に選択されている場合はスキップ
    if (mode === "fill_remaining" && currentPicks[game.id]) {
      continue;
    }

    const awayPct = getTeamWinPct(game.awayTeamCode);
    const homePct = getTeamWinPct(game.homeTeamCode);

    switch (preset) {
      case "home_wins":
        // 2. ホーム全勝
        newPicks[game.id] = "home";
        break;

      case "better_record":
        // 1. 勝率上位の勝利（同率ならホーム勝利）
        if (awayPct > homePct) {
          newPicks[game.id] = "away";
        } else {
          newPicks[game.id] = "home";
        }
        break;

      case "underdogs":
        // 4. 最大波乱 / アンダードッグ勝利（同率ならアウェイ勝利）
        if (awayPct < homePct) {
          newPicks[game.id] = "away";
        } else {
          newPicks[game.id] = "home";
        }
        break;

      case "run_the_table":
        // 3. 推しチーム全勝（他試合は勝率上位）
        if (favoriteTeam && (game.awayTeamCode === favoriteTeam || game.homeTeamCode === favoriteTeam)) {
          newPicks[game.id] = game.awayTeamCode === favoriteTeam ? "away" : "home";
        } else {
          // 推しチーム以外の試合は勝率上位で補完
          if (awayPct > homePct) {
            newPicks[game.id] = "away";
          } else {
            newPicks[game.id] = "home";
          }
        }
        break;
    }
  }

  return newPicks;
}
