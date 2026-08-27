# Official Feed Sync Audit — UTC 12 Group (2026-08-27)

## Scope

The sync ran at **2026-08-27 12:10 UTC** for the UTC 12 group: LAC, LAR, LV, MIA, MIN, NE, NO, and NYG. It checked only the eight clubs’ official RSS endpoints and the NFL’s official injuries page.[1][2][3][4][5][6][7][8][9]

| Team | Official RSS | Verified RSS items saved | NFL official injury additions | Result |
|---|---|---:|---:|---|
| LAC | https://www.chargers.com/rss/news | 3 | 0 | Saved |
| LAR | https://www.therams.com/rss/news | 3 | 0 | Saved |
| LV | https://www.raiders.com/rss/news | 3 | 0 | Saved; future-dated item excluded |
| MIA | https://www.miamidolphins.com/rss/news | 3 | 0 | Saved |
| MIN | https://www.vikings.com/rss/news | 0 | 0 | Not saved; current RSS candidates had no usable summary |
| NE | https://www.patriots.com/rss/news | 3 | 0 | Saved |
| NO | https://www.neworleanssaints.com/rss/news | 3 | 0 | Saved |
| NYG | https://www.giants.com/rss/news | 3 | 0 | Saved |

## Validation and storage

All **21** saved records had a non-empty title, summary, official article URL, and parseable non-future publication timestamp. Summaries were limited to 280 characters. Every record uses `source_kind=team_official`; its stable `external_id` is the SHA-256 hash of `team_code:source_url` and was written with an idempotent UPSERT.

Categories follow the site’s existing official-feed rules so that roster transactions remain distinguishable from ordinary news. In this batch, MIA had one transaction, NO had one injury and one transaction, and NYG had three transactions. This preserves the established UI filtering behavior while avoiding false injury classification from incidental words such as `out` in non-availability contexts.

The official NFL injuries page did not provide an item for any target team where team assignment, an individual official URL, and a publication timestamp could all be verified, so **no `nfl_official` item was saved**.[9]

## Failure record

No official RSS endpoint failed direct verification; all eight returned HTTP 200. No item was inferred or retained from a failed or incomplete source.

## References

[1]: https://www.chargers.com/rss/news "Los Angeles Chargers — Official RSS"
[2]: https://www.therams.com/rss/news "Los Angeles Rams — Official RSS"
[3]: https://www.raiders.com/rss/news "Las Vegas Raiders — Official RSS"
[4]: https://www.miamidolphins.com/rss/news "Miami Dolphins — Official RSS"
[5]: https://www.vikings.com/rss/news "Minnesota Vikings — Official RSS"
[6]: https://www.patriots.com/rss/news "New England Patriots — Official RSS"
[7]: https://www.neworleanssaints.com/rss/news "New Orleans Saints — Official RSS"
[8]: https://www.giants.com/rss/news "New York Giants — Official RSS"
[9]: https://www.nfl.com/injuries/ "NFL — Official Injuries"
