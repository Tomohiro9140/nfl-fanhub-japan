# UTC 06 Official Feed Sync — 2026-08-27

## Scope

The sync ran at **2026-08-27 06:08 UTC** against the scheduled UTC 06 group. Only each club's official RSS endpoint and the NFL official injuries page were checked.

| Team | Official RSS | Verified RSS items | NFL official injury additions | Result |
|---|---|---:|---:|---|
| DAL | https://www.dallascowboys.com/rss/news | 3 | 0 | Saved |
| DEN | https://www.denverbroncos.com/rss/news | 3 | 0 | Saved |
| DET | https://www.detroitlions.com/rss/news | 3 | 0 | Saved |
| GB | https://www.packers.com/rss/news | 3 | 0 | Saved |
| HOU | https://www.houstontexans.com/rss/news | 3 | 0 | Saved |
| IND | https://www.colts.com/rss/news | 3 | 0 | Saved; one RSS item classified as injury from its explicit summary text |
| JAX | https://www.jaguars.com/rss/news | 0 | 0 | Not saved; direct verification fetch failed |
| KC | https://www.chiefs.com/rss/news | 3 | 0 | Saved |

## Validation rules

All 21 saved records were extracted from RSS items with a non-empty title, official article URL, description, and parseable published timestamp. Summaries were capped at 280 characters. `external_id` is the SHA-256 hash of `team_code:source_url`; entries use `source_kind=team_official` and are upserted without inference. The NFL official injuries page did not yield an item for this group with a verifiable team assignment, individual URL, and publication timestamp, so it added no records.

## Failure record

| URL | Outcome |
|---|---|
| https://www.jaguars.com/rss/news | Direct RSS verification fetch failed; no JAX item was saved. |

