import { createHash } from "node:crypto";
import type { InsertOfficialGame, InsertOfficialRosterEntry } from "../drizzle/schema";
import { replaceOfficialGamesForTeam, replaceOfficialRosterEntriesForTeam } from "./db";

export const TEAM_DOMAINS: Record<string, string> = {
  ARI: "azcardinals.com", ATL: "atlantafalcons.com", BAL: "baltimoreravens.com", BUF: "buffalobills.com", CAR: "panthers.com", CHI: "chicagobears.com", CIN: "bengals.com", CLE: "clevelandbrowns.com", DAL: "dallascowboys.com", DEN: "denverbroncos.com", DET: "detroitlions.com", GB: "packers.com", HOU: "houstontexans.com", IND: "colts.com", JAX: "jaguars.com", KC: "chiefs.com", LAC: "chargers.com", LAR: "therams.com", LV: "raiders.com", MIA: "miamidolphins.com", MIN: "vikings.com", NE: "patriots.com", NO: "neworleanssaints.com", NYG: "giants.com", NYJ: "newyorkjets.com", PHI: "philadelphiaeagles.com", PIT: "steelers.com", SF: "49ers.com", SEA: "seahawks.com", TB: "buccaneers.com", TEN: "titansonline.com", WAS: "commanders.com",
};

export const TEAM_NAMES: Record<string, string> = {
  ARI: "Arizona Cardinals", ATL: "Atlanta Falcons", BAL: "Baltimore Ravens", BUF: "Buffalo Bills", CAR: "Carolina Panthers", CHI: "Chicago Bears", CIN: "Cincinnati Bengals", CLE: "Cleveland Browns", DAL: "Dallas Cowboys", DEN: "Denver Broncos", DET: "Detroit Lions", GB: "Green Bay Packers", HOU: "Houston Texans", IND: "Indianapolis Colts", JAX: "Jacksonville Jaguars", KC: "Kansas City Chiefs", LAC: "Los Angeles Chargers", LAR: "Los Angeles Rams", LV: "Las Vegas Raiders", MIA: "Miami Dolphins", MIN: "Minnesota Vikings", NE: "New England Patriots", NO: "New Orleans Saints", NYG: "New York Giants", NYJ: "New York Jets", PHI: "Philadelphia Eagles", PIT: "Pittsburgh Steelers", SF: "San Francisco 49ers", SEA: "Seattle Seahawks", TB: "Tampa Bay Buccaneers", TEN: "Tennessee Titans", WAS: "Washington Commanders",
};

const ESPN_TEAM_IDS: Record<string, string> = {
  ARI: "22", ATL: "1", BAL: "33", BUF: "2", CAR: "29", CHI: "3", CIN: "4", CLE: "5",
  DAL: "6", DEN: "7", DET: "8", GB: "9", HOU: "34", IND: "11", JAX: "30", KC: "12",
  LAC: "24", LAR: "14", LV: "13", MIA: "15", MIN: "16", NE: "17", NO: "18", NYG: "19",
  NYJ: "20", PHI: "21", PIT: "23", SF: "25", SEA: "26", TB: "27", TEN: "10", WAS: "28",
};

function decodeCodePoint(value: string, radix: number) {
  const codePoint = Number.parseInt(value, radix);
  return Number.isFinite(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : `&#${radix === 16 ? "x" : ""}${value};`;
}

export function normalizeOfficialText(value: string) {
  const withoutTags = value.replace(/<[^>]+>/g, " ");
  const decodeEntitiesOnce = (input: string) => input
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) => decodeCodePoint(hex, 16))
    .replace(/&#(\d+);?/g, (_, decimal: string) => decodeCodePoint(decimal, 10))
    .replace(/&(nbsp|amp|apos|quot|lt|gt);/gi, (_, name: string) => ({ nbsp: " ", amp: "&", apos: "'", quot: '"', lt: "<", gt: ">" })[name.toLowerCase()] ?? _);
  let decodedEntities = withoutTags;
  for (let pass = 0; pass < 3; pass += 1) {
    const next = decodeEntitiesOnce(decodedEntities);
    if (next === decodedEntities) break;
    decodedEntities = next;
  }
  const repaired = /[ÃÂâ]/.test(decodedEntities) ? Buffer.from(decodedEntities, "latin1").toString("utf8") : decodedEntities;
  return (repaired.includes("") ? decodedEntities : repaired).normalize("NFC").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
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
  const name = TEAM_NAMES[teamCode];
  if (!domain || !name) throw new Error(`Unsupported NFL team code: ${teamCode}`);
  return {
    rosterUrl: `https://www.${domain}/team/players-roster/`,
  };
}

function gameEntry(teamCode: string, opponentCode: string, homeAway: "home" | "away", kickoffAt: Date, seasonPhase: "preseason" | "regular" | "postseason", weekLabel: string | null, venue: string | null, broadcast: string | null, sourceUrl: string): InsertOfficialGame {
  return { externalId: hash(`${teamCode}:${kickoffAt.toISOString()}:${opponentCode}`), teamCode, opponentCode, homeAway, seasonPhase, weekLabel, kickoffAt, venue, broadcast, sourceUrl, fetchedAt: new Date() };
}

async function fetchEspnTeamGames(teamCode: string): Promise<InsertOfficialGame[]> {
  const espnId = ESPN_TEAM_IDS[teamCode];
  if (!espnId) return [];
  const season = currentSeason();
  // limit=100 を指定して全スケジュールを取得
  const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${espnId}/schedule?season=${season}&limit=100`;

  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return [];
    const data = (await res.json()) as { events?: Array<Record<string, unknown>> };
    const events = data.events ?? [];
    const games: InsertOfficialGame[] = [];

    for (const event of events) {
      const competitions = (event.competitions as Array<Record<string, unknown>>) ?? [];
      const comp = competitions[0];
      if (!comp) continue;

      const dateStr = String(comp.date || event.date || "");
      const kickoffAt = new Date(dateStr);
      if (Number.isNaN(kickoffAt.getTime())) continue;

      const competitors = (comp.competitors as Array<Record<string, unknown>>) ?? [];
      const teamComp = competitors.find((c) => {
        const t = c.team as Record<string, unknown> | undefined;
        return String(t?.id) === espnId;
      });
      const oppComp = competitors.find((c) => {
        const t = c.team as Record<string, unknown> | undefined;
        return String(t?.id) !== espnId;
      });

      if (!teamComp || !oppComp) continue;

      const oppTeam = oppComp.team as Record<string, unknown> | undefined;
      const oppId = String(oppTeam?.id || "");
      const oppEntry = Object.entries(ESPN_TEAM_IDS).find(([, id]) => id === oppId);
      if (!oppEntry) continue;
      const oppCode = oppEntry[0];

      const homeAway = String(teamComp.homeAway) === "home" ? "home" : "away";
      const seasonType = Number(comp.seasonType || event.seasonType || 2);
      const seasonPhase = seasonType === 1 ? "preseason" : seasonType === 3 ? "postseason" : "regular";

      const weekObj = comp.week as Record<string, unknown> | undefined;
      const weekNum = Number(weekObj?.number || 1);
      const weekLabel = seasonPhase === "preseason" ? `PRESEASON WEEK ${weekNum}` : seasonPhase === "postseason" ? `POSTSEASON` : `WEEK ${weekNum}`;

      const venueObj = comp.venue as Record<string, unknown> | undefined;
      const venue = String(venueObj?.fullName || "") || null;

      const broadcasts = (comp.broadcasts as Array<Record<string, unknown>>) ?? [];
      const names = broadcasts.flatMap((b) => (Array.isArray(b.names) ? b.names : [])) as string[];
      const broadcast = names[0] || null;

      const sourceUrl = `https://www.nfl.com/schedules/${season}/by-team/${TEAM_NAMES[teamCode].toLowerCase().replace(/\s+/g, "-")}`;
      games.push(gameEntry(teamCode, oppCode, homeAway, kickoffAt, seasonPhase, weekLabel, venue, broadcast, sourceUrl));
    }

    return games;
  } catch {
    return [];
  }
}

export function parseOfficialRosterPage(html: string, teamCode: string, sourceUrl: string): InsertOfficialRosterEntry[] {
  const statusStarts = Array.from(html.matchAll(/<span class="nfl-o-roster__title-status">([\s\S]*?)<\/span>/gi));
  const entries: InsertOfficialRosterEntry[] = [];
  for (let index = 0; index < statusStarts.length; index += 1) {
    const match = statusStarts[index];
    const status = normalizeOfficialText(match[1]);
    const end = statusStarts[index + 1]?.index ?? html.length;
    const section = html.slice(match.index, end);
    for (const rowMatch of Array.from(section.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi))) {
      const row = rowMatch[1];
      const playerName = normalizeOfficialText(row.match(/nfl-o-roster__player-name[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i)?.[1] ?? "");
      if (!playerName) continue;
      const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi), (cell) => normalizeOfficialText(cell[1] ?? ""));
      entries.push({ externalId: hash(`${teamCode}:${playerName}:${status}`), teamCode, playerName, jerseyNumber: cells[1] || null, position: cells[2] || "—", rosterStatus: status || "Active", sourceUrl, fetchedAt: new Date() });
    }
  }
  return entries;
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
  const { rosterUrl } = getOfficialTeamDataSources(teamCode);
  const rosterHtml = await fetchOfficialHtml(rosterUrl).catch(() => "");
  const roster = parseOfficialRosterPage(rosterHtml, teamCode, rosterUrl);

  const teamGames = await fetchEspnTeamGames(teamCode);
  if (teamGames.length > 0) {
    await replaceOfficialGamesForTeam(teamCode, teamGames);
  }
  if (roster.length > 0) {
    await replaceOfficialRosterEntriesForTeam(teamCode, roster);
  }

  return { games: teamGames.length, leagueGames: teamGames.length, roster: roster.length, errors: 0 };
}
