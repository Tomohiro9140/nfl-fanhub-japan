import { refreshOfficialTeamFeed } from "../server/officialFeeds.ts";

const teamCode = process.argv[2]?.toUpperCase() || "BUF";
const count = await refreshOfficialTeamFeed(teamCode);
console.log(JSON.stringify({ teamCode, count }, null, 2));
