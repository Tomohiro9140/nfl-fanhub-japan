import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OfficialGameNotes, OfficialGameTicket, OfficialHuddle, OfficialRosterMoveDigest, OfficialStatusRadar } from "./OfficialGameExperience";
import { OfficialLatestResults, OfficialLeagueDashboard, type LeagueDashboard } from "./OfficialLeagueDashboard";
import { SpoilerSwitch } from "@/pages/Home";
import type { FavoriteTeam } from "@/lib/nflTeams";

const favorite: FavoriteTeam = { code: "BUF", name: "Buffalo Bills", conference: "AFC", division: "East", brand: { primary: "#00338D", accent: "#C60C30", onPrimary: "#FFFFFF" } };
const kickoffAt = new Date("2026-08-23T06:00:00.000Z");

const dashboard: LeagueDashboard = {
  standings: [],
  results: [{ id: 1, awayTeamCode: "CAR", homeTeamCode: "BUF", awayScore: 14, homeScore: 29, gameState: "FINAL", gameUrl: "https://www.nfl.com/games/panthers-at-bills-2026-pre-1", nflHighlightUrl: "https://www.nfl.com/videos/panthers-vs-bills-highlights-preseason-week-1", daznUrl: null, sourceUrl: "https://www.nfl.com/scores", fetchedAt: kickoffAt }],
  calendar: [{ id: 1, teamCode: "BUF", opponentCode: "CLE", homeAway: "away", seasonPhase: "preseason", weekLabel: "PRESEASON WEEK 2", kickoffAt, broadcast: null, sourceUrl: "https://www.nfl.com/schedules", daznUrl: null, gameState: null, awayScore: null, homeScore: null }],
};

describe("compact mobile result and schedule UI", () => {
  it("keeps the individual-video badge and highlight link in one horizontal row", () => {
    const markup = renderToStaticMarkup(createElement(OfficialLatestResults, { favorite, dashboard, loading: false, spoilerMode: true }));
    expect(markup).toMatch(/flex items-center justify-end gap-1\.5[^>]*>[\s\S]*リンク済[\s\S]*WATCH HIGHLIGHTS/);
    expect(markup).toContain("RESULT HIDDEN");
  });

  it("removes the requested Game Ticket chrome while retaining the watch action", () => {
    const markup = renderToStaticMarkup(createElement(OfficialGameTicket, {
      favorite,
      loading: false,
      snapshot: { nextGame: { opponentCode: "CLE", homeAway: "away", seasonPhase: "preseason", weekLabel: "PRESEASON WEEK 2", kickoffAt, venue: null, broadcast: null, sourceUrl: "https://www.nfl.com/schedules", daznUrl: null, gameState: null, awayScore: null, homeScore: null }, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null } },
    }));
    expect(markup).toContain("観戦する");
    expect(markup).not.toContain("APP / BROWSER");
    expect(markup).not.toContain("SPOILER SAFE");
    expect(markup).not.toContain("NFL OFFICIAL SCHEDULE");
    expect(markup).not.toContain("calendar-days");
  });

  it("marks the home club with @ in the Game Ticket and Latest Results rows", () => {
    const ticketMarkup = renderToStaticMarkup(createElement(OfficialGameTicket, {
      favorite,
      loading: false,
      snapshot: { nextGame: { opponentCode: "CLE", homeAway: "away", seasonPhase: "preseason", weekLabel: "PRESEASON WEEK 2", kickoffAt, venue: null, broadcast: null, sourceUrl: "https://www.nfl.com/schedules", daznUrl: null, gameState: null, awayScore: null, homeScore: null }, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null } },
    }));
    const resultMarkup = renderToStaticMarkup(createElement(OfficialLatestResults, { favorite, dashboard, loading: false, spoilerMode: false }));
    expect(ticketMarkup).toContain("@ Cleveland Browns");
    expect(ticketMarkup).not.toContain("@ Buffalo Bills");
    expect(resultMarkup).toContain("@ Buffalo Bills");
  });

  it("uses the Japanese spoiler label and omits schedule-card countdown text", () => {
    const switchMarkup = renderToStaticMarkup(createElement(SpoilerSwitch, { spoilerMode: true, onToggle: () => undefined }));
    const leagueMarkup = renderToStaticMarkup(createElement(OfficialLeagueDashboard, { favorite, dashboard, loading: false }));
    expect(switchMarkup).toContain("ネタバレ防止");
    expect(switchMarkup).not.toContain("SPOILER SAFE");
    expect(leagueMarkup).toContain("PRE · WEEK 2");
    expect(leagueMarkup).not.toContain("STARTS IN");
  });

  it("uses the reclaimed huddle space for official updates and storylines instead of next-game detail", () => {
    const snapshot = { nextGame: undefined, roster: [{ id: 1, playerName: "A Player", jerseyNumber: "1", position: "QB", rosterStatus: "active", sourceUrl: "https://www.buffalobills.com/roster", fetchedAt: kickoffAt }], rosterCounts: [{ status: "active", count: 53 }], injuries: [{ id: 1, title: "Official availability update", sourceName: "BUF Official News", sourceUrl: "https://www.buffalobills.com/news/injury", publishedAt: kickoffAt }], news: [{ id: 1, title: "Camp storyline", summary: "Official team context for the week.", sourceName: "BUF Official News", sourceUrl: "https://www.buffalobills.com/news/story", publishedAt: kickoffAt }], sources: { schedule: null, roster: null, injury: null }, lastUpdatedAt: kickoffAt };
    const huddleMarkup = renderToStaticMarkup(createElement(OfficialHuddle, { favorite, snapshot }));
    const notesMarkup = renderToStaticMarkup(createElement(OfficialGameNotes, { favorite, snapshot }));
    expect(huddleMarkup).toContain("LATEST TEAM UPDATE");
    expect(huddleMarkup).toContain("ROSTER SNAPSHOT");
    expect(huddleMarkup).not.toContain("SOURCE STATUS");
    expect(notesMarkup).toContain("OFFICIAL STORYLINE");
    expect(notesMarkup).toContain("AVAILABILITY WATCH");
    expect(notesMarkup).not.toContain("NEXT GAME");
  });

  it("integrates game-day state into the ticket and keeps concise roster moves out of the availability radar", () => {
    const snapshot = { nextGame: { opponentCode: "CLE", homeAway: "away" as const, seasonPhase: "preseason" as const, weekLabel: "PRESEASON WEEK 2", kickoffAt, venue: null, broadcast: null, gameState: "LIVE", awayScore: 10, homeScore: 7, sourceUrl: "https://www.nfl.com/games/bills-at-browns", daznUrl: null, fetchedAt: kickoffAt }, gameDayStatus: { opponentCode: "CLE", homeAway: "away" as const, weekLabel: "PRESEASON WEEK 2", kickoffAt, gameState: "LIVE", awayScore: 10, homeScore: 7, sourceUrl: "https://www.nfl.com/games/bills-at-browns", fetchedAt: kickoffAt }, roster: [], rosterCounts: [], injuries: [{ id: 1, title: "Official injury item", sourceName: "BUF Official News", sourceUrl: "https://www.buffalobills.com/news/injury", publishedAt: kickoffAt, category: "injury" as const }], rosterMoves: [{ id: 2, title: "Bills sign Example Player", sourceName: "BUF Official News", sourceUrl: "https://www.buffalobills.com/news/transaction", publishedAt: kickoffAt, category: "transaction" as const }], news: [], sources: { schedule: null, roster: null, injury: null, moves: "https://www.buffalobills.com/news/transaction" }, lastUpdatedAt: kickoffAt };
    const ticketMarkup = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite, snapshot, loading: false }));
    const digestMarkup = renderToStaticMarkup(createElement(OfficialRosterMoveDigest, { snapshot, loading: false }));
    const radarMarkup = renderToStaticMarkup(createElement(OfficialStatusRadar, { favorite, snapshot, loading: false }));
    expect(ticketMarkup).toContain("GAME STATUS");
    expect(ticketMarkup).toContain("INACTIVES");
    expect(ticketMarkup).toContain("GAME CENTER");
    expect(ticketMarkup).toContain("LIVE");
    expect(digestMarkup).toContain("ROSTER MOVE DIGEST");
    expect(digestMarkup).toContain("Bills sign Example Player");
    expect(radarMarkup).toContain("INJURY RELATED");
    expect(radarMarkup).not.toContain("INJURY OR TRANSACTION RELATED");
    expect(radarMarkup).not.toContain("Bills sign Example Player");
  });

  it("keeps the availability-only PFT watch below official injury items, removes the result icon, and uses tighter result spacing", () => {
    const snapshot = { nextGame: undefined, roster: [], rosterCounts: [], injuries: [{ id: 1, title: "Official injury item", sourceName: "Team Official", sourceUrl: "https://example.com/injury", publishedAt: kickoffAt, category: "injury" as const }], externalInsights: [{ id: 1, playerName: "Example Player", statusLabel: "OUT", headline: "Example Player expected to miss time", sourceName: "ProFootballTalk (NBC Sports)", sourceUrl: "https://example.com/pft", publishedAt: kickoffAt }], news: [], sources: { schedule: null, roster: null, injury: null }, lastUpdatedAt: kickoffAt };
    const radarMarkup = renderToStaticMarkup(createElement(OfficialStatusRadar, { favorite, snapshot, loading: false }));
    const resultMarkup = renderToStaticMarkup(createElement(OfficialLatestResults, { favorite, dashboard, loading: false, spoilerMode: false }));
    expect(radarMarkup.indexOf("INJURY RELATED")).toBeLessThan(radarMarkup.indexOf("AVAILABILITY WATCH · PFT"));
    expect(radarMarkup).toContain("OUT");
    expect(resultMarkup).toContain("px-3 py-2");
    expect(resultMarkup).toContain("py-1.5");
    expect(resultMarkup).not.toContain("lucide-trophy");
  });
});
