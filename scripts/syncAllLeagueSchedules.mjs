import { refreshOfficialTeamData } from "../server/officialTeamData.ts";

const teamCodes = ["ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE", "DAL", "DEN", "DET", "GB", "HOU", "IND", "JAX", "KC", "LAC", "LAR", "LV", "MIA", "MIN", "NE", "NO", "NYG", "NYJ", "PHI", "PIT", "SF", "SEA", "TB", "TEN", "WAS"];
const concurrency = 4;
const results = [];

for (let index = 0; index < teamCodes.length; index += concurrency) {
  const batch = teamCodes.slice(index, index + concurrency);
  const batchResults = await Promise.all(batch.map(async (teamCode) => ({ teamCode, ...(await refreshOfficialTeamData(teamCode)) })));
  results.push(...batchResults);
}

console.log(JSON.stringify({ processed: results.length, leagueScheduleTeams: results.filter((result) => result.leagueGames > 0).length, games: results.reduce((sum, result) => sum + result.games, 0), roster: results.reduce((sum, result) => sum + result.roster, 0), errors: results.filter((result) => result.errors > 0) }, null, 2));
