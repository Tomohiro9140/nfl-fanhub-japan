import { getOfficialFeedItemById, saveOfficialFeedJapaneseSummary } from "../server/db.ts";
import { generateOfficialNewsJapaneseSummary } from "../server/newsJapaneseSummary.ts";

const itemId = Number(process.argv[2]);

if (!Number.isInteger(itemId) || itemId <= 0) {
  throw new Error("Usage: pnpm tsx scripts/generateJapaneseNewsSummary.mjs <official_feed_item_id>");
}

const item = await getOfficialFeedItemById(itemId);
if (!item) throw new Error(`Official feed item ${itemId} was not found`);

const summary = await generateOfficialNewsJapaneseSummary(item);
if (summary) {
  await saveOfficialFeedJapaneseSummary(item.id, summary);
}

console.log(JSON.stringify({ itemId: item.id, generated: Boolean(summary), summaryLength: summary?.length ?? 0 }));
