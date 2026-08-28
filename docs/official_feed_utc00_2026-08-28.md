# Official Feed Sync Audit — UTC 00 Group (2026-08-28)

## Scope

The sync ran at **2026-08-28 00:06:19 UTC** for the UTC 00 group: ARI, ATL, BAL, BUF, CAR, CHI, CIN, and CLE. It used only the eight clubs’ official RSS endpoints and the NFL’s official injuries page.[1][2][3][4][5][6][7][8][9]

| Team | Official RSS | Verified RSS items saved | NFL official injury additions | Result |
|---|---|---:|---:|---|
| ARI | https://www.azcardinals.com/rss/news | 3 | 0 | Saved |
| ATL | https://www.atlantafalcons.com/rss/news | 3 | 0 | Saved |
| BAL | https://www.baltimoreravens.com/rss/news | 3 | 0 | Saved |
| BUF | https://www.buffalobills.com/rss/news | 3 | 0 | Saved |
| CAR | https://www.panthers.com/rss/news | 3 | 0 | Saved |
| CHI | https://www.chicagobears.com/rss/news | 3 | 0 | Saved |
| CIN | https://www.bengals.com/rss/news | 3 | 0 | Saved |
| CLE | https://www.clevelandbrowns.com/rss/news | 3 | 0 | Saved |

## Validation and storage

All **24** records had a non-empty title, summary, official article URL, and parseable non-future publication timestamp. Summaries were capped at 280 characters. Every saved item uses `source_kind=team_official` and the stable `external_id` SHA-256 hash of `team_code:source_url`; the cache write was idempotent via UPSERT.

The existing feed classification rules were retained for compatibility with the Status Radar UI. This batch included four explicit roster-move articles recorded as `transaction`; remaining items are `news`. No article was classified as an injury solely because it contained an incidental availability word.

The official NFL injuries page did not expose an item for any target team where team assignment, individual official URL, and publication timestamp could all be verified. Therefore **no `nfl_official` item was saved**.[9]

## Failure record

No RSS endpoint failed final direct verification. ATL and CHI initially returned HTTP 403 from a separate network path, but both returned HTTP 200 when revalidated through the same controlled request path used for final candidate validation. No item was inferred from an inaccessible source.

## References

[1]: https://www.azcardinals.com/rss/news "Arizona Cardinals — Official RSS"
[2]: https://www.atlantafalcons.com/rss/news "Atlanta Falcons — Official RSS"
[3]: https://www.baltimoreravens.com/rss/news "Baltimore Ravens — Official RSS"
[4]: https://www.buffalobills.com/rss/news "Buffalo Bills — Official RSS"
[5]: https://www.panthers.com/rss/news "Carolina Panthers — Official RSS"
[6]: https://www.chicagobears.com/rss/news "Chicago Bears — Official RSS"
[7]: https://www.bengals.com/rss/news "Cincinnati Bengals — Official RSS"
[8]: https://www.clevelandbrowns.com/rss/news "Cleveland Browns — Official RSS"
[9]: https://www.nfl.com/injuries/ "NFL — Official Injuries"
