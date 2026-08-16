const url = "https://www.nfl.com/schedules/2026/by-team/buffalo-bills";
const response = await fetch(url, { headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" } });
const html = await response.text();
const needle = "Bills at Browns";
const index = html.indexOf(needle);
console.log(JSON.stringify({ status: response.status, length: html.length, index, aroundGame: index >= 0 ? html.slice(Math.max(0, index - 900), index + 1400) : "", isoDates: Array.from(html.matchAll(/2026-08-22[^\"< ]*/g), (match) => match[0]).slice(0, 12) }, null, 2));
