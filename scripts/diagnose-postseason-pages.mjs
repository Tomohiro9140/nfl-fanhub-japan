// 一時的な調査用：昨シーズンのプレーオフのページ形式を確認する（DBには書き込まない）
const headers = { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" };
async function get(url) {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    return { status: res.status, finalUrl: res.url, html: await res.text() };
  } catch (e) {
    return { status: "ERR " + e.message, finalUrl: url, html: "" };
  }
}

const first = await get("https://www.nfl.com/schedules/2025/by-week/wild-card-weekend");
const weekLinks = Array.from(new Set(Array.from(first.html.matchAll(/href="([^"]*\/schedules\/2025\/by-week\/[^"]+)"/gi)).map((m) => m[1])));
console.log("by-week links:", JSON.stringify(weekLinks));

const pages = Array.from(new Set(["https://www.nfl.com/schedules/2025/by-week/wild-card-weekend", ...weekLinks.filter((l) => !/week-\d+|preseason|hall-of-fame/i.test(l)).map((l) => l.startsWith("http") ? l : `https://www.nfl.com${l}`)]));
for (const url of pages) {
  const { status, finalUrl, html } = await get(url);
  console.log(`\n===== ${url} → ${status} ${finalUrl !== url ? `(redirect: ${finalUrl})` : ""}`);
  console.log("title:", html.match(/<title>([^<]*)<\/title>/i)?.[1]);
  const all = Array.from(html.matchAll(/data-analytics="([^"]+)"[^>]*href="([^"]*\/games\/[^"]+)"/gi)).map((m) => ({ a: m[1].replace(/&quot;/g, '"'), path: m[2] }));
  const nonStrip = all.filter((x) => !/2026-reg/.test(x.path));
  console.log("非スコアストリップの試合リンク:", nonStrip.length);
  for (const x of nonStrip.slice(0, 4)) console.log("  ", x.path, "|", x.a.slice(0, 220));
  const otherPaths = Array.from(new Set(Array.from(html.matchAll(/href="(\/games\/[^"]+)"/gi)).map((m) => m[1]).filter((p) => !/2026-reg/.test(p)))).slice(0, 8);
  console.log("game paths(非2026):", JSON.stringify(otherPaths));
  // ページ上の週見出しやラウンド名の周辺テキスト
  const around = html.match(/[^<>]{0,40}(WILD\s*CARD|DIVISIONAL|CONFERENCE|CHAMPIONSHIP|SUPER BOWL)[^<>]{0,40}/gi)?.slice(0, 8);
  console.log("ラウンド名周辺:", JSON.stringify(around));
  const pre = html.match(/[^<>]{0,30}PRESEASON\s+WEEK\s+\d+[^<>]{0,30}/i)?.[0];
  console.log("PRESEASON WEEK を含む箇所:", JSON.stringify(pre));
}
process.exit(0);
