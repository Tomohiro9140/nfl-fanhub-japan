import { getOfficialTeamDataSources, parseNFLLeagueSchedulePage } from "../server/officialTeamData.ts";
import { replaceOfficialGamesForTeam } from "../server/db.ts";

const teamCodes = ["ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE", "DAL", "DEN", "DET", "GB", "HOU", "IND", "JAX", "KC", "LAC", "LAR", "LV", "MIA", "MIN", "NE", "NO", "NYG", "NYJ", "PHI", "PIT", "SF", "SEA", "TB", "TEN", "WAS"];
const concurrency = 8;
const results = [];

async function refreshLeagueScheduleOnly(teamCode) {
  const { leagueScheduleUrl } = getOfficialTeamDataSources(teamCode);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(leagueScheduleUrl, { signal: controller.signal, headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" } });
    if (!response.ok) throw new Error(`League schedule request failed: ${response.status}`);
    const games = parseNFLLeagueSchedulePage(await response.text(), teamCode, leagueScheduleUrl);
    if (games.length) await replaceOfficialGamesForTeam(teamCode, games);
    return { teamCode, games: games.length, errors: 0 };
  } catch {
    return { teamCode, games: 0, errors: 1 };
  } finally {
    clearTimeout(timeout);
  }
}

for (let index = 0; index < teamCodes.length; index += concurrency) {
  const batch = teamCodes.slice(index, index + concurrency);
  const batchResults = await Promise.all(batch.map(refreshLeagueScheduleOnly));
  results.push(...batchResults);
}

console.log(JSON.stringify({ processed: results.length, leagueScheduleTeams: results.filter((result) => result.games > 0).length, games: results.reduce((sum, result) => sum + result.games, 0), errors: results.filter((result) => result.errors > 0) }, null, 2));
