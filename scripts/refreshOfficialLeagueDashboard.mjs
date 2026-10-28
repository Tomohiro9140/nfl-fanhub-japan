import { refreshOfficialLeagueDashboard } from "../server/officialLeagueData.ts";

const result = await refreshOfficialLeagueDashboard();
console.log(JSON.stringify(result, null, 2));
// DB接続などが残ってプロセスが終わらず、Actions がタイムアウトするのを防ぐ
process.exit(0);
