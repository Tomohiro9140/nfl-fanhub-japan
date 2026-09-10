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

export const nflHighlightsSourceUrl = "https://www.nfl.com/videos/channel/game-highlights-vc";
const NFL_YOUTUBE_RSS_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=UCDVYQ4Zhbm3S2dlz7P1GBDg";

function teamVideosSlug(teamCode: string) {
  return TEAM_NAMES[teamCode]?.toLowerCase().split(" ").at(-1);
}

function weekNumber(weekLabel: string | null) {
  return weekLabel?.match(/(\d+)/)?.[1];
}

export function nflHighlightUrlForGame(game: HighlightableGame) {
  const away = teamVideosSlug(game.awayTeamCode);
  const home = teamVideosSlug(game.homeTeamCode);
  const week = weekNumber(game.weekLabel);
  if (!away || !home || !week || game.seasonPhase === "postseason") return null;
  const phase = game.seasonPhase === "preseason" ? "preseason" : "week";
  return `https://www.nfl.com/videos/${away}-vs-${home}-highlights-${phase}-week-${week}`;
}

export function nflHighlightUrlCandidatesForGame(game: HighlightableGame) {
  const primary = nflHighlightUrlForGame(game);
  const away = teamVideosSlug(game.awayTeamCode);
  const home = teamVideosSlug(game.homeTeamCode);
  const week = weekNumber(game.weekLabel);
  if (!primary || !away || !home || !week || game.seasonPhase !== "preseason") return primary ? [primary] : [];
  return [primary, `https://www.nfl.com/videos/${away}-vs-${home}-preseason-week-${week}`];
}

export function isVerifiedNflHighlightPage(html: string, game: HighlightableGame) {
  const away = TEAM_NAMES[game.awayTeamCode];
  const home = TEAM_NAMES[game.homeTeamCode];
  const week = weekNumber(game.weekLabel);
  if (!away || !home || !week) return false;
  const phase = game.seasonPhase === "preseason" ? "Preseason" : "Week";
  return html.includes(away) && html.includes(home) && new RegExp(`${phase}\\s+Week\\s+${week}`, "i").test(html) && /highlights/i.test(html);
}

async function fetchOfficialHighlightPage(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" } });
    if (!response.ok) return null;
    return response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchYouTubeHighlightsFeed(): Promise<Array<{ title: string; url: string }>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(NFL_YOUTUBE_RSS_URL, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];
    return entries.map((entry) => {
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
      const url = entry.match(/<link[^>]*href="([^"]*)"/)?.[1] ?? "";
      return { title, url };
    }).filter((item) => item.title && item.url);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchNflDotComHighlightsList(): Promise<string[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(nflHighlightsSourceUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const matches = Array.from(html.matchAll(/href="(\/videos\/[^"]*highlights[^"]*)"/gi)).map((m) => m[1]);
    return matches;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function matchYouTubeHighlight(videos: Array<{ title: string; url: string }>, game: HighlightableGame): string | null {
  const awaySlug = teamVideosSlug(game.awayTeamCode);
  const homeSlug = teamVideosSlug(game.homeTeamCode);
  if (!awaySlug || !homeSlug) return null;

  for (const video of videos) {
    const lower = video.title.toLowerCase();
    if (!lower.includes("highlights")) continue;
    if (lower.includes(awaySlug) && lower.includes(homeSlug)) {
      return video.url;
    }
  }
  return null;
}

function matchNflDotComHighlight(hrefs: string[], game: HighlightableGame): string | null {
  const awaySlug = teamVideosSlug(game.awayTeamCode);
  const homeSlug = teamVideosSlug(game.homeTeamCode);
  if (!awaySlug || !homeSlug) return null;

  for (const href of hrefs) {
    const lower = href.toLowerCase();
    if (lower.includes(awaySlug) && lower.includes(homeSlug)) {
      return href.startsWith("http") ? href : `https://www.nfl.com${href}`;
    }
  }
  return null;
}

/** Updates final games: checks YouTube first; falls back to NFL.com; upgrades to YouTube if posted later. */
export async function refreshOfficialGameHighlights() {
  const games = await getOfficialScoreboardGamesForHighlightMatching();
  if (!games.length) return { candidates: 0, linked: 0, sourceUrl: nflHighlightsSourceUrl };

  const [ytVideos, nflHrefs] = await Promise.all([
    fetchYouTubeHighlightsFeed(),
    fetchNflDotComHighlightsList(),
  ]);

  const links: NflHighlightLink[] = [];

  for (const game of games) {
    const isCurrentlyYouTube = Boolean(game.nflHighlightUrl && game.nflHighlightUrl.includes("youtube.com"));
    if (isCurrentlyYouTube) continue;

    // 1. YouTube 公式（最優先）
    const ytUrl = matchYouTubeHighlight(ytVideos, game);
    if (ytUrl) {
      links.push({
        externalId: game.externalId,
        nflHighlightUrl: ytUrl,
        sourceUrl: ytUrl,
      });
      continue;
    }

    // すでにNFL公式URLが入っている場合はYouTubeの投稿待ち
    if (game.nflHighlightUrl) continue;

    // 2. NFL.com の動画一覧ページからの抽出（第2優先）
    const nflUrl = matchNflDotComHighlight(nflHrefs, game);
    if (nflUrl) {
      links.push({
        externalId: game.externalId,
        nflHighlightUrl: nflUrl,
        sourceUrl: nflHighlightsSourceUrl,
      });
      continue;
    }

    // 3. 従来のURL推測フォールバック
    for (const candidateUrl of nflHighlightUrlCandidatesForGame(game)) {
      const html = await fetchOfficialHighlightPage(candidateUrl);
      if (html && isVerifiedNflHighlightPage(html, game)) {
        links.push({
          externalId: game.externalId,
          nflHighlightUrl: candidateUrl,
          sourceUrl: nflHighlightsSourceUrl,
        });
        break;
      }
    }
  }

  await upsertOfficialScoreboardHighlights(links);
  return { candidates: games.length, linked: links.length, sourceUrl: nflHighlightsSourceUrl };
}
