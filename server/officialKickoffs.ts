import { isEstimatedKickoff } from "@shared/kickoff";

const WEEK_MS = 7 * 24 * 60 * 60 * 1_000;
// 同じ試合とみなす時刻のずれの上限（仮の時刻は同じ週の日曜になる）
const SAME_GAME_WINDOW_MS = 8 * 24 * 60 * 60 * 1_000;

type ScheduleRow = { externalId: string; opponentCode: string; seasonPhase: string; weekLabel?: string | null; kickoffAt: Date };

/**
 * 日程の再取得で、分かっている正確なキックオフ時刻を仮の時刻で上書きしないようにする。
 * NFL公式の日程ページは試合が始まるとカードから時刻が消えるため、試合中の同期では仮の時刻しか得られない。
 */
export function preserveKnownKickoffs<T extends ScheduleRow>(existing: ScheduleRow[], incoming: T[]): T[] {
  return incoming.map((item) => {
    if (!isEstimatedKickoff(item.kickoffAt)) return item;
    const known = existing.find((row) =>
      row.opponentCode === item.opponentCode &&
      row.seasonPhase === item.seasonPhase &&
      (row.weekLabel ?? null) === (item.weekLabel ?? null) &&
      !isEstimatedKickoff(row.kickoffAt) &&
      Math.abs(new Date(row.kickoffAt).getTime() - item.kickoffAt.getTime()) <= SAME_GAME_WINDOW_MS
    );
    return known ? { ...item, kickoffAt: new Date(known.kickoffAt), externalId: known.externalId } : item;
  });
}

// ESPN とこのサイトで略称が違うチーム
const ESPN_TEAM_CODES: Record<string, string> = { WSH: "WAS" };

export function kickoffPairKey(firstTeam: string, secondTeam: string) {
  return [firstTeam, secondTeam].sort().join("-");
}

/** ESPN のスコアボードAPIの応答から、対戦カードごとの確定したキックオフ時刻を取り出す */
export function parseEspnKickoffs(data: unknown): Map<string, Date> {
  const kickoffs = new Map<string, Date>();
  const events: any[] = (data as any)?.events ?? [];
  for (const event of events) {
    const competition = event?.competitions?.[0];
    // 時刻が未発表（TBD）の試合は使わない
    if (!competition || competition.timeValid === false) continue;
    const codes: string[] = (competition.competitors ?? []).map((c: any) => c?.team?.abbreviation).filter(Boolean).map((code: string) => ESPN_TEAM_CODES[code] ?? code);
    const date = new Date(event.date ?? competition.date);
    if (codes.length !== 2 || Number.isNaN(date.getTime())) continue;
    kickoffs.set(kickoffPairKey(codes[0]!, codes[1]!), date);
  }
  return kickoffs;
}

/** 今週の試合の確定したキックオフ時刻を ESPN から取得する（1リクエスト。失敗時は空） */
export async function fetchEspnWeekKickoffs(): Promise<Map<string, Date>> {
  try {
    const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard", { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return new Map();
    return parseEspnKickoffs(await res.json());
  } catch {
    return new Map();
  }
}

/** 仮の時刻の行のうち、ESPN に確定時刻がある試合の修正内容を返す */
export function planKickoffRepairs<T extends { id: number; teamCode: string; opponentCode: string; kickoffAt: Date }>(rows: T[], kickoffs: Map<string, Date>) {
  return rows.flatMap((row) => {
    if (!isEstimatedKickoff(row.kickoffAt)) return [];
    const kickoffAt = kickoffs.get(kickoffPairKey(row.teamCode, row.opponentCode));
    // 同じカードの別の試合（地区内の2戦目など）と取り違えないよう、同じ週のものだけ採用する
    if (!kickoffAt || Math.abs(kickoffAt.getTime() - new Date(row.kickoffAt).getTime()) > WEEK_MS) return [];
    return [{ id: row.id, kickoffAt }];
  });
}
