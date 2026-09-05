import { createHash } from "node:crypto";
import type { InsertOfficialGame, InsertOfficialRosterEntry } from "../drizzle/schema";
import { replaceOfficialGamesForTeam, replaceOfficialRosterEntriesForTeam } from "./db";

export const TEAM_DOMAINS: Record<string, string> = {
  ARI: "azcardinals.com", ATL: "atlantafalcons.com", BAL: "baltimoreravens.com", BUF: "buffalobills.com", CAR: "panthers.com", CHI: "chicagobears.com", CIN: "bengals.com", CLE: "clevelandbrowns.com", DAL: "dallascowboys.com", DEN: "denverbroncos.com", DET: "detroitlions.com", GB: "packers.com", HOU: "houstontexans.com", IND: "colts.com", JAX: "jaguars.com", KC: "chiefs.com", LAC: "chargers.com", LAR: "therams.com", LV: "raiders.com", MIA: "miamidolphins.com", MIN: "vikings.com", NE: "patriots.com", NO: "neworleanssaints.com", NYG: "giants.com", NYJ: "newyorkjets.com", PHI: "philadelphiaeagles.com", PIT: "steelers.com", SF: "49ers.com", SEA: "seahawks.com", TB: "buccaneers.com", TEN: "titansonline.com", WAS: "commanders.com",
};

export const TEAM_NAMES: Record<string, string> = {
  ARI: "Arizona Cardinals", ATL: "Atlanta Falcons", BAL: "Baltimore Ravens", BUF: "Buffalo Bills", CAR: "Carolina Panthers", CHI: "Chicago Bears", CIN: "Cincinnati Bengals", CLE: "Cleveland Browns", DAL: "Dallas Cowboys", DEN: "Denver Broncos", DET: "Detroit Lions", GB: "Green Bay Packers", HOU: "Houston Texans", IND: "Indianapolis Colts", JAX: "Jacksonville Jaguars", KC: "Kansas City Chiefs", LAC: "Los Angeles Chargers", LAR: "Los Angeles Rams", LV: "Las Vegas Raiders", MIA: "Miami Dolphins", MIN: "Minnesota Vikings", NE: "New England Patriots", NO: "New Orleans Saints", NYG: "New York Giants", NYJ: "New York Jets", PHI: "Philadelphia Eagles", PIT: "Pittsburgh Steelers", SF: "San Francisco 49ers", SEA: "Seattle Seahawks", TB: "Tampa Bay Buccaneers", TEN: "Tennessee Titans", WAS: "Commanders",
};

export const TEAM_NICKNAMES: Record<string, string> = {
  ARI: "Cardinals", ATL: "Falcons", BAL: "Ravens", BUF: "Bills", CAR: "Panthers", CHI: "Bears", CIN: "Bengals", CLE: "Browns", DAL: "Cowboys", DEN: "Broncos", DET: "Lions", GB: "Packers", HOU: "Texans", IND: "Colts", JAX: "Jaguars", KC: "Chiefs", LAC: "Chargers", LAR: "Rams", LV: "Raiders", MIA: "Dolphins", MIN: "Vikings", NE: "Patriots", NO: "Saints", NYG: "Giants", NYJ: "Jets", PHI: "Eagles", PIT: "Steelers", SF: "49ers", SEA: "Seahawks", TB: "Buccaneers", TEN: "Titans", WAS: "Commanders",
};

function decodeCodePoint(value: string, radix: number) {
  const codePoint = Number.parseInt(value, radix);
  return Number.isFinite(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : `&#${radix === 16 ? "x" : ""}${value};`;
}

/** Decode official HTML text consistently so entity-encoded player names never reach the roster cache. */
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

function parseLeagueKickoff(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 2000 ? undefined : date;
}

function phaseFor(kickoffAt: Date, sourceText: string) {
  if (/pre\s*season|\bPRE\b/i.test(sourceText) || kickoffAt.getUTCMonth() === 7) return "preseason" as const;
  if (/post\s*season|playoff/i.test(sourceText)) return "postseason" as const;
  return "regular" as const;
}

/** NFL weeks begin on Thursday; this fills a label when an official league card omits its Week heading. */
export function fallbackWeekLabel(kickoffAt: Date, seasonPhase: "preseason" | "regular" | "postseason") {
  if (seasonPhase === "postseason") return null;
  const season = kickoffAt.getUTCFullYear();
  const anchorMonth = seasonPhase === "preseason" ? 7 : 8;
  const first = new Date(Date.UTC(season, anchorMonth, 1));
  const firstThursdayOffset = (4 - first.getUTCDay() + 7) % 7;
  const firstThursday = new Date(Date.UTC(season, anchorMonth, 1 + firstThursdayOffset));
  if (seasonPhase === "preseason") firstThursday.setUTCDate(firstThursday.getUTCDate() + 7);
  const week = Math.floor((kickoffAt.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1_000)) + 1;
  if (week < 1 || week > (seasonPhase === "preseason" ? 5 : 18)) return null;
  return seasonPhase === "preseason" ? `PRESEASON WEEK ${week}` : `WEEK ${week}`;
}

function gameEntry(teamCode: string, opponentCode: string, homeAway: "home" | "away", kickoffAt: Date, seasonPhase: "preseason" | "regular" | "postseason", weekLabel: string | null, venue: string | null, broadcast: string | null, sourceUrl: string): InsertOfficialGame {
  return { externalId: hash(`${teamCode}:${kickoffAt.toISOString()}:${opponentCode}`), teamCode, opponentCode, homeAway, seasonPhase, weekLabel, kickoffAt, venue, broadcast, sourceUrl, fetchedAt: new Date() };
}

export function parseOfficialSchedulePage(html: string, teamCode: string, sourceUrl: string): InsertOfficialGame[] {
  const teamName = TEAM_NAMES[teamCode];
  if (!teamName) return [];
  const games: InsertOfficialGame[] = [];
  const cards = html.split(/(?=<div class="nfl-o-matchup-cards\b)/gi);
  for (const card of cards) {
    const kickoffValue = card.match(/data-gametime="([^"]+)"/i)?.[1];
    const kickoffAt = kickoffValue ? parseKickoff(kickoffValue) : undefined;
    if (!kickoffAt) continue;
    const matchedTeams = Object.entries(TEAM_NAMES).filter(([, name]) => card.includes(name));
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

/** カード内の属性、テキストの日付表記、または週番号からキックオフ日時を解決する */
function resolveCardKickoff(card: string, weekNum: number | null, season: number): Date | undefined {
  const kickoffValue = card.match(/(?:datetime|data-gametime|data-start-date|data-iso-time)="([^"]+)"/i)?.[1];
  if (kickoffValue) {
    const parsed = parseLeagueKickoff(kickoffValue) ?? parseKickoff(kickoffValue);
    if (parsed) return parsed;
  }

  // "Jan 10" や "Sep 13" などのテキスト日付パターン
  const dateMatch = card.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2})\b/i);
  if (dateMatch) {
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const monthIdx = monthNames.findIndex((m) => dateMatch[1].toLowerCase().startsWith(m));
    if (monthIdx !== -1) {
      const day = Number.parseInt(dateMatch[2], 10);
      const year = monthIdx < 5 ? season + 1 : season;
      return new Date(Date.UTC(year, monthIdx, day, 18, 0, 0));
    }
  }

  // TBD等で日付が見当たらない場合は週番号（日曜日正午）をフォールバック
  if (weekNum && weekNum >= 1 && weekNum <= 18) {
    const week1Sunday = new Date(Date.UTC(season, 8, 13, 18, 0, 0));
    return new Date(week1Sunday.getTime() + (weekNum - 1) * 7 * 24 * 60 * 60 * 1_000);
  }

  return undefined;
}

export function parseNFLLeagueSchedulePage(html: string, teamCode: string, sourceUrl: string): InsertOfficialGame[] {
  const teamName = TEAM_NAMES[teamCode];
  const teamNickname = TEAM_NICKNAMES[teamCode] ?? teamName.split(" ").at(-1)!;
  if (!teamName) return [];
  const season = currentSeason();
  const games: InsertOfficialGame[] = [];
  const weekHeaders = Array.from(html.matchAll(/<h[2-4][^>]*>\s*(?:(Preseason)\s+)?Week\s+(\d+)\s*<\/h[2-4]>/gi));
  
  // <li> タグ全体を柔軟にマッチング
  const cardMatches = Array.from(html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi));

  for (const match of cardMatches) {
    const card = match[0];
    // ヘッダーナビやスコアストリップ等のノイズを除外
    if (card.includes("score-strip") || card.includes("nfl-c-header")) continue;
    
    // 自チームが含まれているか判定
    const hasTeam = card.includes(teamName) || card.includes(teamNickname);
    if (!hasTeam) continue;

    // 対戦相手の検出（フルネームまたはニックネーム）
    const opponentEntry = Object.entries(TEAM_NAMES).find(([code, name]) => {
      if (code === teamCode) return false;
      const nick = TEAM_NICKNAMES[code];
      return card.includes(name) || (nick && card.includes(nick));
    });
    if (!opponentEntry) continue;
    const [oppCode, oppName] = opponentEntry;
    const oppNickname = TEAM_NICKNAMES[oppCode] ?? oppName.split(" ").at(-1)!;

    const plain = text(card);

    // 週番号の解決
    const headerMatch = weekHeaders.filter((header) => (header.index ?? -1) <= (match.index ?? -1)).at(-1);
    const inlineWeek = plain.match(/(?:Preseason\s+)?Week\s+(\d+)/i)?.[1];
    const resolvedWeekStr = headerMatch?.[2] ?? inlineWeek;
    const weekNum = resolvedWeekStr ? Number.parseInt(resolvedWeekStr, 10) : null;

    // キックオフ日時の解決（TBD救済含む）
    const kickoffAt = resolveCardKickoff(card, weekNum, season);
    if (!kickoffAt) continue;

    // ホーム／アウェイ判定（at, vs, @, カード内出現順に対応）
    let homeAway: "home" | "away" | null = null;
    if (new RegExp(`${teamNickname}\\s+(?:at|@)\\s+${oppNickname}`, "i").test(plain) || new RegExp(`@\\s*${oppNickname}`, "i").test(plain)) {
      homeAway = "away";
    } else if (new RegExp(`${oppNickname}\\s+(?:at|@)\\s+${teamNickname}`, "i").test(plain) || new RegExp(`@\\s*${teamNickname}`, "i").test(plain)) {
      homeAway = "home";
    } else if (new RegExp(`${teamNickname}\\s+vs\\.?\\s+${oppNickname}`, "i").test(plain) || new RegExp(`vs\\.?\\s+${oppNickname}`, "i").test(plain)) {
      homeAway = "home";
    } else if (new RegExp(`${oppNickname}\\s+vs\\.?\\s+${teamNickname}`, "i").test(plain)) {
      homeAway = "away";
    } else {
      const teamIdx = plain.indexOf(teamNickname);
      const oppIdx = plain.indexOf(oppNickname);
      if (teamIdx !== -1 && oppIdx !== -1) {
        homeAway = teamIdx < oppIdx ? "away" : "home";
      } else {
        homeAway = "home";
      }
    }

    const seasonPhase = phaseFor(kickoffAt, card);
    const isPreseason = Boolean(headerMatch?.[1]) || seasonPhase === "preseason";
    const weekLabel = weekNum
      ? isPreseason ? `PRESEASON WEEK ${weekNum}` : `WEEK ${weekNum}`
      : fallbackWeekLabel(kickoffAt, seasonPhase);

    const venue = text(card.match(/(?:venue|stadium|location)[^>]*>([\s\S]*?)<\//i)?.[1] ?? "") || null;
    const broadcast = plain.match(/\b(CBS|FOX|NBC|ESPN|NFLN|PRIME|NETFLIX)\b/i)?.[0] ?? null;

    const entry = gameEntry(teamCode, oppCode, homeAway, kickoffAt, seasonPhase, weekLabel, venue, broadcast, sourceUrl);

    // 週ごとの重複登録を防止
    if (!games.some((g) => g.externalId === entry.externalId || (entry.weekLabel && g.weekLabel === entry.weekLabel))) {
      games.push(entry);
    }
  }

  return games;
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
  if (roster.length > 0) await replaceOfficialRosterEntriesForTeam(teamCode, roster);
  return { games: preferredGames.length, leagueGames: leagueGames.length, roster: roster.length, errors: [leagueResult, scheduleResult, rosterResult].filter((result) => result.status === "rejected").length };
}
