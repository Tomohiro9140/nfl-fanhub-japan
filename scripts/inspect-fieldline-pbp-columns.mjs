import { asyncBufferFromUrl, parquetMetadataAsync } from "hyparquet";

const season = Number(process.argv[2] ?? "2025");
const url = `https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_${season}.parquet`;
const file = await asyncBufferFromUrl({ url });
const metadata = await parquetMetadataAsync(file);
console.log(metadata.schema.map(column => column.name).filter(name => name !== "schema").join("\n"));
