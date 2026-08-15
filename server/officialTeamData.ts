import { createHash } from "node:crypto";
import type { InsertOfficialGame, InsertOfficialRosterEntry } from "../drizzle/schema";
import { upsertOfficialGames, upsertOfficialRosterEntries } from "./db";

export const TEAM_DOMAINS: Record<string, string> = {
  ARI: "azcardinals.com", ATL: "atlantafalcons.com", BAL: "baltimoreravens.com", BUF: "buffalobills.com", CAR: "panthers.com", CHI: "chicagobears.com", CIN: "bengals.com", CLE: "clevelandbrowns.com", DAL: "dallascowboys.com", DEN: "denverbroncos.com", DET: "detroitlions.com", GB: "packers.com", HOU: "houstontexans.com", IND: "colts.com", JAX: "jaguars.com", KC: "chiefs.com", LAC: "chargers.com", LAR: "therams.com", LV: "raiders.com", MIA: "miamidolphins.com", MIN: "vikings.com", NE: "patriots.com", NO: "neworleanssaints.com", NYG: "giants.com", NYJ: "newyorkjets.com", PHI: "philadelphiaeagles.com", PIT: "steelers.com", SF: "49ers.com", SEA: "seahawks.com", TB: "buccaneers.com", TEN: "titansonline.com", WAS: "commanders.com",
};

const names: Record<string, string> = {
  ARI: "Arizona Cardinals", ATL: "Atlanta Falcons", BAL: "Baltimore Ravens", BUF: "Buffalo Bills", CAR: "Carolina Panthers", CHI: "Chicago Bears", CIN: "Cincinnati Bengals", CLE: "Cleveland Browns", DAL: "Dallas Cowboys", DEN: "Denver Broncos", DET: "Detroit Lions", GB: "Green Bay Packers", HOU: "Houston Texans", IND: "Indianapolis Colts", JAX: "Jacksonville Jaguars", KC: "Kansas City Chiefs", LAC: "Los Angeles Chargers", LAR: "Los Angeles Rams", LV: "Las Vegas Raiders", MIA: "Miami Dolphins", MIN: "Minnesota Vikings", NE: "New England Patriots", NO: "New Orleans Saints", NYG: "New York Giants", NYJ: "New York Jets", PHI: "Philadelphia Eagles", PIT: "Pittsburgh Steelers", SF: "San Francisco 49ers", SEA: "Seattle Seahawks", TB: "Tampa Bay Buccaneers", TEN: "Tennessee Titans", WAS: "Washington Commanders",
};

function text(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getOfficialTeamDataSources(teamCode: string) {
  const domain = TEAM_DOMAINS[teamCode];
  if (!domain) throw new Error(`Unsupported NFL team code: ${teamCode}`);
  return {
    scheduleUrl: `https://www.${domain}/schedule/`,
    rosterUrl: `https://www.${domain}/team/players-roster/`,
  };
}

function parseKickoff(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}:\d{2}:\d{2})\s+([+-]\d{2}:\d{2})$/);
  if (!match) return undefined;
  const [, month, day, year, time, offset] = match;
  const date = new Date(`${year}-${month}-${day}T${time}${offset}`);
  return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 2000 ? undefined : date;
}

export function parseOfficialSchedulePage(html: string, teamCode: string, sourceUrl: string): InsertOfficialGame[] {
  const now = new Date();
  const teamName = names[teamCode];
  if (!teamName) return [];
  const games: InsertOfficialGame[] = [];
  const cards = html.split(/(?=<div class="nfl-o-matchup-cards\b)/gi);
  for (const card of cards) {
    const kickoffValue = card.match(/data-gametime="([^"]+)"/i)?.[1];
    const kickoffAt = kickoffValue ? parseKickoff(kickoffValue) : undefined;
    if (!kickoffAt) continue;
    const matchedTeams = Object.entries(names).filter(([, name]) => card.includes(name));
    const opponent = matchedTeams.find(([code]) => code !== teamCode);
    if (!opponent || !card.includes(teamName)) continue;
    const atVs = card.match(/nfl-o-matchup-cards__team-game-location[^>]*>\s*<span>\s*(AT|VS)\s*<\/span>/i)?.[1]?.toUpperCase();
    if (!atVs) continue;
    const weekLabel = text(card.match(/nfl-o-matchup-cards__date-info[^>]*>\s*<strong>([\s\S]*?)<\/strong>/i)?.[1] ?? "") || null;
    const venue = text(card.match(/nfl-o-matchup-cards__venue--location[^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "") || null;
    const broadcast = text(card.match(/nfl-o-matchup-cards__broadcast[^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1] ?? "") || null;
    const seasonPhase = kickoffAt.getUTCMonth() === 7 ? "preseason" : "regular";
    games.push({ externalId: hash(`${teamCode}:${kickoffAt.toISOString()}:${opponent[0]}`), teamCode, opponentCode: opponent[0], homeAway: atVs === "AT" ? "away" : "home", seasonPhase, weekLabel, kickoffAt, venue, broadcast, sourceUrl, fetchedAt: now });
  }
  return games;
}

export function parseOfficialRosterPage(html: string, teamCode: string, sourceUrl: string): InsertOfficialRosterEntry[] {
  const statusStarts = Array.from(html.matchAll(/<span class="nfl-o-roster__title-status">([\s\S]*?)<\/span>/gi));
  const now = new Date();
  const entries: InsertOfficialRosterEntry[] = [];
  for (let index = 0; index < statusStarts.length; index += 1) {
    const match = statusStarts[index];
    const status = text(match[1]);
    const end = statusStarts[index + 1]?.index ?? html.length;
    const section = html.slice(match.index, end);
    for (const rowMatch of Array.from(section.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi))) {
      const row = rowMatch[1];
      const playerName = text(row.match(/nfl-o-roster__player-name[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i)?.[1] ?? "");
      if (!playerName) continue;
      const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi), (cell) => text(cell[1] ?? ""));
      const jerseyNumber = cells[1] || null;
      const position = cells[2] || "—";
      entries.push({ externalId: hash(`${teamCode}:${playerName}:${status}`), teamCode, playerName, jerseyNumber, position, rosterStatus: status || "Active", sourceUrl, fetchedAt: now });
    }
  }
  return entries;
}

async function fetchOfficialHtml(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" } });
    if (!response.ok) throw new Error(`Official team page request failed: ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function refreshOfficialTeamData(teamCode: string) {
  const { scheduleUrl, rosterUrl } = getOfficialTeamDataSources(teamCode);
  const [scheduleResult, rosterResult] = await Promise.allSettled([fetchOfficialHtml(scheduleUrl), fetchOfficialHtml(rosterUrl)]);
  const games = scheduleResult.status === "fulfilled" ? parseOfficialSchedulePage(await scheduleResult.value, teamCode, scheduleUrl) : [];
  const roster = rosterResult.status === "fulfilled" ? parseOfficialRosterPage(await rosterResult.value, teamCode, rosterUrl) : [];
  if (games.length > 0) await upsertOfficialGames(games);
  if (roster.length > 0) await upsertOfficialRosterEntries(roster);
  return { games: games.length, roster: roster.length, errors: [scheduleResult, rosterResult].filter((result) => result.status === "rejected").length };
}
