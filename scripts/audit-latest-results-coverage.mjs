const teamCodes = ["ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE", "DAL", "DEN", "DET", "GB", "HOU", "IND", "JAX", "KC", "LAC", "LAR", "LV", "MIA", "MIN", "NE", "NO", "NYG", "NYJ", "PHI", "PIT", "SF", "SEA", "TB", "TEN", "WAS"];
const response = await fetch("http://localhost:3000/api/trpc/leagueDashboard.summary?input=%7B%22json%22%3Anull%7D");
const payload = await response.json();
const results = payload.result.data.json.results;
const coveredTeams = new Set(results.flatMap((game) => [game.awayTeamCode, game.homeTeamCode]));
const missingTeams = teamCodes.filter((teamCode) => !coveredTeams.has(teamCode));
console.log(JSON.stringify({ resultCount: results.length, coveredCount: coveredTeams.size, missingTeams, results }, null, 2));
if (missingTeams.length) process.exitCode = 1;
