/**
 * キックオフ時刻の「仮の時刻」の扱いを1か所にまとめる。
 *
 * NFL公式の日程ページは、試合が始まるとその試合のカードから開始時刻が消える。
 * 時刻を読めなかったときは週番号などから仮の時刻を作り、秒を59にして区別している。
 * 仮の時刻は実際より遅いことがある（国際試合・サンクスギビングなど）ので、確定した時刻として扱わない。
 */
export const ESTIMATED_KICKOFF_SECONDS = 59;

export function isEstimatedKickoff(value: Date | string | number | null | undefined): boolean {
  if (value == null) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getUTCSeconds() === ESTIMATED_KICKOFF_SECONDS;
}

/**
 * 仮の時刻しかない試合で、ネタバレ防止を何日前から効かせるか。
 * 仮の時刻は「その週の日曜」になるため、木曜（サンクスギビング）や水曜（クリスマス）の試合まで覆えるよう4日前からにする。
 */
export const ESTIMATED_KICKOFF_SPOILER_LEAD_MS = 4 * 24 * 60 * 60 * 1_000;
