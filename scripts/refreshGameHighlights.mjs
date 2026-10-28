import { refreshOfficialGameHighlights } from "../server/nflGameHighlights.ts";

// 使い方: pnpm tsx scripts/refreshGameHighlights.mjs [--force] [--week=7]
const force = process.argv.includes("--force");
const weekArg = process.argv.find((arg) => arg.startsWith("--week="));
const targetWeek = weekArg ? Number(weekArg.split("=")[1]) : undefined;

const result = await refreshOfficialGameHighlights({ force, targetWeek });
console.log(JSON.stringify(result, null, 2));
// DB接続が残ってプロセスが終わらないのを防ぐ
process.exit(0);
