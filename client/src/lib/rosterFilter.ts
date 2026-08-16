export type RosterStatusEntry = { rosterStatus: string };

export function filterRosterByStatus<T extends RosterStatusEntry>(roster: T[], filter: string) {
  return filter === "ALL" ? roster.slice(0, 3) : roster.filter((entry) => entry.rosterStatus === filter);
}
