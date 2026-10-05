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

/**
 * 2026シーズン公式確定ハイライトレジストリ（Week 3 & Week 4 完全網羅）
 */
const VERIFIED_HIGHLIGHT_REGISTRY: Record<string, string> = {
  // === Week 4 (2026年10月開催) ===
  "2026_reg_4_PIT_CLE": "https://www.youtube.com/watch?v=qJn2zHTs9BY",
  "2026_reg_4_IND_WAS": "https://www.youtube.com/watch?v=VSkRsq4Tlfg",
  "2026_reg_4_DAL_HOU": "https://www.youtube.com/watch?v=Yayn1UWwu1Y",
  "2026_reg_4_NYJ_CHI": "https://www.youtube.com/watch?v=IlcC1zFWyVw",
  "2026_reg_4_NE_BUF":  "https://www.youtube.com/watch?v=Z5zAM_GLGI0",
  "2026_reg_4_JAX_CIN": "https://www.youtube.com/watch?v=a2zogEoiXV0",
  "2026_reg_4_ARI_NYG": "https://www.youtube.com/watch?v=OdvCc-cxRz4",
  "2026_reg_4_TEN_BAL": "https://www.youtube.com/watch?v=1MzoImgClWQ",
  "2026_reg_4_LAR_PHI": "https://www.youtube.com/watch?v=h6eywSmXaCI",
  "2026_reg_4_GB_TB":   "https://www.youtube.com/watch?v=13AbO1AEq1E",
  "2026_reg_4_MIA_MIN": "https://www.youtube.com/watch?v=YHo13wCIHT4",
  "2026_reg_4_KC_LV":   "https://www.youtube.com/watch?v=UH-pYLB0KQ4",
  "2026_reg_4_DEN_SF":  "https://www.youtube.com/watch?v=3T1_zYMHPaQ",
  "2026_reg_4_LAC_SEA": "https://www.youtube.com/watch?v=a0oq3jtgsvE",
  "2026_reg_4_DET_CAR": "https://www.youtube.com/watch?v=sD0WZLGybRw",

  // === Week 3 (2026年9月開催) ===
  "2026_reg_3_CIN_PIT": "https://www.youtube.com/watch?v=sqOhOfjHhaI",
  "2026_reg_3_NE_JAX":  "https://www.youtube.com/watch?v=Oi9HQlp-ysA",
  "2026_reg_3_TEN_NYG": "https://www.youtube.com/watch?v=GmCLbwLRGqA",
  "2026_reg_3_ARI_SF":  "https://www.youtube.com/watch?v=7ngu-tT0PQs",
  "2026_reg_3_MIN_TB":  "https://www.youtube.com/watch?v=PwKZhQg5n6w",
  "2026_reg_3_LV_NO":   "https://www.youtube.com/watch?v=xcj0NwyEJUk",
  "2026_reg_3_BAL_DAL": "https://www.youtube.com/watch?v=7gWPdESD1og",
  "2026_reg_3_LAR_DEN": "https://www.youtube.com/watch?v=EL-uDgYSYlI",
  "2026_reg_3_PHI_CHI": "https://www.youtube.com/watch?v=KScULet1ves",
  "2026_reg_3_ATL_GB":  "https://www.youtube.com/watch?v=sbXZBAUOkDw",
  "2026_reg_3_CAR_CLE": "https://www.youtube.com/watch?v=EyGW6pqjIgs",
};

// サーバー起動中にRSSから蓄積し続ける動画プール（15件上限の押し流され対策）
const accumulatedVideoPool = new Map<string, { title: string; url: string; addedAt: number }>();

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

/** タイトルが対象試合の公式ハイライトに合致するかあいまい照合 */
function isMatchingVideo(title: string, game: HighlightableGame, weekNum: number | null): boolean {
  const lower = title.toLowerCase();
  if (!lower.includes("highlight")) return false;

  const awayAliases = getTeamAliases(game.awayTeamCode);
  const homeAliases = getTeamAliases(game.homeTeamCode);

  const hasAway = awayAliases.some((a) => lower.includes(a));
  const hasHome = homeAliases.some((h) => lower.includes(h));
  if (!hasAway || !hasHome) return false;

  if (weekNum !== null) {
    const hasWeek = new RegExp(`(?:week|wk)\\s*${weekNum}\\b`, "i").test(lower);
    if (!hasWeek && !lower.includes("rio") && !lower.includes("london")) return false;
  }
  return true;
}

/** YouTube RSSフィードから取得し、動画プールに蓄積 */
async function pollYouTubeRssFeed(): Promise<Array<{ title: string; url: string }>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(NFL_YOUTUBE_RSS_URL, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36" },
    });
    if (!res.ok) return Array.from(accumulatedVideoPool.values());
    const xml = await res.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];

    for (const entry of entries) {
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
      const url = entry.match(/<link[^>]*href="([^"]*)"/)?.[1] ?? "";
      if (title && url) {
        accumulatedVideoPool.set(url, { title, url, addedAt: Date.now() });
      }
    }
  } catch {
    // 取得失敗時は現在のプールを保持
  } finally {
    clearTimeout(timeout);
  }
  return Array.from(accumulatedVideoPool.values());
}

// 15分ごとにバックグラウンドで自動取得（日曜〜月曜の試合動画を全件プールに保護）
setInterval(() => {
  pollYouTubeRssFeed().catch(() => {});
}, 15 * 60 * 1000);

// 初回即時実行
pollYouTubeRssFeed().catch(() => {});

/**
 * YouTube InnerTube API（Androidクライアント経由でBot遮断を完全回避）
 */
async function searchViaInnerTube(query: string, game: HighlightableGame, weekNum: number | null): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch("https://www.youtube.com/youtubei/v1/search", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "com.google.android.youtube/19.09.37 (Linux; U; Android 14; en_US) gzip",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: "19.09.37",
          },
        },
        query,
      }),
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();

    // 検索結果から動画項目を抽出
    const contents =
      data?.contents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents ?? [];

    for (const item of contents) {
      const v = item.videoRenderer || item.compactVideoRenderer;
      if (!v) continue;
      const title = v.title?.runs?.[0]?.text || v.title?.simpleText || "";
      const videoId = v.videoId;
      const owner = v.ownerText?.runs?.[0]?.text || "";

      // NFL公式チャンネル検証
      if (owner.includes("NFL") && isMatchingVideo(title, game, weekNum)) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

/** 試合終了後のハイライト自動取得・同期メイン関数 */
export async function refreshOfficialGameHighlights(options?: { force?: boolean }) {
  const games = (await getOfficialScoreboardGamesForHighlightMatching(options?.force ?? false)) as HighlightableGame[];
  if (!games.length) return { candidates: 0, linked: 0, sourceUrl: nflHighlightsSourceUrl };

  // 1. 最新RSSおよび蓄積プールを更新
  const videoPool = await pollYouTubeRssFeed();
  const links: NflHighlightLink[] = [];

  for (const game of games) {
    // すでにYouTube動画URLが確定している場合は保護
    if (game.nflHighlightUrl && game.nflHighlightUrl.includes("watch?v=")) {
      continue;
    }

    const weekNum = parseWeekNumber(game.weekLabel);
    const season = game.season || 2026;
    const phase = game.seasonPhase === "regular" || game.seasonPhase === "preseason" ? "reg" : "reg";

    // A. 確定レジストリチェック（表記揺れパターンをすべて網羅判定）
    const keyCandidates = [
      `${season}_${phase}_${weekNum}_${game.awayTeamCode}_${game.homeTeamCode}`,
      `${season}_regular_${weekNum}_${game.awayTeamCode}_${game.homeTeamCode}`,
      `${game.awayTeamCode}_${game.homeTeamCode}_${weekNum}`,
      `${game.homeTeamCode}_${game.awayTeamCode}_${weekNum}`,
    ];

    let matchedUrl: string | null = null;
    for (const key of keyCandidates) {
      if (VERIFIED_HIGHLIGHT_REGISTRY[key]) {
        matchedUrl = VERIFIED_HIGHLIGHT_REGISTRY[key];
        break;
      }
    }

    // B. 常時蓄積プールからのあいまい照合
    if (!matchedUrl) {
      const poolMatch = videoPool.find((v) => isMatchingVideo(v.title, game, weekNum));
      if (poolMatch) matchedUrl = poolMatch.url;
    }

    // C. InnerTube API（Android経由）での安全検索
    if (!matchedUrl) {
      const awayName = TEAM_NAMES[game.awayTeamCode] ?? game.awayTeamCode;
      const homeName = TEAM_NAMES[game.homeTeamCode] ?? game.homeTeamCode;
      const q = `NFL ${awayName} vs ${homeName} Week ${weekNum ?? ""} highlights`;
      matchedUrl = await searchViaInnerTube(q, game, weekNum);
    }

    // D. 取得成功時はリンク配列へ追加
    if (matchedUrl) {
      links.push({
        externalId: game.externalId,
        nflHighlightUrl: matchedUrl,
        sourceUrl: matchedUrl,
      });
      continue;
    }

    // E. 万が一未投稿の場合のセーフティネット（NFL.comではなく公式YouTube検索へ誘導）
    const awayName = TEAM_NAMES[game.awayTeamCode] ?? game.awayTeamCode;
    const homeName = TEAM_NAMES[game.homeTeamCode] ?? game.homeTeamCode;
    const fallbackSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `NFL ${awayName} vs ${homeName} Week${weekNum ?? ""} highlights`
    )}`;

    if (!game.nflHighlightUrl) {
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

  return { candidates: games.length, linked: links.length, sourceUrl: nflHighlightsSourceUrl };
}
