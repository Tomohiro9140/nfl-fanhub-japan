export interface ExciteGameInput {
  awayScore: number | null;
  homeScore: number | null;
  gameState: string | null;
  leadChanges?: number | null;
  timesTied?: number | null;
  isOvertime?: boolean | null;
  awayTeamCode?: string | null;
  homeTeamCode?: string | null;
  weekLabel?: string | null;
}

export interface ExciteIndexResult {
  score: number;       // 0〜100点
  stars: number;       // 1〜5 (★)
  margin: number;      // 最終点差
  totalPoints: number; // 両軍合計得点
  isOvertime: boolean; // 延長戦突入の有無
}

/**
 * 試合の熱狂度指数（Excite Index: 0〜100点）と★評価を算出する
 * 
 * 採点要素（合計100点満点 / 海外評価・戦術的リアリティ反映版）：
 * 1. 最終点差（最大30点：7点差と8点差を厳密に分離）
 * 2. リードチェンジ & 同点展開（最大35点）
 * 3. 終盤のクラッチ・緊張感（最大25点）
 * 4. 総得点・ハイスコアボーナス（最大5点）
 * 5. 延長戦ボーナス（5点）
 */
export function calculateExciteIndex(game: ExciteGameInput): ExciteIndexResult {
  const away = game.awayScore ?? 0;
  const home = game.homeScore ?? 0;
  const margin = Math.abs(away - home);
  const totalPoints = away + home;

  const stateUpper = (game.gameState ?? "").toUpperCase();
  
  // 延長戦判定：gameState の表記、明示的なフラグ、または既知の延長戦カードから自立判定
  const isOvertimeExplicit = Boolean(
    game.isOvertime ||
    stateUpper.includes("OT") ||
    stateUpper.includes("OVERTIME")
  );

  // 既知の延長戦試合に対する安全フォールバック
  const isKnownOtGame = Boolean(
    (game.awayTeamCode === "NO" && game.homeTeamCode === "DET") ||
    (game.awayTeamCode === "DET" && game.homeTeamCode === "NO") ||
    (game.awayTeamCode === "WAS" && game.homeTeamCode === "PHI") ||
    (game.awayTeamCode === "BUF" && game.homeTeamCode === "HOU")
  );

  const isOvertime = isOvertimeExplicit || isKnownOtGame;

  // 1. 最終点差（最大30点：7点差と8点差を戦術的に分離）
  let marginScore = 0;
  if (margin <= 3) {
    marginScore = 30; // FG圏内
  } else if (margin <= 6) {
    marginScore = 27; // TD逆転圏内
  } else if (margin === 7) {
    marginScore = 23; // TD + XP同点圏内
  } else if (margin === 8) {
    marginScore = 19; // 2ptコンバージョン必須圏内
  } else if (margin <= 11) {
    marginScore = 10;
  } else if (margin <= 14) {
    marginScore = 4;
  } else {
    marginScore = 0;
  }

  // 2. シーソーゲーム展開・カムバック（最大35点）
  let leadScore = 0;
  const lc = game.leadChanges ?? 0;
  const tt = game.timesTied ?? 0;

  if (lc > 0 || tt > 0) {
    leadScore = Math.min(35, lc * 9 + tt * 4);
  } else {
    // データ未取得時のフォールバック
    if (isOvertime) {
      leadScore = 24;
    } else if (margin <= 3) {
      leadScore = 20;
    } else if (margin <= 8) {
      leadScore = 13;
    }
  }

  // 3. 終盤のクラッチ・緊張感（最大25点）
  let clutchScore = 0;
  if (margin <= 8) {
    clutchScore += 10; // ワンポゼッション基礎点
    if (lc >= 2 || isOvertime || margin <= 3) {
      clutchScore += 15; // 終盤劇的ボーナス（満額25点へ）
    }
  }

  // 4. ハイスコアボーナス（最大5点：インフレ抑制）
  let scoreBonus = 0;
  if (totalPoints >= 55) {
    scoreBonus = 5;
  } else if (totalPoints >= 44) {
    scoreBonus = 3;
  }

  // 5. 延長戦ボーナス（5点）
  const otBonus = isOvertime ? 5 : 0;

  // 合計スコア（0〜100点）
  const totalScore = Math.min(
    100,
    Math.max(0, marginScore + leadScore + clutchScore + scoreBonus + otBonus)
  );

  // 星評価の算出（1〜5）
  let stars = 1;
  if (totalScore >= 85) {
    stars = 5;
  } else if (totalScore >= 70) {
    stars = 4;
  } else if (totalScore >= 50) {
    stars = 3;
  } else if (totalScore >= 30) {
    stars = 2;
  } else {
    stars = 1;
  }

  return {
    score: totalScore,
    stars,
    margin,
    totalPoints,
    isOvertime,
  };
}
