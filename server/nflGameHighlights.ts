import fs from "fs";
import path from "path";
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
const NFL_YOUTUBE_RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${NFL_CHANNEL_ID}`;

const CACHE_DIR = path.resolve(process.cwd(), "server/data");
const CACHE_FILE_PATH = path.join(CACHE_DIR, "youtube_video_pool.json");

const accumulatedVideoPool = new Map<string, { title: string; url: string; addedAt: number }>();

function loadVideoPoolFromFile() {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const raw = fs.readFileSync(CACHE_FILE_PATH, "utf-8");
      const list = JSON.parse(raw) as Array<[string, { title: string; url: string; addedAt: number }]>;
      for (const [url, item] of list) {
        accumulatedVideoPool.set(url, item);
      }
    }
  } catch {
    // キャッシュ読み込み失敗時は新規マップ
  }
}

function saveVideoPoolToFile() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    const list = Array.from(accumulatedVideoPool.entries());
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch {
    // ファイル保存失敗時はメモリのみ
  }
}

loadVideoPoolFromFile();

function parseWeekNumber(weekLabel: string | null): number | null {
  if (!weekLabel) return null;
  const m = weekLabel.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

function getTeamAliases(teamCode: string): string[] {
  const fullName = TEAM_NAMES[teamCode] ?? teamCode;
  const parts = fullName.toLowerCase().split(/\s+/);
  const nickname = parts.pop() ?? teamCode.toLowerCase();
  const city = parts.join(" ");
  return [nickname, city, teamCode.toLowerCase()].filter(Boolean);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isMatchingVideo(title: string, game: HighlightableGame, weekNum: number | null): boolean {
  const lower = title.toLowerCase();
  if (!lower.includes("highlight")) return false;

  const awayAliases = getTeamAliases(game.awayTeamCode);
  const homeAliases = getTeamAliases(game.homeTeamCode);

  const hasAway = awayAliases.some((a) => lower.includes(a));
  const hasHome = homeAliases.some((h) => lower.includes(h));
  if (!hasAway || !hasHome) return false;

  if (weekNum !== null) {
    const hasWeek = new RegExp(`(?:week|wk|w)\\s*${weekNum}\\b`, "i").test(lower);
    if (!hasWeek && !lower.includes("rio") && !lower.includes("london") && !lower.includes("munich")) {
      return false;
    }
  }
  return true;
}

async function pollYouTubeRssFeed(): Promise<Array<{ title: string; url: string }>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(NFL_YOUTUBE_RSS_URL, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36" },
    });
    if (!res.ok) return Array.from(accumulatedVideoPool.values());
    const xml = await res.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];

    let hasNew = false;
    for (const entry of entries) {
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
      const url = entry.match(/<link[^>]*href="([^"]*)"/)?.[1] ?? "";
      if (title && url && !accumulatedVideoPool.has(url)) {
        accumulatedVideoPool.set(url, { title, url, addedAt: Date.now() });
        hasNew = true;
      }
    }
    if (hasNew) saveVideoPoolToFile();
  } catch {
    // エラー時は保持分を返す
  } finally {
    clearTimeout(timeout);
  }
  return Array.from(accumulatedVideoPool.values());
}

setInterval(() => {
  pollYouTubeRssFeed().catch(() => {});
}, 15 * 60 * 1000);

pollYouTubeRssFeed().catch(() => {});

async function searchViaYouTubeHtml(query: string, game: HighlightableGame, weekNum: number | null): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500); // 3.5秒で高速タイムアウト
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const dataMatch = html.match(/var ytInitialData\s*=\s*({[\s\S]*?});<\/script>/);
    if (!dataMatch) return null;

    const data = JSON.parse(dataMatch[1]);
    const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents ?? [];

    for (const sec of sections) {
      const items = sec?.itemSectionRenderer?.contents ?? [];
      for (const item of items) {
        const v = item.videoRenderer;
        if (!v) continue;
        const title = v.title?.runs?.[0]?.text || v.title?.simpleText || "";
        const videoId = v.videoId;
        if (!videoId) continue;
        const owner = v.ownerText?.runs?.[0]?.text || "";

        const isOfficial = owner.toLowerCase().includes("nfl") || !owner;
        if (isOfficial && isMatchingVideo(title, game, weekNum)) {
          const matchedUrl = `https://www.youtube.com/watch?v=${videoId}`;
          accumulatedVideoPool.set(matchedUrl, { title, url: matchedUrl, addedAt: Date.now() });
          saveVideoPoolToFile();
          return matchedUrl;
        }
      }
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
  return null;
}

export async function refreshOfficialGameHighlights(options?: { force?: boolean; targetWeek?: number }) {
  const allGames = (await getOfficialScoreboardGamesForHighlightMatching(options?.force ?? false)) as HighlightableGame[];
  if (!allGames.length) return { candidates: 0, linked: 0, sourceUrl: nflHighlightsSourceUrl };

  // ★ 改善：無関係な過去155試合を排除し、レギュラーシーズンのみに限定
  let targetGames = allGames.filter((g) => {
    const isReg = g.seasonPhase === "regular" || (g.weekLabel && g.weekLabel.toLowerCase().includes("week"));
    return isReg;
  });

  // 特定週の指定がある場合は絞り込み
  if (options?.targetWeek) {
    targetGames = targetGames.filter((g) => parseWeekNumber(g.weekLabel) === options.targetWeek);
  }

  // forceでない場合は正規動画（watch?v=）が未登録のものだけを対象にする
  if (!options?.force) {
    targetGames = targetGames.filter((g) => !g.nflHighlightUrl || !g.nflHighlightUrl.includes("watch?v="));
  }

  console.log(`\n========================================`);
  console.log(`対象試合数: ${targetGames.length} 試合（全${allGames.length}件からレギュラーシーズン未確定分を抽出）`);
  console.log(`========================================\n`);

  if (!targetGames.length) {
    return { candidates: 0, linked: 0, sourceUrl: nflHighlightsSourceUrl };
  }

  const videoPool = await pollYouTubeRssFeed();
  const links: NflHighlightLink[] = [];

  for (let i = 0; i < targetGames.length; i++) {
    const game = targetGames[i];
    const weekNum = parseWeekNumber(game.weekLabel);
    const awayName = TEAM_NAMES[game.awayTeamCode] ?? game.awayTeamCode;
    const homeName = TEAM_NAMES[game.homeTeamCode] ?? game.homeTeamCode;

    process.stdout.write(`[${i + 1}/${targetGames.length}] ${game.weekLabel ?? "W?"} ${game.awayTeamCode} @ ${game.homeTeamCode} ... `);

    let matchedUrl: string | null = null;

    // 1. プールから即時照合
    const poolMatch = videoPool.find((v) => isMatchingVideo(v.title, game, weekNum));
    if (poolMatch) {
      matchedUrl = poolMatch.url;
      console.log(`⚡ プールから即時ヒット: ${matchedUrl}`);
    }

    // 2. プールにない場合はWeb検索
    if (!matchedUrl) {
      const q = `NFL ${awayName} vs ${homeName} Week ${weekNum ?? ""} highlights`;
      matchedUrl = await searchViaYouTubeHtml(q, game, weekNum);
      if (matchedUrl) {
        console.log(`🔍 検索で見つかりました: ${matchedUrl}`);
      } else {
        console.log(`❌ 未検出`);
      }
      await sleep(250);
    }

    // 3. マッチしたら追加
    if (matchedUrl) {
      links.push({
        externalId: game.externalId,
        nflHighlightUrl: matchedUrl,
        sourceUrl: matchedUrl,
      });
      continue;
    }

    // 4. 未検出時のフォールバックURL
    if (!game.nflHighlightUrl) {
      const fallbackSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `NFL ${awayName} vs ${homeName} Week${weekNum ?? ""} highlights`
      )}`;
      links.push({
        externalId: game.externalId,
        nflHighlightUrl: fallbackSearchUrl,
        sourceUrl: fallbackSearchUrl,
      });
    }
  }

  if (links.length > 0) {
    await upsertOfficialScoreboardHighlights(links);
  }

  return { candidates: targetGames.length, linked: links.length, sourceUrl: nflHighlightsSourceUrl };
}
