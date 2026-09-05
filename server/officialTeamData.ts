import { createHash } from "node:crypto";
import type { InsertOfficialGame, InsertOfficialRosterEntry } from "../drizzle/schema";
import { replaceOfficialGamesForTeam, replaceOfficialRosterEntriesForTeam } from "./db";

export const TEAM_DOMAINS: Record<string, string> = {
  ARI: "azcardinals.com", ATL: "atlantafalcons.com", BAL: "baltimoreravens.com", BUF: "buffalobills.com", CAR: "panthers.com", CHI: "chicagobears.com", CIN: "bengals.com", CLE: "clevelandbrowns.com", DAL: "dallascowboys.com", DEN: "denverbroncos.com", DET: "detroitlions.com", GB: "packers.com", HOU: "houstontexans.com", IND: "colts.com", JAX: "jaguars.com", KC: "chiefs.com", LAC: "chargers.com", LAR: "therams.com", LV: "raiders.com", MIA: "miamidolphins.com", MIN: "vikings.com", NE: "patriots.com", NO: "neworleanssaints.com", NYG: "giants.com", NYJ: "newyorkjets.com", PHI: "philadelphiaeagles.com", PIT: "steelers.com", SF: "49ers.com", SEA: "seahawks.com", TB: "buccaneers.com", TEN: "titansonline.com", WAS: "commanders.com",
};

export const TEAM_NAMES: Record<string, string> = {
  ARI: "Arizona Cardinals", ATL: "Atlanta Falcons", BAL: "Baltimore Ravens", BUF: "Buffalo Bills", CAR: "Carolina Panthers", CHI: "Chicago Bears", CIN: "Cincinnati Bengals", CLE: "Cleveland Browns", DAL: "Dallas Cowboys", DEN: "Denver Broncos", DET: "Detroit Lions", GB: "Green Bay Packers", HOU: "Houston Texans", IND: "Indianapolis Colts", JAX: "Jacksonville Jaguars", KC: "Kansas City Chiefs", LAC: "Los Angeles Chargers", LAR: "Los Angeles Rams", LV: "Las Vegas Raiders", MIA: "Miami Dolphins", MIN: "Minnesota Vikings", NE: "New England Patriots", NO: "New Orleans Saints", NYG: "New York Giants", NYJ: "New York Jets", PHI: "Philadelphia Eagles", PIT: "Pittsburgh Steelers", SF: "San Francisco 49ers", SEA: "Seattle Seahawks", TB: "Tampa Bay Buccaneers", TEN: "Tennessee Titans", WAS: "Washington Commanders",
};

export const TEAM_NICKNAMES: Record<string, string> = {
  ARI: "Cardinals", ATL: "Falcons", BAL: "Ravens", BUF: "Bills", CAR: "Panthers", CHI: "Bears", CIN: "Bengals", CLE: "Browns", DAL: "Cowboys", DEN: "Broncos", DET: "Lions", GB: "Packers", HOU: "Texans", IND: "Colts", JAX: "Jaguars", KC: "Chiefs", LAC: "Chargers", LAR: "Rams", LV: "Raiders", MIA: "Dolphins", MIN: "Vikings", NE: "Patriots", NO: "Saints", NYG: "Giants", NYJ: "Jets", PHI: "Eagles", PIT: "Steelers", SF: "49ers", SEA: "Seahawks", TB: "Buccaneers", TEN: "Titans", WAS: "Commanders",
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

const text = normalizeOfficialText;

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

function parseKickoff(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 2000 ? undefined : date;
}

function phaseFor(kickoffAt: Date) {
  if (kickoffAt.getUTCMonth() === 7) return "preseason" as const;
  return "regular" as const;
}

function gameEntry(teamCode: string, opponentCode: string, homeAway: "home" | "away", kickoffAt: Date, seasonPhase: "preseason" | "regular" | "postseason", weekLabel: string | null, venue: string | null, broadcast: string | null, sourceUrl: string): InsertOfficialGame {
  return { externalId: hash(`${teamCode}:${kickoffAt.toISOString()}:${opponentCode}`), teamCode, opponentCode, homeAway, seasonPhase, weekLabel, kickoffAt, venue, broadcast, sourceUrl, fetchedAt: new Date() };
}

/** リーグ全体の週別スケジュールページを一括フェッチして全チーム分の試合を抽出する */
async function fetchAllLeagueGames(): Promise<Map<string, InsertOfficialGame[]>> {
  const season = currentSeason();
  const teamGamesMap = new Map<string, InsertOfficialGame[]>();
  Object.keys(TEAM_NAMES).forEach(code => teamGamesMap.set(code, []));

  // Preseason (1-3) と Regular (1-18) のページを巡回
  const urls: string[] = [];
  for (let w = 1; w <= 3; w++) urls.push(`https://www.nfl.com/schedules/${season}/by-week/preseason-week-${w}`);
  for (let w = 1; w <= 18; w++) urls.push(`https://www.nfl.com/schedules/${season}/by-week/week-${w}`);

  await Promise.allSettled(urls.map(async (url) => {
    try {
      const res = await fetch(url, { headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" } });
      if (!res.ok) return;
      const html = await res.text();
      
      // ページ内のチームマッチアップ情報を抽出
      const cards = html.split(/(?=<li\b|<div\b|<article\b)/i);
      for (const card of cards) {
        const kickoffValue = card.match(/(?:datetime|data-gametime|data-start-date|data-iso-time)="([^"]+)"/i)?.[1];
        if (!kickoffValue) continue;
        const kickoffAt = parseKickoff(kickoffValue);
        if (!kickoffAt) continue;

        // 含まれるチームを特定
        const foundCodes = Object.keys(TEAM_NAMES).filter(code => {
          const name = TEAM_NAMES[code];
          const nick = TEAM_NICKNAMES[code];
          return card.includes(name) || card.includes(code) || (nick && card.includes(nick));
        });

        if (foundCodes.length >= 2) {
          const [teamA, teamB] = foundCodes;
          const plain = text(card);
          const seasonPhase = phaseFor(kickoffAt);
          const weekNum = url.match(/(?:week-|preseason-week-)(\d+)/i)?.[1];
          const weekLabel = weekNum ? (seasonPhase === "preseason" ? `PRESEASON WEEK ${weekNum}` : `WEEK ${weekNum}`) : null;
          const venue = text(card.match(/(?:venue|stadium|location)[^>]*>([\s\S]*?)<\//i)?.[1] ?? "") || null;
          const broadcast = card.match(/\b(CBS|FOX|NBC|ESPN|NFLN|PRIME|NETFLIX)\b/i)?.[0] ?? null;

          // ホーム/アウェイ判定
          const nameA = TEAM_NAMES[teamA];
          const nameB = TEAM_NAMES[teamB];
          let aIsHome = false;
          if (new RegExp(`${nameB}.*?(?:at|@).*?(${nameA})`, "i").test(plain) || new RegExp(`${TEAM_NICKNAMES[teamB]}.*?(?:at|@).*?(${TEAM_NICKNAMES[teamA]})`, "i").test(plain)) {
            aIsHome = true;
          }

          const entryA = gameEntry(teamA, teamB, aIsHome ? "home" : "away", kickoffAt, seasonPhase, weekLabel, venue, broadcast, url);
          const entryB = gameEntry(teamB, teamA, aIsHome ? "away" : "home", kickoffAt, seasonPhase, weekLabel, venue, broadcast, url);

          const listA = teamGamesMap.get(teamA) || [];
          if (!listA.some(g => g.externalId === entryA.externalId)) listA.push(entryA);
          teamGamesMap.set(teamA, listA);

          const listB = teamGamesMap.get(teamB) || [];
          if (!listB.some(g => g.externalId === entryB.externalId)) listB.push(entryB);
          teamGamesMap.set(teamB, listB);
        }
      }
    } catch {
      // ネットワークエラー等は無視して続行
    }
  }));

  return teamGamesMap;
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

// キャッシュとして一括取得した全リーグのスケジュールを保持
let cachedLeagueGames: Map<string, InsertOfficialGame[]> | null = null;
let lastLeagueFetchTime = 0;

export async function refreshOfficialTeamData(teamCode: string) {
  const now = Date.now();
  if (!cachedLeagueGames || now - lastLeagueFetchTime > 30 * 60 * 1000) {
    cachedLeagueGames = await fetchAllLeagueGames();
    lastLeagueFetchTime = now;
  }

  const { rosterUrl } = getOfficialTeamDataSources(teamCode);
  const rosterHtml = await fetchOfficialHtml(rosterUrl).catch(() => "");
  const roster = parseOfficialRosterPage(rosterHtml, teamCode, rosterUrl);

  const teamGames = cachedLeagueGames.get(teamCode) ?? [];
  if (teamGames.length > 0) {
    await replaceOfficialGamesForTeam(teamCode, teamGames);
  }
  if (roster.length > 0) {
    await replaceOfficialRosterEntriesForTeam(teamCode, roster);
  }

  return { games: teamGames.length, leagueGames: teamGames.length, roster: roster.length, errors: 0 };
}
