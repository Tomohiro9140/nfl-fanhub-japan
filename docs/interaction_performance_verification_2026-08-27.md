# Interaction & performance verification — 2026-08-27

## Viewport check

| Viewport | Result |
| --- | --- |
| Desktop 1280 × 720 | Header, Game Ticket, spoiler control, Latest Results, and Latest News retained their existing hierarchy and spacing. |
| Mobile 390 × 844 | The compact header, Game Ticket, spoiler control, Latest Results, and Latest News remained within the viewport without horizontal overflow. |

## Behavior under verification

- Game Stats team-comparison values use a start-aligned grid item so an away-team winning-value background is fitted to the number rather than the full grid column.
- A favorite-team change resets spoiler protection to ON before the destination team's data is shown.
- League summary starts after the first idle opportunity; the larger calendar still waits until 900px before the League Desk viewport, reducing scroll-time loading without competing with the first paint.
- ATLAS, FIELDLINE, and Game Stats code are preloaded only after navigation or spoiler-toggle intent, so they remain out of the initial JavaScript path.

## Interactive check

- In the development UI, spoiler protection was turned OFF while BUF was selected. After switching the favorite team to MIA, the control returned to ON and the Latest Results score became an em dash without a Game Stats action.
- With spoiler protection subsequently turned OFF, the MIA Game Stats action opened the detail surface immediately and began the official-stats request. The loading state is only present for uncached official Game Book data; cached results return from the server cache on later opens.
