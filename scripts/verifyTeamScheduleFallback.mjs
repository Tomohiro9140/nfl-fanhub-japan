import { getOfficialTeamDataSources, parseOfficialSchedulePage, refreshOfficialTeamData } from "../server/officialTeamData.ts";
import { replaceOfficialGamesForTeam } from "../server/db.ts";

const teamCode = process.argv[2] ?? "BUF";
const holdFallback = process.argv.includes("--hold");
const { scheduleUrl } = getOfficialTeamDataSources(teamCode);
const response = await fetch(scheduleUrl, { headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" } });
const html = await response.text();
const teamGames = parseOfficialSchedulePage(html, teamCode, scheduleUrl);
if (teamGames.length === 0) throw new Error("Team official Schedule produced no fallback games");
await replaceOfficialGamesForTeam(teamCode, teamGames);
console.log(JSON.stringify({ fallbackGames: teamGames.length, temporarySource: teamGames[0]?.sourceUrl }, null, 2));
if (holdFallback) process.exit(0);
const restored = await refreshOfficialTeamData(teamCode);
console.log(JSON.stringify({ restoredLeagueGames: restored.leagueGames }, null, 2));
