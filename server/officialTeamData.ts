import { createHash } from "node:crypto";
import type { InsertOfficialGame, InsertOfficialRosterEntry } from "../drizzle/schema";
import { replaceOfficialGamesForTeam, upsertOfficialRosterEntries } from "./db";

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

function currentSeason() {
  const now = new Date();
  return now.getUTCMonth() < 2 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
}

export function getOfficialTeamDataSources(teamCode: string) {
  const domain = TEAM_DOMAINS[teamCode];
  const name = names[teamCode];
  if (!domain || !name) throw new Error(`Unsupported NFL team code: ${teamCode}`);
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return {
    leagueScheduleUrl: `https://www.nfl.com/schedules/${currentSeason()}/by-team/${slug}`,
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

function phaseFor(kickoffAt: Date, sourceText: string) {
  if (/pre\s*season|\bPRE\b/i.test(sourceText) || kickoffAt.getUTCMonth() === 7) return "preseason" as const;
  if (/post\s*season|playoff/i.test(sourceText)) return "postseason" as const;
  return "regular" as const;
}

function gameEntry(teamCode: string, opponentCode: string, homeAway: "home" | "away", kickoffAt: Date, seasonPhase: "preseason" | "regular" | "postseason", weekLabel: string | null, venue: string | null, broadcast: string | null, sourceUrl: string): InsertOfficialGame {
  return { externalId: hash(`${teamCode}:${kickoffAt.toISOString()}:${opponentCode}`), teamCode, opponentCode, homeAway, seasonPhase, weekLabel, kickoffAt, venue, broadcast, sourceUrl, fetchedAt: new Date() };
}

export function parseOfficialSchedulePage(html: string, teamCode: string, sourceUrl: string): InsertOfficialGame[] {
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
    games.push(gameEntry(teamCode, opponent[0], atVs === "AT" ? "away" : "home", kickoffAt, phaseFor(kickoffAt, card), weekLabel, venue, broadcast, sourceUrl));
  }
  return games;
}

function parseLeagueKickoff(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 2000 ? undefined : date;
}

export function parseNFLLeagueSchedulePage(html: string, teamCode: string, sourceUrl: string): InsertOfficialGame[] {
  const teamName = names[teamCode];
  if (!teamName) return [];
  const games: InsertOfficialGame[] = [];
  const cards = Array.from(html.matchAll(/<li><div class="shadow-extended[\s\S]*?<\/li>/gi), (match) => match[0]);
  for (const card of cards) {
    const kickoffValue = card.match(/(?:datetime|data-gametime|data-start-date)="([^"]+)"/i)?.[1];
    const kickoffAt = kickoffValue ? parseLeagueKickoff(kickoffValue) ?? parseKickoff(kickoffValue) : undefined;
    if (!kickoffAt || !card.includes(teamName)) continue;
    const opponent = Object.entries(names).find(([code, name]) => code !== teamCode && card.includes(name));
    if (!opponent) continue;
    const plain = text(card);
    const teamNickname = teamName.split(" ").at(-1)?.replace("49ers", "49ers") ?? teamName;
    const opponentNickname = opponent[1].split(" ").at(-1)?.replace("49ers", "49ers") ?? opponent[1];
    const away = new RegExp(`${teamNickname}\\s+at\\s+${opponentNickname}`, "i").test(plain);
    const home = new RegExp(`${opponentNickname}\\s+at\\s+${teamNickname}`, "i").test(plain);
    if (!away && !home) continue;
    const weekLabel = plain.match(/Week\s+\d+/i)?.[0] ?? null;
    const venue = text(card.match(/(?:venue|stadium)[^>]*>([\s\S]*?)<\//i)?.[1] ?? "") || null;
    const broadcast = plain.match(/\b(CBS|FOX|NBC|ESPN|NFLN|PRIME|NETFLIX)\b/i)?.[0] ?? null;
    games.push(gameEntry(teamCode, opponent[0], away ? "away" : "home", kickoffAt, phaseFor(kickoffAt, card), weekLabel, venue, broadcast, sourceUrl));
  }
  return games;
}

export function parseOfficialRosterPage(html: string, teamCode: string, sourceUrl: string): InsertOfficialRosterEntry[] {
  const statusStarts = Array.from(html.matchAll(/<span class="nfl-o-roster__title-status">([\s\S]*?)<\/span>/gi));
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
      entries.push({ externalId: hash(`${teamCode}:${playerName}:${status}`), teamCode, playerName, jerseyNumber: cells[1] || null, position: cells[2] || "—", rosterStatus: status || "Active", sourceUrl, fetchedAt: new Date() });
    }
  }
  return entries;
}

export function selectPreferredSchedule(leagueGames: InsertOfficialGame[], teamGames: InsertOfficialGame[]) {
  return leagueGames.length > 0 ? leagueGames : teamGames;
}

async function fetchOfficialHtml(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" } });
    if (!response.ok) throw new Error(`Official page request failed: ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function refreshOfficialTeamData(teamCode: string) {
  const { leagueScheduleUrl, scheduleUrl, rosterUrl } = getOfficialTeamDataSources(teamCode);
  const [leagueResult, scheduleResult, rosterResult] = await Promise.allSettled([fetchOfficialHtml(leagueScheduleUrl), fetchOfficialHtml(scheduleUrl), fetchOfficialHtml(rosterUrl)]);
  const leagueGames = leagueResult.status === "fulfilled" ? parseNFLLeagueSchedulePage(await leagueResult.value, teamCode, leagueScheduleUrl) : [];
  const teamGames = scheduleResult.status === "fulfilled" ? parseOfficialSchedulePage(await scheduleResult.value, teamCode, scheduleUrl) : [];
  const roster = rosterResult.status === "fulfilled" ? parseOfficialRosterPage(await rosterResult.value, teamCode, rosterUrl) : [];
  const preferredGames = selectPreferredSchedule(leagueGames, teamGames);
  if (preferredGames.length > 0) await replaceOfficialGamesForTeam(teamCode, preferredGames);
  if (roster.length > 0) await upsertOfficialRosterEntries(roster);
  return { games: preferredGames.length, leagueGames: leagueGames.length, roster: roster.length, errors: [leagueResult, scheduleResult, rosterResult].filter((result) => result.status === "rejected").length };
}
