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

/** 週番号を抽出（例: "WEEK 3" -> 3） */
function parseWeekNumber(weekLabel: string | null): number | null {
  if (!weekLabel) return null;
  const m = weekLabel.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

/** チームコードからニックネーム（最後の単語）を取得 */
function getTeamNickname(teamCode: string): string {
  const fullName = TEAM_NAMES[teamCode] ?? teamCode;
  return fullName.split(/\s+/).pop()?.toLowerCase() ?? teamCode.toLowerCase();
}

/** YouTube 検索から NFL公式チャンネルの当シーズンハイライト動画のみを厳密に抽出 */
async function searchYouTubeOfficialHighlight(game: HighlightableGame): Promise<string | null> {
  const awayName = TEAM_NAMES[game.awayTeamCode] ?? game.awayTeamCode;
  const homeName = TEAM_NAMES[game.homeTeamCode] ?? game.homeTeamCode;
  const weekNum = parseWeekNumber(game.weekLabel);
  const season = game.season || 2026;

  // 検索クエリ
  const query = encodeURIComponent(`NFL ${awayName} vs ${homeName} ${season} Week ${weekNum ?? ""} game highlights`);
  const searchUrl = `https://www.youtube.com/results?search_query=${query}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();

    const jsonMatch = html.match(/var ytInitialData = ({[\s\S]+?});<\/script>/);
    if (!jsonMatch) return null;
    const data = JSON.parse(jsonMatch[1]);

    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

    const awayNick = getTeamNickname(game.awayTeamCode);
    const homeNick = getTeamNickname(game.homeTeamCode);

    for (const item of contents) {
      const v = item.videoRenderer;
      if (!v) continue;

      const title = (v.title?.runs?.[0]?.text || "").toLowerCase();
      const channelId = v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || "";
      const channelTitle = (v.ownerText?.runs?.[0]?.text || "").trim();
      const videoId = v.videoId;

      // 1. NFL 公式チャンネルのみ許可
      const isOfficialNFL = channelId === NFL_CHANNEL_ID || channelTitle === "NFL";
      if (!isOfficialNFL) continue;

      // 2. ハイライト動画であること
      if (!title.includes("highlight")) continue;

      // 3. 当該シーズン（2026年等）の照合（過去シーズンの誤検知を完全排除）
      if (!title.includes(String(season))) continue;

      // 4. 週番号の照合
      if (weekNum !== null) {
        const hasWeek = new RegExp(`(?:week|wk)\\s*${weekNum}\\b`, "i").test(title);
        if (!hasWeek) continue;
      }

      // 5. 両チームのニックネームが含まれていること
      if (title.includes(awayNick) && title.includes(homeNick)) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
  } catch {
    // タイムアウトまたはパース失敗時は null を返却
  } finally {
    clearTimeout(timeout);
  }
  return null;
}

/** 試合終了後のハイライト自動取得・同期メイン関数 */
export async function refreshOfficialGameHighlights(options?: { force?: boolean }) {
  const games = (await getOfficialScoreboardGamesForHighlightMatching(options?.force ?? false)) as HighlightableGame[];
  if (!games.length) return { candidates: 0, linked: 0, sourceUrl: nflHighlightsSourceUrl };

  const links: NflHighlightLink[] = [];

  for (const game of games) {
    // 公式ハイライトを精密検索
    const youtubeUrl = await searchYouTubeOfficialHighlight(game);

    if (youtubeUrl) {
      links.push({
        externalId: game.externalId,
        nflHighlightUrl: youtubeUrl,
        sourceUrl: youtubeUrl,
      });
    } else if (game.gameUrl) {
      // YouTube公式動画が見つからない場合は、偽動画ではなく NFL.com 公式ゲーム詳細へフォールバック
      links.push({
        externalId: game.externalId,
        nflHighlightUrl: game.gameUrl,
        sourceUrl: game.gameUrl,
      });
    }
  }

  if (links.length > 0) {
    await upsertOfficialScoreboardHighlights(links);
  }

  return { candidates: games.length, linked: links.length, sourceUrl: nflHighlightsSourceUrl };
}
