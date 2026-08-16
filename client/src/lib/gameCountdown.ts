export type GameCountdown = { state: "upcoming" | "kickoff-passed" | "invalid"; label: string };
export type OfficialGameResult = { gameState: string | null; awayScore: number | null; homeScore: number | null } | null | undefined;
export type GameCardStatus = { state: "upcoming" | "live" | "final" | "result-pending" | "invalid"; label: string };

/** Produces a stable, testable label for a game countdown. */
export function getGameCountdown(kickoffAt: Date | string, now: Date): GameCountdown {
  const kickoff = new Date(kickoffAt).getTime();
  if (Number.isNaN(kickoff)) return { state: "invalid", label: "TIME TBA" };
  const remainingSeconds = Math.floor((kickoff - now.getTime()) / 1000);
  if (remainingSeconds <= 0) return { state: "kickoff-passed", label: "KICKOFF PASSED" };
  const days = Math.floor(remainingSeconds / 86_400);
  const hours = Math.floor((remainingSeconds % 86_400) / 3_600);
  const minutes = Math.floor((remainingSeconds % 3_600) / 60);
  const seconds = remainingSeconds % 60;
  return { state: "upcoming", label: `STARTS IN ${String(days).padStart(2, "0")}D ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` };
}

/** Uses the official result when final; otherwise avoids showing a stale negative countdown. */
export function getGameCardStatus(kickoffAt: Date | string, now: Date, result: OfficialGameResult): GameCardStatus {
  if (result?.gameState && /final/i.test(result.gameState) && result.awayScore !== null && result.homeScore !== null) {
    return { state: "final", label: `FINAL ${result.awayScore} - ${result.homeScore}` };
  }
  const countdown = getGameCountdown(kickoffAt, now);
  if (countdown.state === "upcoming") return { state: "upcoming", label: countdown.label };
  if (countdown.state === "invalid") return { state: "invalid", label: countdown.label };
  const elapsedMs = now.getTime() - new Date(kickoffAt).getTime();
  return elapsedMs <= 6 * 60 * 60 * 1000 ? { state: "live", label: "LIVE" } : { state: "result-pending", label: "RESULT PENDING" };
}
