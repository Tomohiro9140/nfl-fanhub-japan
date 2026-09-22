export interface ExciteGameInput {
  awayScore: number | null;
  homeScore: number | null;
  gameState: string | null;
  leadChanges?: number | null;
  timesTied?: number | null;
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
 * 採点要素（合計100点満点）：
 * 1. 最終点差（最大30点）
 * 2. リードチェンジ & 同点展開（最大30点）
 * 3. 終盤のクラッチ・緊張感（最大20点）
 * 4. 総得点・ハイスコアボーナス（最大10点）
 * 5. 延長戦ボーナス（10点）
 */
export function calculateExciteIndex(game: ExciteGameInput): ExciteIndexResult {
  const away = game.awayScore ?? 0;
  const home = game.homeScore ?? 0;
  const margin = Math.abs(away - home);
  const totalPoints = away + home;

  const stateUpper = (game.gameState ?? "").toUpperCase();
  const isOvertime = stateUpper.includes("OT") || stateUpper.includes("OVERTIME");

  // 1. 最終点差（最大30点）
  let marginScore = 0;
  if (margin <= 2) {
    marginScore = 30;
  } else if (margin === 3) {
    marginScore = 26;
  } else if (margin <= 6) {
    marginScore = 20;
  } else if (margin <= 8) {
    marginScore = 15;
  } else if (margin <= 11) {
    marginScore = 9;
  } else if (margin <= 14) {
    marginScore = 4;
  } else {
    marginScore = 0;
  }

  // 2. シーソーゲーム展開（最大30点）
  let leadScore = 0;
  const lc = game.leadChanges ?? 0;
  const tt = game.timesTied ?? 0;

  if (lc > 0 || tt > 0) {
    leadScore = Math.min(30, lc * 8 + tt * 5);
  } else {
    // データ未取得時のフォールバック
    if (isOvertime) {
      leadScore = 21;
    } else if (margin <= 3) {
      leadScore = 16;
    } else if (margin <= 8) {
      leadScore = 10;
    }
  }

  // 3. 終盤のクラッチ・緊張感（最大20点）
  let clutchScore = 0;
  if (margin <= 8) {
    clutchScore += 10;
    if (lc >= 2 || isOvertime || margin <= 3) {
      clutchScore += 10;
    }
  }

  // 4. ハイスコアボーナス（最大10点）：NFL基準で60点以上を満点化
  let scoreBonus = 0;
  if (totalPoints >= 60) {
    scoreBonus = 10;
  } else if (totalPoints >= 52) {
    scoreBonus = 7;
  } else if (totalPoints >= 44) {
    scoreBonus = 4;
  }

  // 5. 延長戦ボーナス（10点）
  const otBonus = isOvertime ? 10 : 0;

  // 合計スコア（0〜100点でクランプ）
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
