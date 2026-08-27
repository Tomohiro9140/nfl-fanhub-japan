/** Keeps spoiler protection conservative when the viewer switches to another team. */
export function spoilerModeForTeamChange(currentTeamCode: string, nextTeamCode: string, currentSpoilerMode: boolean) {
  return currentTeamCode === nextTeamCode ? currentSpoilerMode : true;
}
