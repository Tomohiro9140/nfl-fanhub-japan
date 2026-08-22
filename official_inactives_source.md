# NFL Official Inactives Source Notes

- Source: https://www.nfl.com/inactives/
- Confirmed on 2026-08-22 JST: The official page identifies itself as "NFL Inactive Reports" and states that reports will appear when released.
- Integration rule: Only store a team record when the page has a distinct published team section. When the page shows its pre-release message, do not create a report; the UI displays `INACTIVES · NONE REPORTED`.
- Refresh path: The existing official score pulse fetches this source during its active game-day window, keeping the check deterministic and separate from news summaries.
