import { TEAM_NAMES } from "./officialTeamData";
import { getOfficialScoreboardGamesForHighlightMatching, upsertOfficialScoreboardHighlights } from "./db";

type HighlightableGame = {
  externalId: string;
  seasonPhase: "preseason" | "regular" | "postseason";
  weekLabel: string | null;
  awayTeamCode: string;
  homeTeamCode: string;
  gameState: string;
};

export type NflHighlightLink = { externalId: string; nflHighlightUrl: string; sourceUrl: string };

export const nflHighlightSourceUrl = "https://www.nfl.com/videos/channel/game-highlights-vc";

function teamVideoSlug(teamCode: string) {
  return TEAM_NAMES[teamCode]?.toLowerCase().split(" ").at(-1);
}

function weekNumber(weekLabel: string | null) {
  return weekLabel?.match(/(\d+)/)?.[1];
}

/** Builds only the NFL-published game-highlight URL convention used for preseason and regular weeks. */
export function nflHighlightUrlForGame(game: HighlightableGame) {
  const away = teamVideoSlug(game.awayTeamCode);
  const home = teamVideoSlug(game.homeTeamCode);
  const week = weekNumber(game.weekLabel);
  if (!away || !home || !week || game.seasonPhase === "postseason") return null;
  const phase = game.seasonPhase === "preseason" ? "preseason" : "week";
  return `https://www.nfl.com/videos/${away}-vs-${home}-highlights-${phase}-week-${week}`;
}

/** Validates both teams and the season/week in NFL-published page markup before storing a generated URL. */
export function isVerifiedNflHighlightPage(html: string, game: HighlightableGame) {
  const away = TEAM_NAMES[game.awayTeamCode];
  const home = TEAM_NAMES[game.homeTeamCode];
  const week = weekNumber(game.weekLabel);
  if (!away || !home || !week) return false;
  const phase = game.seasonPhase === "preseason" ? "Preseason" : "Week";
  return html.includes(away) && html.includes(home) && new RegExp(`${phase}\\s+Week\\s+${week}`, "i").test(html) && /highlights/i.test(html);
}

async function fetchOfficialHighlightPage(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" } });
    if (!response.ok) return null;
    return response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Updates only final games without an existing link; failed or unpublished pages remain safe no-ops. */
export async function refreshOfficialGameHighlights() {
  const games = await getOfficialScoreboardGamesForHighlightMatching();
  const verified = await Promise.all(games.map(async (game) => {
    const nflHighlightUrl = nflHighlightUrlForGame(game);
    if (!nflHighlightUrl) return null;
    const html = await fetchOfficialHighlightPage(nflHighlightUrl);
    return html && isVerifiedNflHighlightPage(html, game) ? { externalId: game.externalId, nflHighlightUrl, sourceUrl: nflHighlightSourceUrl } : null;
  }));
  const links = verified.filter((link): link is NflHighlightLink => Boolean(link));
  await upsertOfficialScoreboardHighlights(links);
  return { candidates: games.length, linked: links.length, sourceUrl: nflHighlightSourceUrl };
}
