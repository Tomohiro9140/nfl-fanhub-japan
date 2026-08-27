# ATLAS Roster Reconciliation Audit — Kayshon Boutte (2026-08-27)

## ATLAS Roster Reconciliation Audit — 2026-08-27

Houston’s official transaction release dated **2026-08-25** states that the Texans acquired wide receiver **Kayshon Boutte** in a trade with the New England Patriots. The Texans’ official roster lists Boutte as WR #88.[1] [2]

ATLAS had displayed New England because its season roster source still listed Boutte as `NE`. The new reconciliation preserves that source for stable IDs and historical data, while a fresh club-published roster snapshot takes priority for a player’s current team, jersey number, and position. A player is removed from the current-roster result only when all 32 club snapshots are fresh; an unavailable official source therefore cannot create a false release.

The development ATLAS search for `Kayshon Boutte` now returns **CURRENT ROSTER · HOU · #88**, matching the Texans’ official roster.

## Career and season-stat update rules

The career endpoint now replaces only the latest season’s team with the player’s current team from the fresh club roster. The remaining seasons are retained as historical records, so Boutte’s 2026 career row is HOU while his earlier Patriots seasons remain unchanged. The profile and career caches both expire after 20 minutes; official roster data is accepted only when its club snapshot is no more than 30 hours old.

ATLAS continues to use the public nflverse data releases for player master data, historical roster records, and season statistics. nflverse publishes roster data daily at 07:00 UTC, and computes player statistics overnight after each game day, with additional in-game update points during the season.[3] ATLAS rechecks player statistics at most every 12 hours, so newly published nflverse stats normally appear on the next ATLAS refresh without a manual re-import.

## Free-agent example

**Bobby Wagner (LB)** is a current verified example for this review. A Dallas Cowboys official article dated 2026-08-18 described Wagner as a "still-unsigned free agent."[4] Free-agent status should remain a derived display state: ATLAS does not infer it from the absence of a single club snapshot, and only marks a player as no longer on a current roster when fresh snapshots for all 32 clubs are available.

## References

[1]: https://www.houstontexans.com/news/houston-texans-transactions-8-25-2026 "Houston Texans Transactions (8-25-2026)"
[2]: https://www.houstontexans.com/team/players-roster/kayshon-boutte/ "Kayshon Boutte — Houston Texans roster"
[3]: https://nflreadr.nflverse.com/articles/nflverse_data_schedule.html "nflverse Data Update and Availability Schedule"
[4]: https://www.dallascowboys.com/news/mailbag-why-von-miller-and-not-bobby-wagner "Mailbag: Why Von Miller and not Bobby Wagner?"
