/**
 * NFLシーズン年の判定を1か所にまとめる。
 *
 * シーズンは9月開幕・2月のスーパーボウルで終わるので、1〜6月は前年のシーズンとして扱う。
 * 3月ではなく7月に切り替えるのは、オフシーズンの間も直前シーズンの最終順位・結果・日程を
 * 表示し続け、5月の翌年日程発表で日程データが翌年分に置き換わらないようにするため。
 */
export const SEASON_ROLLOVER_MONTH = 7; // 7月1日（UTC）から新シーズン

export function nflSeasonFor(date: Date = new Date()): number {
  return date.getUTCMonth() + 1 >= SEASON_ROLLOVER_MONTH ? date.getUTCFullYear() : date.getUTCFullYear() - 1;
}

/** 例: 2026 → "2026-27" */
export function nflSeasonDisplayLabel(season: number): string {
  return `${season}-${String((season + 1) % 100).padStart(2, "0")}`;
}

/** そのシーズン終了後に行われるドラフトの年（例: 2026シーズン → 2027年ドラフト） */
export function nflDraftYearFor(season: number): number {
  return season + 1;
}
