import { TEAM_NAMES, TEAM_NICKNAMES } from "./officialTeamData";
import { getOfficialScoreboardGamesForHighlightMatching, upsertOfficialScoreboardHighlights } from "./db";

export type HighlightableGame = {
  externalId: string;
  season: number;
  seasonPhase: "preseason" | "regular" | "postseason";
  weekLabel: string | null;
  awayTeamCode: string;
  homeTeamCode: string;
  gameState: string;
  gameDate?: string | null;
  kickoffAt?: Date | null;
  gameUrl?: string | null;
  nflHighlightUrl?: string | null;
};

export type NflHighlightLink = {
  externalId: string;
  nflHighlightUrl: string;
  sourceUrl: string;
};

export type ChannelVideo = {
  videoId: string;
  title: string;
  publishedAt: Date;
};

export const nflHighlightsSourceUrl = "https://www.youtube.com/channel/UCDVYQ4Zhbm3S2dlz7P1GBDg";
const NFL_CHANNEL_ID = "UCDVYQ4Zhbm3S2dlz7P1GBDg";
// チャンネルIDの先頭 "UC" を "UU" に替えると「全アップロード動画」の再生リストIDになる
const NFL_UPLOADS_PLAYLIST_ID = `UU${NFL_CHANNEL_ID.slice(2)}`;
const NFL_YOUTUBE_RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${NFL_CHANNEL_ID}`;

const DAY_MS = 24 * 60 * 60 * 1000;
// 通常実行で照合する試合の範囲（キックオフから何日前まで遡るか）
const LOOKBACK_DAYS = 21;
// 動画の公開日時として許容する範囲（キックオフの12時間前〜10日後）
const PUBLISH_WINDOW_BEFORE_MS = 12 * 60 * 60 * 1000;
const PUBLISH_WINDOW_AFTER_MS = 10 * DAY_MS;
// YouTube Data API の取得上限（1ページ50件・1ページあたり1ユニット消費）
// NFL公式は1日に数十本アップするため、3週間分さかのぼるには500件では足りない
const MAX_API_PAGES = 20;
// 一覧が届かない古い試合を個別検索する上限（search は1回100ユニットと高いので絞る）
const MAX_SEARCHES_PER_RUN = 3;

function parseWeekNumber(weekLabel: string | null): number | null {
  if (!weekLabel) return null;
  const m = weekLabel.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

export function isPreseasonGame(game: Pick<HighlightableGame, "seasonPhase" | "weekLabel">): boolean {
  return game.seasonPhase === "preseason" || (game.weekLabel ?? "").toUpperCase().includes("PRE");
}

function gameReferenceTime(game: HighlightableGame): Date | null {
  if (game.kickoffAt) return new Date(game.kickoffAt);
  if (game.gameDate && /^\d{4}-\d{2}-\d{2}$/.test(game.gameDate)) return new Date(`${game.gameDate}T00:00:00Z`);
  return null;
}

function mentionsTeam(lowerTitle: string, teamCode: string): boolean {
  // 都市名はLA（Rams/Chargers）・NY（Jets/Giants）が重複するので、ニックネームだけで判定する
  // 公式タイトルでも "Saint"（Saints）のように末尾の s が抜けることがあるので、s は省略可にする
  const nickname = (TEAM_NICKNAMES[teamCode] ?? teamCode).toLowerCase();
  const stem = nickname.endsWith("s") ? nickname.slice(0, -1) : nickname;
  return new RegExp(`\\b${stem}s?\\b`).test(lowerTitle);
}

/** 動画タイトルと公開日時が、その試合の公式ハイライトとして妥当かを点数で返す（0なら不一致） */
export function scoreHighlightVideo(video: ChannelVideo, game: HighlightableGame): number {
  const lower = video.title.toLowerCase();
  if (!lower.includes("highlight")) return 0;
  if (!mentionsTeam(lower, game.awayTeamCode) || !mentionsTeam(lower, game.homeTeamCode)) return 0;

  const weekNum = parseWeekNumber(game.weekLabel);
  const titleWeek = lower.match(/\b(?:week|wk)\s*(\d{1,2})\b/)?.[1];
  if (titleWeek && weekNum !== null && Number(titleWeek) !== weekNum) return 0;

  const reference = gameReferenceTime(game);
  if (reference) {
    const diff = video.publishedAt.getTime() - reference.getTime();
    if (diff < -PUBLISH_WINDOW_BEFORE_MS || diff > PUBLISH_WINDOW_AFTER_MS) return 0;
  } else if (!titleWeek) {
    // 日付も週表記もない場合は同カードの別試合と区別できないので採用しない
    return 0;
  }

  return lower.includes("game highlights") ? 2 : 1;
}

export function findHighlightVideo(videos: ChannelVideo[], game: HighlightableGame): ChannelVideo | null {
  let best: ChannelVideo | null = null;
  let bestScore = 0;
  for (const video of videos) {
    const score = scoreHighlightVideo(video, game);
    if (score > bestScore || (score === bestScore && score > 0 && best && video.publishedAt < best.publishedAt)) {
      best = video;
      bestScore = score;
    }
  }
  return best;
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`YouTube API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

/** YouTube Data API で NFL公式チャンネルの新しいアップロードから順に、oldest より古くなるまで取得する */
async function fetchUploadsViaApi(apiKey: string, oldest: Date): Promise<ChannelVideo[]> {
  const videos: ChannelVideo[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < MAX_API_PAGES; page++) {
    const params = new URLSearchParams({
      part: "snippet",
      playlistId: NFL_UPLOADS_PLAYLIST_ID,
      maxResults: "50",
      fields: "nextPageToken,items(snippet(title,publishedAt,resourceId/videoId))",
      key: apiKey,
    });
    if (pageToken) params.set("pageToken", pageToken);
    const data = await fetchJson(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
    for (const item of data.items ?? []) {
      const videoId = item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title;
      const publishedAt = new Date(item.snippet?.publishedAt);
      if (videoId && title && !Number.isNaN(publishedAt.getTime())) videos.push({ videoId, title, publishedAt });
    }
    pageToken = data.nextPageToken;
    const last = videos[videos.length - 1];
    if (!pageToken || (last && last.publishedAt < oldest)) break;
  }
  return videos;
}

/** アップロード一覧が届かない古い試合用：NFL公式チャンネル内を試合前後の期間で検索する（1回100ユニット消費） */
async function searchChannelForGame(apiKey: string, game: HighlightableGame): Promise<ChannelVideo[]> {
  const away = TEAM_NICKNAMES[game.awayTeamCode] ?? game.awayTeamCode;
  const home = TEAM_NICKNAMES[game.homeTeamCode] ?? game.homeTeamCode;
  const params = new URLSearchParams({
    part: "snippet",
    channelId: NFL_CHANNEL_ID,
    q: `${away} ${home} highlights`,
    type: "video",
    maxResults: "10",
    fields: "items(id/videoId,snippet(title,publishedAt))",
    key: apiKey,
  });
  const reference = gameReferenceTime(game);
  if (reference) {
    params.set("publishedAfter", new Date(reference.getTime() - PUBLISH_WINDOW_BEFORE_MS).toISOString());
    params.set("publishedBefore", new Date(reference.getTime() + PUBLISH_WINDOW_AFTER_MS).toISOString());
  }
  const data = await fetchJson(`https://www.googleapis.com/youtube/v3/search?${params}`);
  return (data.items ?? []).flatMap((item: any) => {
    const videoId = item.id?.videoId;
    const title = item.snippet?.title?.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    const publishedAt = new Date(item.snippet?.publishedAt);
    return videoId && title && !Number.isNaN(publishedAt.getTime()) ? [{ videoId, title, publishedAt }] : [];
  });
}

/** APIキーがない場合の予備：RSSは最新15件しか返らないので取りこぼしが出やすい */
async function fetchUploadsViaRss(): Promise<ChannelVideo[]> {
  const res = await fetch(NFL_YOUTUBE_RSS_URL, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`YouTube RSS ${res.status}`);
  const xml = await res.text();
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];
  return entries.flatMap((entry) => {
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    const publishedAt = new Date(entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? "");
    return videoId && title && !Number.isNaN(publishedAt.getTime()) ? [{ videoId, title, publishedAt }] : [];
  });
}

export async function refreshOfficialGameHighlights(options?: { force?: boolean; targetWeek?: number }) {
  const force = options?.force ?? false;
  const allGames = (await getOfficialScoreboardGamesForHighlightMatching(force)) as HighlightableGame[];
  const now = Date.now();

  // ハイライト探しはレギュラーシーズン・プレーオフのみ（プレシーズンは対象外）
  let targetGames = allGames.filter((g) => !isPreseasonGame(g));
  if (options?.targetWeek) {
    targetGames = targetGames.filter((g) => parseWeekNumber(g.weekLabel) === options.targetWeek);
  }
  if (!force) {
    targetGames = targetGames.filter((g) => {
      const reference = gameReferenceTime(g);
      return !reference || now - reference.getTime() <= LOOKBACK_DAYS * DAY_MS;
    });
  }

  console.log(`[highlights] 照合対象: ${targetGames.length} 試合（終了済み ${allGames.length} 件から抽出）`);
  if (!targetGames.length) {
    return { candidates: 0, linked: 0, videosScanned: 0, sourceUrl: nflHighlightsSourceUrl };
  }

  const references = targetGames.map(gameReferenceTime).filter((d): d is Date => Boolean(d));
  const oldest = new Date(Math.min(now - LOOKBACK_DAYS * DAY_MS, ...references.map((d) => d.getTime())));
  const apiKey = process.env.YOUTUBE_API_KEY;
  let videos: ChannelVideo[] = [];
  try {
    if (apiKey) {
      videos = await fetchUploadsViaApi(apiKey, oldest);
    } else {
      console.warn("[highlights] YOUTUBE_API_KEY が未設定のため、RSS（最新15件のみ）で照合します");
      videos = await fetchUploadsViaRss();
    }
  } catch (error) {
    console.error("[highlights] 動画一覧の取得に失敗:", error instanceof Error ? error.message : error);
  }
  console.log(`[highlights] 取得した動画: ${videos.length} 件`);

  // 取得した一覧がどこまで過去をカバーしているか（上限に達していなければ全件取れている）
  const reachedPageLimit = apiKey !== undefined && videos.length >= MAX_API_PAGES * 50;
  const coveredSince = reachedPageLimit ? videos[videos.length - 1]?.publishedAt ?? null : null;
  let searchesLeft = apiKey ? MAX_SEARCHES_PER_RUN : 0;

  const links: NflHighlightLink[] = [];
  const usedVideoIds = new Set<string>();
  for (const game of targetGames) {
    const label = `${game.weekLabel ?? "W?"} ${game.awayTeamCode} @ ${game.homeTeamCode}`;
    let match = findHighlightVideo(videos, game);

    // 一覧が試合日までさかのぼれていない古い試合だけ、個別に検索する
    const reference = gameReferenceTime(game);
    const outsideCoverage = coveredSince !== null && (!reference || reference.getTime() < coveredSince.getTime() + DAY_MS);
    if (!match && outsideCoverage && searchesLeft > 0 && apiKey) {
      searchesLeft--;
      try {
        const results = await searchChannelForGame(apiKey, game);
        match = findHighlightVideo(results, game);
        if (!match) {
          console.log(`[highlights] 🔍 ${label} を検索しましたが該当なし。検索結果:`);
          for (const v of results) console.log(`  - ${v.title}（公開: ${v.publishedAt.toISOString()}）`);
        }
      } catch (error) {
        console.error(`[highlights] ${label} の検索に失敗:`, error instanceof Error ? error.message : error);
      }
    }
    if (match) {
      const url = `https://www.youtube.com/watch?v=${match.videoId}`;
      usedVideoIds.add(match.videoId);
      console.log(`[highlights] ✅ ${label} → ${url} (${match.title})`);
      links.push({ externalId: game.externalId, nflHighlightUrl: url, sourceUrl: url });
      continue;
    }
    console.log(`[highlights] ❌ ${label} 未検出`);
    // 個別動画が見つかるまでの暫定リンク（後から watch?v= に置き換わる）
    if (!game.nflHighlightUrl) {
      const awayName = TEAM_NAMES[game.awayTeamCode] ?? game.awayTeamCode;
      const homeName = TEAM_NAMES[game.homeTeamCode] ?? game.homeTeamCode;
      const fallbackSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `NFL ${awayName} vs ${homeName} ${game.weekLabel ?? ""} highlights`.replace(/\s+/g, " ")
      )}`;
      links.push({ externalId: game.externalId, nflHighlightUrl: fallbackSearchUrl, sourceUrl: fallbackSearchUrl });
    }
  }

  // 照合ロジックの改善用：未検出の試合と同じカードなのに紐付かなかったハイライト動画のタイトルを残す
  const unmatchedGames = targetGames.filter((g) => !links.some((l) => l.externalId === g.externalId && l.nflHighlightUrl.includes("watch?v=")));
  const unusedHighlightTitles = videos
    .filter((v) => !usedVideoIds.has(v.videoId) && /highlight/i.test(v.title))
    .filter((v) => {
      const lower = v.title.toLowerCase();
      return unmatchedGames.some((g) => mentionsTeam(lower, g.awayTeamCode) && mentionsTeam(lower, g.homeTeamCode));
    })
    .map((v) => `${v.title}（公開: ${v.publishedAt.toISOString()}）`);
  if (unusedHighlightTitles.length) {
    console.log(`[highlights] 未検出の試合と同じカードで紐付かなかった動画 ${unusedHighlightTitles.length} 件:`);
    for (const title of unusedHighlightTitles) console.log(`  - ${title}`);
  }

  if (links.length > 0) {
    await upsertOfficialScoreboardHighlights(links);
  }

  const linked = links.filter((l) => l.nflHighlightUrl.includes("watch?v=")).length;
  return { candidates: targetGames.length, linked, videosScanned: videos.length, sourceUrl: nflHighlightsSourceUrl };
}
