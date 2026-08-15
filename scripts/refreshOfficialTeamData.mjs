import { refreshOfficialTeamData } from "../server/officialTeamData.ts";

const teamCodes = process.argv.slice(2).map((value) => value.toUpperCase());

if (!teamCodes.length) {
  throw new Error("Usage: pnpm tsx scripts/refreshOfficialTeamData.mjs <TEAM_CODE> [...TEAM_CODE]");
}

for (const teamCode of teamCodes) {
  const result = await refreshOfficialTeamData(teamCode);
  console.log(JSON.stringify({ teamCode, ...result }, null, 2));
}
