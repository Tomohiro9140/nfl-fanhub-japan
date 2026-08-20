import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

const pfr = JSON.parse(await readFile(process.argv[2] ?? "/home/ubuntu/pfr_team_yards_2025.json", "utf8"));
const season = Number(process.argv[3] ?? "2025");
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute(
  `SELECT team, SUM(passYardsFor) AS pass_yards_for, SUM(rushYardsFor) AS rush_yards_for, SUM(passYardsAgainst) AS pass_yards_against, SUM(rushYardsAgainst) AS rush_yards_against, SUM(games) AS games FROM team_week_stats WHERE season = ? GROUP BY team ORDER BY team`,
  [season],
);
await connection.end();

const fieldline = Object.fromEntries(rows.map(row => [row.team, Object.fromEntries(Object.entries(row).map(([key, value]) => [key, typeof value === "string" ? Number(value) : value]))]));
const mismatches = [];
for (const [team, expected] of Object.entries(pfr)) {
  const actual = fieldline[team];
  for (const metric of ["pass_yards_for", "rush_yards_for", "pass_yards_against", "rush_yards_against"]) {
    if (!actual || actual[metric] !== expected[metric]) mismatches.push({ team, metric, pfr: expected[metric], fieldline: actual?.[metric] ?? null, difference: actual ? actual[metric] - expected[metric] : null });
  }
}
console.log(JSON.stringify({ season, teamsCompared: Object.keys(pfr).length, mismatches, fieldline }, null, 2));
