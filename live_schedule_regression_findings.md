# Live Schedule Regression Findings

On 2026-08-22 JST, the official scoreboard cache recorded GB@DEN, NYJ@PIT, and CAR@JAX as `INGAME` with `PRESEASON WEEK 2`. Some of these teams no longer had their Week 2 row in `official_games`; the subsequent schedule refresh had retained only later fixtures such as PRESEASON WEEK 3. The replacement function deletes all existing team rows before inserting the partial parser result, which removes the live match from Schedule Desk and leaves GAME TICKET with only the later game to choose.

The NFL Game Center for GB@DEN confirmed that the game was live, but the server-side cached scoreboard did not have a reliable kickoff timestamp. The recovery must therefore preserve same-JST-day schedule rows and use live scoreboard records as a selection fallback without inventing a kickoff time.

## Post-fix verification

The GB preview with spoiler prevention enabled now displayed `GAME TICKET / PRESEASON WEEK 2`, `OFFICIAL SCOREBOARD`, `LIVE NOW`, and `GAME STATUS LIVE` without exposing the score. Its Schedule Desk contained `GB @ DEN · LIVE · OFFICIAL SCOREBOARD · PRE · WEEK 2`. This verifies that a live score can restore both the ticket and calendar card even when the original schedule row had already been removed.

The live fallback card uses the official score update timestamp only for ordering while clearly presenting `LIVE · OFFICIAL SCOREBOARD`, rather than displaying it as an invented kickoff time.

In the ALL GAMES tab, the current 8/22 JST group contained CAR@JAX, GB@DEN, and NYJ@PIT. GB@DEN and NYJ@PIT were preserved as `LIVE · OFFICIAL SCOREBOARD · PRE · WEEK 2`, while CAR@JAX retained its exact official kickoff. The GB GAME TICKET also showed `LIVE GAME`, `PRESEASON WEEK 2`, and spoiler-safe score suppression.

The 390px mobile verification retained the GB@DEN `LIVE · OFFICIAL SCOREBOARD · PRE · WEEK 2` card in My Team Schedule and the `LIVE GAME` ticket. The PC ALL GAMES verification contained all three current matchups. Automated coverage now checks the six participating teams' Week 2 selection, all three ALL GAMES cards, and the compact two-column schedule DOM.

The mobile execution DOM confirmed `GAME TICKET / PRESEASON WEEK 2`, `LIVE GAME`, `OFFICIAL SCOREBOARD`, `LIVE NOW`, and `GB @ DEN · LIVE · OFFICIAL SCOREBOARD · PRE · WEEK 2` in ALL GAMES. On the subsequent official score pulse, NYJ@PIT changed to `FINAL`; its removal from the live list was therefore correct, while GB@DEN and CAR@JAX remained as current-day cards.

After the final-card retention update, the NYJ Game Ticket rendered `OFFICIAL GAME DATE 8/22(土)` from the official 2026-08-21T23:00:00Z kickoff, and retained `INACTIVES · NONE REPORTED` after FINAL. In ALL GAMES on 8/22 JST, NYJ@PIT and CAR@JAX remained alongside live GB@DEN. The completed-score audit found no 2026 FINAL rows without an official kickoff timestamp.

The 390px mobile execution DOM contained `LAST GAME`, `OFFICIAL GAME DATE`, `8/22(土)`, `FINAL`, `INACTIVES · NONE REPORTED`, and `ALL TEAMS · ROLLING 7-DAY WINDOW`. Its 8/22 JST group retained NYJ@PIT at 08:00, CAR@JAX at 08:30, and GB@DEN, all labeled PRE · WEEK 2.
