import { asyncBufferFromUrl, parquetReadObjects } from "hyparquet";

const season = Number(process.argv[2] ?? "2025");
const sourceUrl = `https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_${season}.parquet`;
const toNumber = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const rows = await parquetReadObjects({
  file: await asyncBufferFromUrl({ url: sourceUrl }),
  columns: ["season_type", "week", "posteam", "defteam", "two_point_attempt", "passing_yards", "rushing_yards", "yards_gained", "sack"],
});

const teams = new Map();
const ensure = team => teams.get(team) ?? teams.set(team, { legacyFor: 0, currentFor: 0, legacyAgainst: 0, currentAgainst: 0, nonStatYardsFor: 0, nonStatYardsAgainst: 0 }).get(team);
for (const row of rows) {
  if (row.season_type !== "REG" || toNumber(row.week) < 1 || toNumber(row.week) > 18 || toNumber(row.two_point_attempt) === 1) continue;
  const passing = toNumber(row.passing_yards); const rushing = toNumber(row.rushing_yards); const gained = toNumber(row.yards_gained); const sackLoss = toNumber(row.sack) === 1 ? Math.max(0, -gained) : 0;
  const legacy = passing + rushing - sackLoss;
  const unmodeled = gained - legacy;
  if (typeof row.posteam === "string" && row.posteam.length <= 3) { const item = ensure(row.posteam); item.legacyFor += legacy; item.currentFor += gained; item.nonStatYardsFor += unmodeled; }
  if (typeof row.defteam === "string" && row.defteam.length <= 3) { const item = ensure(row.defteam); item.legacyAgainst += legacy; item.currentAgainst += gained; item.nonStatYardsAgainst += unmodeled; }
}
console.log(JSON.stringify(Object.fromEntries([...teams.entries()].sort(([left], [right]) => left.localeCompare(right))), null, 2));
