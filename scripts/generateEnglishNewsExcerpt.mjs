import { getOfficialFeedItemById, saveOfficialFeedEnglishSummary } from "../server/db.ts";
import { generateOfficialNewsEnglishSummary } from "../server/newsJapaneseSummary.ts";

const itemId = Number(process.argv[2]);
if (!Number.isInteger(itemId) || itemId <= 0) {
  throw new Error("Usage: pnpm tsx scripts/generateEnglishNewsExcerpt.mjs <official_feed_item_id>");
}

const item = await getOfficialFeedItemById(itemId);
if (!item) throw new Error(`Official feed item ${itemId} was not found`);

const summary = await generateOfficialNewsEnglishSummary(item);
if (summary) await saveOfficialFeedEnglishSummary(item.id, summary);
console.log(JSON.stringify({ itemId: item.id, summaryLength: summary?.length ?? 0, saved: Boolean(summary), summary }));
