import { TEAM_NAMES } from "./officialTeamData";
import { getOfficialScoreboardGamesForHighlightMatching, upsertOfficialScoreboardHighlights } from "./db";

type HighlightableGame = {
  externalId: string;
  seasonPhase: "preseason" | "regular" | "postseason";
  weekLabel: string | null;
  awayTeamCode: string;
  homeTeamCode: string;
  gameState: string;
  nflHighlightUrl?: string | null;
};

export type NflHighlightLink = { externalId: string; nflHighlightUrl: string; sourceUrl: string };

export const nflHighlightsSourceUrl = "https://www.youtube.com/videos/channel/game-highlights-vc";
const NFL_YOUTUBE_RSS_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=UCDVYQ4Zhbm3S2dlz7P1GBDg";

/** チームコードから検索・照合用のキーワード（地名とニックネーム）を抽出 */
function getTeamKeywords(teamCode: string): string[] {
  const fullName = TEAM_NAMES[teamCode];
  if (!fullName) return [teamCode.toLowerCase()];
  const parts = fullName.toLowerCase().split(/\s+/);
  const nickname = parts.at(-1) ?? "";
  const city = parts.slice(0, -1).join(" ");
  return [nickname, city, fullName.toLowerCase()].filter(Boolean);
}

/** 週番号を抽出 (例: "WEEK 2" -> "2") */
function weekNumber(weekLabel: string | null): string | null {
  if (!weekLabel) return null;
  const m = weekLabel.match(/(\d+)/);
  return m ? m[1] : null;
}

/** YouTube 動画タイトルが対象試合のハイライトと完全に一致するか厳密照合 */
function isVideoMatchingGame(title: string, game: HighlightableGame): boolean {
  const lower = title.toLowerCase();

  // 1. ハイライト動画であること
  if (!lower.includes("highlight")) return false;

  // 2. 週番号の検証 (Week 2, Wk 2 など)
  const wk = weekNumber(game.weekLabel);
  if (wk) {
    const weekPattern = new RegExp(`(?:week|wk)\\s*${wk}\\b`, "i");
    if (!weekPattern.test(lower)) return false;
  }

  // 3. 両チームのキーワード（ニックネームまたは地名）が含まれていること
  const awayKeys = getTeamKeywords(game.awayTeamCode);
  const homeKeys = getTeamKeywords(game.homeTeamCode);

  const hasAway = awayKeys.some((k) => lower.includes(k));
  const hasHome = homeKeys.some((k) => lower.includes(k));

  return hasAway && hasHome;
}

/** YouTube RSS フィードから最新動画を取得 */
async function fetchYouTubeHighlightsFeed(): Promise<Array<{ title: string; url: string }>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(NFL_YOUTUBE_RSS_URL, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];
    return entries
      .map((entry) => {
        const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
        const url = entry.match(/<link[^>]*href="([^"]*)"/)?.[1] ?? "";
        return { title, url };
      })
      .filter((item) => Boolean(item.title && item.url));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/** RSS から押し出された過去試合を YouTube 検索から抽出（フォールバック） */
async function searchYouTubeOfficialHighlight(game: HighlightableGame): Promise<string | null> {
  const awayName = TEAM_NAMES[game.awayTeamCode] ?? game.awayTeamCode;
  const homeName = TEAM_NAMES[game.homeTeamCode] ?? game.homeTeamCode;
  const wk = weekNumber(game.weekLabel);
  const weekQuery = wk ? `Week ${wk}` : "";
  const query = encodeURIComponent(`NFL "${awayName}" vs "${homeName}" ${weekQuery} game highlights`);
  const searchUrl = `https://www.youtube.com/results?search_query=${query}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();

    // 動画IDとタイトルの抽出
    const videoMatches = Array.from(html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)).map((m) => m[1]);
    const uniqueIds = Array.from(new Set(videoMatches));

    if (uniqueIds.length > 0) {
      // 検索結果最上位の候補を採用
      return `https://www.youtube.com/watch?v=${uniqueIds[0]}`;
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** 試合終了後のハイライト自動取得・同期メイン関数 */
export async function refreshOfficialGameHighlights() {
  const games = await getOfficialScoreboardGamesForHighlightMatching();
  if (!games.length) return { candidates: 0, linked: 0, sourceUrl: nflHighlightsSourceUrl };

  const ytVideos = await fetchYouTubeHighlightsFeed();
  const links: NflHighlightLink[] = [];

  for (const game of games) {
    // 既に YouTube の正常な動画 URL が設定されている場合はスキップ
    const isCurrentlyYouTube = Boolean(game.nflHighlightUrl && game.nflHighlightUrl.includes("youtube.com"));
    if (isCurrentlyYouTube) continue;

    // 1. YouTube RSS フィードから照合
    const matchedFeedVideo = ytVideos.find((v) => isVideoMatchingGame(v.title, game));
    if (matchedFeedVideo) {
      links.push({
        externalId: game.externalId,
        nflHighlightUrl: matchedFeedVideo.url,
        sourceUrl: matchedFeedVideo.url,
      });
      continue;
    }

    // 2. RSS にない場合は YouTube 直接検索で救済
    const searchedUrl = await searchYouTubeOfficialHighlight(game);
    if (searchedUrl) {
      links.push({
        externalId: game.externalId,
        nflHighlightUrl: searchedUrl,
        sourceUrl: searchedUrl,
      });
      continue;
    }

    // ※動画が見つからない場合は、壊れた nfl.com URL で上書きせず保留（準備中）にする
  }

  if (links.length > 0) {
    await upsertOfficialScoreboardHighlights(links);
  }

  return { candidates: games.length, linked: links.length, sourceUrl: nflHighlightsSourceUrl };
}
