# DAZN Link Verification — 2026-08-27

## Confirmed public URLs

- Japan home: <https://www.dazn.com/ja-JP/home>
- Japan NFL Game Pass: <https://www.dazn.com/ja-JP/l/nfl-game-pass>

## Integration decision

DAZN does not publish a stable, supported custom URL scheme for opening a specific NFL Game Pass screen in the mobile app. The app should therefore use the official HTTPS NFL Game Pass URL in the same browsing context. On supported iOS/Android devices with the DAZN app installed and Universal Link/App Link association enabled, the operating system may hand the official URL to the DAZN app. This cannot be guaranteed by the site because users can disable the association or have no app installed.

Desktop should use the official Japan home URL, opening in a new browser tab.
