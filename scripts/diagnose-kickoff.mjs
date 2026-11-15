// 一時的な調査用：キックオフ時刻の取得元を確認する（DBには書き込まない）
import { parseNFLLeagueSchedulePage } from "../server/officialTeamData.ts";
const headers = { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" };
const get = async (url) => { try { const r = await fetch(url, { headers, signal: AbortSignal.timeout(20000) }); return { status: r.status, body: await r.text() }; } catch (e) { return { status: "ERR " + e.message, body: "" }; } };

for (const [code, slug] of [["NE", "new-england-patriots"], ["DAL", "dallas-cowboys"], ["DET", "detroit-lions"]]) {
  const url = `https://www.nfl.com/schedules/2026/by-team/${slug}`;
  const { status, body } = await get(url);
  console.log(`\n===== ${url} → ${status} len=${body.length}`);
  const cards = Array.from(body.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)).map((m) => m[0]).filter((c) => !c.includes("score-strip") && !c.includes("nfl-c-header") && /Week\s+\d+|\b(?:Sep|Oct|Nov|Dec|Jan)/i.test(c.replace(/<[^>]+>/g, " ")));
  const withAttr = cards.filter((c) => /(?:datetime|data-gametime|data-start-date|data-iso-time)="/i.test(c)).length;
  console.log(`cards=${cards.length} 時刻属性あり=${withAttr}`);
  for (const c of cards.slice(8, 13)) {
    console.log("--- text:", c.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 260));
    console.log("    attrs:", JSON.stringify(Array.from(c.matchAll(/\b(datetime|data-[a-z-]*(?:time|date)[a-z-]*)="([^"]{0,60})"/gi)).map((m) => `${m[1]}=${m[2]}`).slice(0, 8)));
    console.log("    times:", JSON.stringify(c.match(/\b\d{1,2}:\d{2}\s*(?:AM|PM)?\s*(?:ET|EST|EDT|UTC|GMT)?\b|\d{4}-\d{2}-\d{2}T[\d:.]+Z?/gi)?.slice(0, 6)));
  }
  if (code === "NE") { const i = body.search(/Lions/); console.log("RAW around Lions card:\n", cards.find((c) => /Lions/.test(c))?.slice(0, 3000)); }
  const games = parseNFLLeagueSchedulePage(body, code, url);
  console.log("parsed:", JSON.stringify(games.map((g) => `${g.weekLabel}:${g.opponentCode}:${g.kickoffAt.toISOString()}`)));
}

for (const q of ["seasontype=2&week=10&dates=2026", "seasontype=2&week=12&dates=2026", "seasontype=2&week=16&dates=2026"]) {
  const { status, body } = await get(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?${q}`);
  console.log(`\n===== ESPN ${q} → ${status}`);
  try { const d = JSON.parse(body); console.log(JSON.stringify({ season: d.season, week: d.week, events: (d.events ?? []).map((e) => `${e.shortName} ${e.date} tbd=${e.competitions?.[0]?.timeValid === false} ${e.status?.type?.name}`) })); } catch { console.log(body.slice(0, 300)); }
}
process.exit(0);
