import { TEAM_NAMES } from "./officialTeamData";
import { getOfficialScoreboardGamesForHighlightMatching, upsertOfficialScoreboardHighlights } from "./db";

type HighlightableGame = {
  externalId: string;
  season: number;
  seasonPhase: "preseason" | "regular" | "postseason";
  weekLabel: string | null;
  awayTeamCode: string;
  homeTeamCode: string;
  gameState: string;
  gameUrl?: string | null;
  nflHighlightUrl?: string | null;
};

export type NflHighlightLink = {
  externalId: string;
  nflHighlightUrl: string;
  sourceUrl: string;
};

export const nflHighlightsSourceUrl = "https://www.youtube.com/channel/UCDVYQ4Zhbm3S2dlz7P1GBDg";
const NFL_CHANNEL_ID = "UCDVYQ4Zhbm3S2dlz7P1GBDg";
const NFL_YOUTUBE_RSS_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=UCDVYQ4Zhbm3S2dlz7P1GBDg";

/** 手動優先指定マップ（必要に応じてURLをピンポイント固定できる安全装置） */
const MANUAL_HIGHLIGHT_OVERRIDES: Record<string, string> = {
  "2026_reg_3_ATL_GB": "https://www.youtube.com/watch?v=sbXZBAUOkDw",
  "2026_reg_3_CAR_CLE": "https://www.youtube.com/watch?v=EyGW6pqjIgs",
  "2026_reg_3_PHI_CHI": "https://www.youtube.com/watch?v=KScULet1ves",
};

function parseWeekNumber(weekLabel: string | null): number | null {
  if (!weekLabel) return null;
  const m = weekLabel.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

function getTeamNickname(teamCode: string): string {
  const fullName = TEAM_NAMES[teamCode] ?? teamCode;
  return fullName.split(/\s+/).pop()?.toLowerCase() ?? teamCode.toLowerCase();
}

/** YouTube RSSフィードから最新の公式動画一覧を取得 */
async function fetchYouTubeHighlightsFeed(): Promise<Array<{ title: string; url: string }>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(NFL_YOUTUBE_RSS_URL, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];
    return entries.map((entry) => {
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
      const url = entry.match(/<link[^>]*href="([^"]*)"/)?.[1] ?? "";
      return { title, url };
    }).filter((item) => Boolean(item.title && item.url));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/** タイトルが対象試合の公式ハイライトに合致するか厳密照合 */
function isMatchingVideo(title: string, game: HighlightableGame, weekNum: number | null): boolean {
  const lower = title.toLowerCase();
  if (!lower.includes("highlight")) return false;

  const awayNick = getTeamNickname(game.awayTeamCode);
  const homeNick = getTeamNickname(game.homeTeamCode);
  if (!lower.includes(awayNick) || !lower.includes(homeNick)) return false;

  if (weekNum !== null) {
    const hasWeek = new RegExp(`(?:week|wk)\\s*${weekNum}\\b`, "i").test(lower);
    if (!hasWeek) return false;
  }
  return true;
}

/** 検索結果HTMLから動画一覧を解析 */
function parseVideosFromHtml(html: string): any[] {
  const jsonMatch = html.match(/var ytInitialData = ({[\s\S]+?});<\/script>/);
  if (!jsonMatch) return [];
  try {
    const data = JSON.parse(jsonMatch[1]);
    const results: any[] = [];
    const findVideos = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      if (obj.videoRenderer) results.push(obj.videoRenderer);
      for (const k of Object.keys(obj)) findVideos(obj[k]);
    };
    findVideos(data);
    return results;
  } catch {
    return [];
  }
}

/** クエリを指定してYouTube検索から公式動画を検出 */
async function searchSingleQuery(queryStr: string, game: HighlightableGame, weekNum: number | null): Promise<string | null> {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(queryStr)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const videos = parseVideosFromHtml(html);

    for (const v of videos) {
      const title = v.title?.runs?.[0]?.text || "";
      const channelId = v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || "";
      const channelTitle = (v.ownerText?.runs?.[0]?.text || "").trim();
      const videoId = v.videoId;

      const isOfficial = channelId === NFL_CHANNEL_ID || channelTitle === "NFL";
      if (!isOfficial) continue;

      if (isMatchingVideo(title, game, weekNum)) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
  return null;
}

/** 2パターンのクエリで自動リトライする高精度検索 */
async function searchYouTubeOfficialHighlight(game: HighlightableGame): Promise<string | null> {
  const awayName = TEAM_NAMES[game.awayTeamCode] ?? game.awayTeamCode;
  const homeName = TEAM_NAMES[game.homeTeamCode] ?? game.homeTeamCode;
  const awayNick = getTeamNickname(game.awayTeamCode);
  const homeNick = getTeamNickname(game.homeTeamCode);
  const weekNum = parseWeekNumber(game.weekLabel);
  const season = game.season || 2026;

  // パターン1: 標準マッチ
  const query1 = `NFL ${awayName} vs ${homeName} Week ${weekNum ?? ""} highlights`;
  const res1 = await searchSingleQuery(query1, game, weekNum);
  if (res1) return res1;

  // パターン2: シーズン年・週優先マッチ（リトライ）
  const query2 = `${season} NFL season week ${weekNum ?? ""} highlights ${awayNick} ${homeNick}`;
  return await searchSingleQuery(query2, game, weekNum);
}

/** 試合終了後のハイライト自動取得・同期メイン関数 */
export async function refreshOfficialGameHighlights(options?: { force?: boolean }) {
  const games = (await getOfficialScoreboardGamesForHighlightMatching(options?.force ?? false)) as HighlightableGame[];
  if (!games.length) return { candidates: 0, linked: 0, sourceUrl: nflHighlightsSourceUrl };

  // 1. 最新RSSフィードを取得（直近試合の即時マッチ用）
  const rssVideos = await fetchYouTubeHighlightsFeed();
  const links: NflHighlightLink[] = [];

  for (const game of games) {
    const weekNum = parseWeekNumber(game.weekLabel);
    const overrideKey = `${game.season || 2026}_${game.seasonPhase || 'reg'}_${weekNum}_${game.awayTeamCode}_${game.homeTeamCode}`;

    // A. 手動マップチェック
    if (MANUAL_HIGHLIGHT_OVERRIDES[overrideKey]) {
      const url = MANUAL_HIGHLIGHT_OVERRIDES[overrideKey];
      links.push({ externalId: game.externalId, nflHighlightUrl: url, sourceUrl: url });
      continue;
    }

    // B. RSSフィードから照合
    const rssMatch = rssVideos.find((v) => isMatchingVideo(v.title, game, weekNum));
    if (rssMatch) {
      links.push({ externalId: game.externalId, nflHighlightUrl: rssMatch.url, sourceUrl: rssMatch.url });
      continue;
    }

    // C. デュアルクエリ検索で照合
    const youtubeUrl = await searchYouTubeOfficialHighlight(game);
    if (youtubeUrl) {
      links.push({ externalId: game.externalId, nflHighlightUrl: youtubeUrl, sourceUrl: youtubeUrl });
      continue;
    }

    // D. どうしても見つからない場合のみ一時的に NFL.com 公式詳細へ退避
    if (game.gameUrl && !game.nflHighlightUrl) {
      links.push({ externalId: game.externalId, nflHighlightUrl: game.gameUrl, sourceUrl: game.gameUrl });
    }
  }

  if (links.length > 0) {
    await upsertOfficialScoreboardHighlights(links);
  }

  return { candidates: games.length, linked: links.length, sourceUrl: nflHighlightsSourceUrl };
}
