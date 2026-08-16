import { refreshOfficialLeagueDashboard } from "../server/officialLeagueData.ts";

const result = await refreshOfficialLeagueDashboard();
console.log(JSON.stringify(result, null, 2));
