import { getOfficialLatestResult, getOfficialLeagueCalendar, getOfficialLeagueDashboardSummary, getOfficialTeamSnapshot } from "./db";

type CacheEntry<T> = { expiresAt: number; value?: T; pending?: Promise<T> };

/**
 * Keeps public dashboard reads fast without delaying live-score visibility for long.
 * Concurrent callers share the same in-flight request, then receive a short-lived value.
 */
export function createTimedLoader<T>(ttlMs: number, load: (key: string) => Promise<T>) {
  const entries = new Map<string, CacheEntry<T>>();
  return async (key: string) => {
    const now = Date.now();
    const existing = entries.get(key);
    if (existing && existing.expiresAt > now) {
      if (existing.pending) return existing.pending;
      if (existing.value !== undefined) return existing.value;
    }

    const pending = load(key).then((value) => {
      entries.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    }).catch((error) => {
      entries.delete(key);
      throw error;
    });
    entries.set(key, { pending, expiresAt: now + ttlMs });
    return pending;
  };
}

const loadTeamSnapshot = createTimedLoader(12_000, async (key) => {
  const [teamCode, skipGameUrl, forceLastGame, rosterMode] = key.split("|");
  return getOfficialTeamSnapshot(teamCode!, skipGameUrl || undefined, forceLastGame === "last", undefined, rosterMode === "roster");
});
const loadLeagueSummary = createTimedLoader(12_000, async () => getOfficialLeagueDashboardSummary());
const loadLatestResult = createTimedLoader(12_000, async (teamCode) => getOfficialLatestResult(teamCode));
const loadLeagueCalendar = createTimedLoader(45_000, async (teamCode) => getOfficialLeagueCalendar(teamCode));

export function getCachedOfficialTeamSnapshot(teamCode: string, skipGameUrl?: string, forceLastGame = false, includeRoster = true) {
  return loadTeamSnapshot(`${teamCode.toUpperCase()}|${skipGameUrl ?? ""}|${forceLastGame ? "last" : "auto"}|${includeRoster ? "roster" : "light"}`);
}

export function getCachedOfficialLeagueDashboardSummary() {
  return loadLeagueSummary("summary");
}

export function getCachedOfficialLatestResult(teamCode: string) {
  return loadLatestResult(teamCode.toUpperCase());
}

export function getCachedOfficialLeagueCalendar(teamCode: string) {
  return loadLeagueCalendar(teamCode.toUpperCase());
}
