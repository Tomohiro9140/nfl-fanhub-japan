# Official Feed Sync Audit — UTC 18 Group (2026-08-27)

## Scope

This manual run was performed at **2026-08-27 18:08:04 UTC** for the UTC 18 group: NYJ, PHI, PIT, SF, SEA, TB, TEN, and WAS. Only each club's official RSS endpoint and the official NFL injuries page were checked.[1][2][3][4][5][6][7][8][9]

| Team | Official RSS | Verified items | Latest verified publication (UTC) | Result |
|---|---|---:|---|---|
| NYJ | [RSS][1] | 3 | 2026-08-27 16:00:00 | Saved |
| PHI | [RSS][2] | 3 | 2026-08-27 14:00:00 | Saved after alternate text retrieval confirmed the direct request's timeout candidates |
| PIT | [RSS][3] | 3 | 2026-08-27 10:05:00 | Saved |
| SF | [RSS][4] | 3 | 2026-08-27 15:53:04 | Saved |
| SEA | [RSS][5] | 3 | 2026-08-27 01:41:48 | Saved |
| TB | [RSS][6] | 3 | 2026-08-27 18:00:00 | Saved |
| TEN | [RSS][7] | 3 | 2026-08-26 16:30:32 | Saved |
| WAS | [RSS][8] | 3 | 2026-06-18 16:01:11 | Saved; the RSS itself had no newer validated item |

## Validation and storage

All **24** saved records had a title, non-empty summary (no more than 280 characters), official article URL, and parseable publication timestamp that was not in the future. Each uses `source_kind=team_official` and a stable SHA-256 `external_id` derived from `team_code:source_url`; the UPSERT updates title, summary, category, publication time, and fetch time without duplicating rows.

The existing feed classifier was retained to prevent false injury classification from incidental uses of `out` and to keep roster moves available to the established Status Radar behavior. The PHI signing/waiving item is therefore classified as `transaction`; the other 23 records are `news`.

## NFL official injuries page

The NFL injuries page contained target-team headlines for SF, NYJ/TEN, and WAS, but their individual article pages did not expose a verifiable publication timestamp during this run. No target-team article satisfied the simultaneous requirements for team attribution, individual official URL, and publication timestamp; therefore **no `nfl_official` record was saved**.[9]

## Failure record

No official RSS URL remained failed at final validation. The initial direct request to PHI timed out, but the same official RSS endpoint was successfully verified through a separate text retrieval path before storing its three records.

## References

[1]: https://www.newyorkjets.com/rss/news "New York Jets — Official RSS"
[2]: https://www.philadelphiaeagles.com/rss/news "Philadelphia Eagles — Official RSS"
[3]: https://www.steelers.com/rss/news "Pittsburgh Steelers — Official RSS"
[4]: https://www.49ers.com/rss/news "San Francisco 49ers — Official RSS"
[5]: https://www.seahawks.com/rss/news "Seattle Seahawks — Official RSS"
[6]: https://www.buccaneers.com/rss/news "Tampa Bay Buccaneers — Official RSS"
[7]: https://www.titansonline.com/rss/news "Tennessee Titans — Official RSS"
[8]: https://www.commanders.com/rss/news "Washington Commanders — Official RSS"
[9]: https://www.nfl.com/injuries/ "NFL — Official Injuries"
