import { importFieldlineSeasonFromNflverse } from "../server/fieldlineData.ts";

const season = Number(process.argv[2] ?? "2025");
if (!Number.isInteger(season) || season < 2025 || season > 2100) {
  throw new Error("Usage: node --import tsx scripts/import-fieldline-season.mjs <season>");
}

const result = await importFieldlineSeasonFromNflverse(season, process.env.OWNER_OPEN_ID);
console.log(JSON.stringify(result));
