import { refreshPftAvailabilityInsights } from "../server/pftAvailability.ts";

const seedUrl = process.argv[2];
const result = await refreshPftAvailabilityInsights(seedUrl ? [seedUrl] : []);
console.log(JSON.stringify(result, null, 2));
// DB接続などが残ってプロセスが終わらず、Actions がタイムアウトするのを防ぐ
process.exit(0);
