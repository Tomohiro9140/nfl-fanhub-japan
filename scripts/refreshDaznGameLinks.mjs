import { refreshDaznGameLinks } from "../server/daznGameLinks.ts";

const result = await refreshDaznGameLinks();
console.log(JSON.stringify(result, null, 2));
