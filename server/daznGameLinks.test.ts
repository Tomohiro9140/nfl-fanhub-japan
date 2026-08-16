import { describe, expect, it } from "vitest";
import { matchDaznLinksToOfficialGames, parseDaznGameLinkCandidates } from "./daznGameLinks";

const sourceUrl = "https://www.dazn.com/ja-JP/competition/Competition:test";
const html = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"SportsEvent","name":"Buffalo Bills at Cleveland Browns","startDate":"2026-08-22T17:00:00.000Z","url":"https://www.dazn.com/ja-JP/home/nfl-buf-cle"}</script>`;

describe("DAZN game link matching", () => {
  it("reads only structured DAZN SportsEvent URLs", () => {
    expect(parseDaznGameLinkCandidates(html, sourceUrl)).toEqual([{ title: "Buffalo Bills at Cleveland Browns", url: "https://www.dazn.com/ja-JP/home/nfl-buf-cle", kickoffAt: new Date("2026-08-22T17:00:00.000Z"), sourceUrl }]);
  });

  it("links both official team rows only when teams and start time identify one game", () => {
    const matches = matchDaznLinksToOfficialGames(parseDaznGameLinkCandidates(html, sourceUrl), [
      { externalId: "buf-game", teamCode: "BUF", opponentCode: "CLE", kickoffAt: new Date("2026-08-22T17:00:00.000Z") },
      { externalId: "cle-game", teamCode: "CLE", opponentCode: "BUF", kickoffAt: new Date("2026-08-22T17:00:00.000Z") },
      { externalId: "other", teamCode: "BUF", opponentCode: "NYJ", kickoffAt: new Date("2026-08-22T17:00:00.000Z") },
    ]);
    expect(matches.map((match) => match.externalId).sort()).toEqual(["buf-game", "cle-game"]);
  });
});
