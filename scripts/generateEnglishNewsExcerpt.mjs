import { getOfficialFeedItemById } from "../server/db.ts";
import { getOfficialNewsEnglishExcerpt } from "../server/newsJapaneseSummary.ts";

const itemId = Number(process.argv[2]);
if (!Number.isInteger(itemId) || itemId <= 0) {
  throw new Error("Usage: pnpm tsx scripts/generateEnglishNewsExcerpt.mjs <official_feed_item_id>");
}

const item = await getOfficialFeedItemById(itemId);
if (!item) throw new Error(`Official feed item ${itemId} was not found`);

const result = await getOfficialNewsEnglishExcerpt(item);
console.log(JSON.stringify({ itemId: item.id, excerptLength: result?.excerpt.length ?? 0, truncated: result?.truncated ?? false }));
