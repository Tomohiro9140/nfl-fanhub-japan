// 一時的な調査用：昨シーズンのプレーオフのページ形式を確認する（DBには書き込まない）
import { parseNFLScoresPage } from "../server/officialLeagueData.ts";
import { parseNFLLeagueSchedulePage } from "../server/officialTeamData.ts";

const headers = { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" };
async function get(url) {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    return { status: res.status, finalUrl: res.url, html: await res.text() };
  } catch (e) {
    return { status: "ERR " + e.message, finalUrl: url, html: "" };
  }
}

const weekPages = [
  "https://www.nfl.com/schedules/2025/POST1",
  "https://www.nfl.com/schedules/2025/POST2",
  "https://www.nfl.com/schedules/2025/POST3",
  "https://www.nfl.com/schedules/2025/POST4",
  "https://www.nfl.com/schedules/2025/POST5",
  "https://www.nfl.com/schedules/2025/by-week/wild-card-weekend",
  "https://www.nfl.com/schedules/2025/by-week/super-bowl",
  "https://www.nfl.com/schedules/2025/REG18",
];
for (const url of weekPages) {
  const { status, finalUrl, html } = await get(url);
  console.log(`\n===== ${url} → ${status} ${finalUrl !== url ? `(redirect: ${finalUrl})` : ""} len=${html.length}`);
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1];
  console.log("title:", title);
  const headings = Array.from(html.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)).map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 12);
  console.log("headings:", JSON.stringify(headings));
  const paths = Array.from(new Set(Array.from(html.matchAll(/href="(\/games\/[^"]+)"/gi)).map((m) => m[1]))).slice(0, 8);
  console.log("game paths:", JSON.stringify(paths));
  const labels = Array.from(html.matchAll(/data-analytics="([^"]+)"[^>]*href="[^"]*\/games\//gi)).map((m) => m[1].replace(/&quot;/g, '"')).slice(0, 3);
  console.log("analytics samples:", JSON.stringify(labels));
  const phaseWords = Array.from(new Set((html.match(/\b(WILD\s*CARD|DIVISIONAL|CONFERENCE CHAMPIONSHIP|CONF\.? CHAMP\w*|AFC CHAMPIONSHIP|NFC CHAMPIONSHIP|SUPER BOWL\s*[LXVI]*|PRO BOWL|POSTSEASON|PLAYOFFS?)\b/gi) ?? []).map((w) => w.toUpperCase()))).slice(0, 15);
  console.log("phase words:", JSON.stringify(phaseWords));
  const parsed = parseNFLScoresPage(html, 2025, url);
  console.log("現在のパーサーの結果:", JSON.stringify(parsed.slice(0, 6).map((s) => ({ phase: s.seasonPhase, week: s.weekLabel, game: `${s.awayTeamCode}@${s.homeTeamCode}`, score: `${s.awayScore}-${s.homeScore}`, state: s.gameState, date: s.gameDate }))), `(計${parsed.length}件)`);
}

// チーム別日程ページ（今季のURL形式）でプレーオフの試合がどう載るか：昨季のページ
for (const [code, slug] of [["KC", "kansas-city-chiefs"], ["PHI", "philadelphia-eagles"], ["BUF", "buffalo-bills"], ["DET", "detroit-lions"]]) {
  const url = `https://www.nfl.com/schedules/2025/by-team/${slug}`;
  const { status, html } = await get(url);
  console.log(`\n===== ${url} → ${status} len=${html.length}`);
  const cards = Array.from(html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)).map((m) => m[0]).filter((c) => /wild\s*card|divisional|championship|super\s*bowl|post/i.test(c)).slice(0, 2);
  for (const c of cards) console.log("postseason card:", c.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300));
  const games = parseNFLLeagueSchedulePage(html, code, url);
  console.log("現在のパーサーの結果:", JSON.stringify(games.slice(-4).map((g) => ({ phase: g.seasonPhase, week: g.weekLabel, opp: g.opponentCode, kickoff: g.kickoffAt }))), `(計${games.length}件)`);
}
process.exit(0);
