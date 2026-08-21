import { parseNFLScoresPage } from "../server/officialLeagueData.ts";

const url = process.argv[2] ?? "https://www.nfl.com/schedules/2026/by-week/preseason-week-1";
const response = await fetch(url, {
  headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" },
});
const html = await response.text();
const scores = parseNFLScoresPage(html, 2026, url);
console.log(JSON.stringify({ status: response.status, htmlLength: html.length, scores: scores.length, games: scores.map((score) => ({ weekLabel: score.weekLabel, awayTeamCode: score.awayTeamCode, homeTeamCode: score.homeTeamCode, awayScore: score.awayScore, homeScore: score.homeScore })) }, null, 2));
