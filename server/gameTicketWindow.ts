export type GameTicketCandidate = {
  kickoffAt: Date;
  gameState: string | null;
  awayScore: number | null;
  homeScore: number | null;
};

const JST_OFFSET_MS = 9 * 60 * 60 * 1_000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1_000;

function latestWednesdaySixJst(now: Date) {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  const daysSinceWednesday = (jst.getUTCDay() - 3 + 7) % 7;
  let cutoff = new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate() - daysSinceWednesday, -3));
  if (now.getTime() < cutoff.getTime()) cutoff = new Date(cutoff.getTime() - WEEK_MS);
  return cutoff;
}

export function isOfficialFinal(game?: Pick<GameTicketCandidate, "gameState">) {
  return Boolean(game?.gameState && /final|completed/i.test(game.gameState));
}

/** Keeps the latest officially final game until the following Wednesday at 06:00 JST for replay viewers. */
export function isWithinJstReplayWindow(game: Pick<GameTicketCandidate, "kickoffAt" | "gameState">, now: Date) {
  return isOfficialFinal(game) && new Date(game.kickoffAt).getTime() >= latestWednesdaySixJst(now).getTime();
}

/** Chooses a live game first, then the protected replay window, and only then the next unfinished game. */
export function selectGameTicketGame<T extends GameTicketCandidate>({
  now,
  activeGame,
  latestCompletedGame,
  scheduledGame,
  skipReplayWindow = false,
}: {
  now: Date;
  activeGame?: T;
  latestCompletedGame?: T;
  scheduledGame?: T;
  /** Set only after the viewer explicitly marks the held result as watched. */
  skipReplayWindow?: boolean;
}) {
  if (activeGame && !isOfficialFinal(activeGame)) return activeGame;
  if (!skipReplayWindow && latestCompletedGame && isWithinJstReplayWindow(latestCompletedGame, now)) return latestCompletedGame;
  return scheduledGame ?? activeGame ?? latestCompletedGame;
}
