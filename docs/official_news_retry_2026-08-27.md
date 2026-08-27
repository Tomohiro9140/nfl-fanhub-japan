# Official LATEST NEWS Retry Audit — 2026-08-27

## Diagnosis

At **2026-08-27 23:34 UTC**, all 32 teams had at least one `team_official` feed record, but 23 teams had a latest RSS fetch older than the 18:00 UTC cycle. The retry scope therefore included the seven non-BUF teams from the UTC 00 group, all eight UTC 06 teams, and all eight UTC 12 teams. BUF had already refreshed at 23:31 UTC; the UTC 18 group had completed at 18:13 UTC and was still within its normal six-hour rotation.

## Retry result

The team-official RSS retry ran from **23:35:19 to 23:36:42 UTC**, using the established official-RSS parser and idempotent UPSERT path only. Every retry succeeded; no source returned a final HTTP, parsing, or empty-feed failure.

| Group | Retried teams | Result | Parsed official RSS items |
|---|---|---|---:|
| UTC 00 | ARI, ATL, BAL, CAR, CHI, CIN, CLE | 7 / 7 succeeded | 164 |
| UTC 06 | DAL, DEN, DET, GB, HOU, IND, JAX, KC | 8 / 8 succeeded | 184 |
| UTC 12 | LAC, LAR, LV, MIA, MIN, NE, NO, NYG | 8 / 8 succeeded | 141 |
| **Total** | **23 teams** | **23 / 23 succeeded** | **489** |

The parser processed between 5 and 24 current RSS items per team, then used stable `team_code:source_url` identifiers to update or insert cache rows without duplication. A subsequent database check confirmed that all **32 teams have at least five `news`-category `team_official` records**, and no team has zero normal news records.

## Failure-handling policy

No persistent RSS failure remains after this run. If a future official RSS request fails, the application preserves the last verified cache and uses the existing 15-minute empty-cache retry or background top-up; it must not invent content or substitute non-official publishers.

For a repeated failure, the safe operational sequence is to retry the official RSS in the next rotation, record the exact response or timeout, and retain the last verified items. The project’s currently agreed policy does **not** scrape team news HTML as a fallback. If a specific club's official RSS becomes persistently unavailable, the user can explicitly approve a narrowly scoped fallback to that club's own official news page; it would need URL, publication-time, and summary validation before any cache write.
