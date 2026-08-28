import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OfficialGameNotes, OfficialGameTicket, OfficialHuddle, OfficialRosterMoveDigest, OfficialStatusRadar } from "./OfficialGameExperience";
import { OfficialLatestResults, OfficialLeagueDashboard, type LeagueDashboard } from "./OfficialLeagueDashboard";
import { SpoilerSwitch } from "@/pages/Home";
import { nflTeams, type FavoriteTeam } from "@/lib/nflTeams";
import { getNextSevenDayGames } from "@/lib/leagueCalendar";
import { readFileSync } from "node:fs";

const gameStatsDialogSource = readFileSync(new URL("./GameStatsDialog.tsx", import.meta.url), "utf8");

const favorite: FavoriteTeam = { code: "BUF", name: "Buffalo Bills", conference: "AFC", division: "East", brand: { primary: "#00338D", accent: "#C60C30", onPrimary: "#FFFFFF" } };
const kickoffAt = new Date("2026-08-23T06:00:00.000Z");

const dashboard: LeagueDashboard = {
  standings: [],
  results: [{ id: 1, weekLabel: "PRESEASON WEEK 1", awayTeamCode: "CAR", homeTeamCode: "BUF", awayScore: 14, homeScore: 29, gameState: "FINAL", gameDate: "2026-08-15", kickoffAt: new Date("2026-08-15T17:00:00.000Z"), venue: "Highmark Stadium", gameUrl: "https://www.nfl.com/games/panthers-at-bills-2026-pre-1", nflHighlightUrl: "https://www.nfl.com/videos/panthers-vs-bills-highlights-preseason-week-1", daznUrl: null, sourceUrl: "https://www.nfl.com/scores", fetchedAt: kickoffAt }],
  calendar: [{ id: 1, teamCode: "BUF", opponentCode: "CLE", homeAway: "away", seasonPhase: "preseason", weekLabel: "PRESEASON WEEK 2", kickoffAt, broadcast: null, sourceUrl: "https://www.nfl.com/schedules", daznUrl: null, gameState: null, awayScore: null, homeScore: null }],
};

describe("compact mobile result and schedule UI", () => {
  it("keeps the left team-comparison highlight fitted to its numeric value", () => {
    expect(gameStatsDialogSource).toContain("justify-self-start font-mono text-[12px]");
  });
  it("renders only the individual highlight action when a video is registered", () => {
    const markup = renderToStaticMarkup(createElement(OfficialLatestResults, { favorite, dashboard, loading: false, spoilerMode: true }));
    expect(markup).toContain("WATCH HIGHLIGHTS");
    expect(markup).not.toContain("リンク済");
    expect(markup).not.toContain("RESULT HIDDEN");
    expect(markup).toContain("PRESEASON WEEK 1");
    expect(markup).toContain("GAME DATE · 8/16(日) JST");
    expect(markup).toContain("VENUE · Highmark Stdm.");
    expect(markup).toContain("absolute bottom-full right-0 mb-1.5");
    const fallbackDashboard: LeagueDashboard = { ...dashboard, results: [{ ...dashboard.results[0]!, kickoffAt: null }] };
    const fallbackMarkup = renderToStaticMarkup(createElement(OfficialLatestResults, { favorite, dashboard: fallbackDashboard, loading: false, spoilerMode: true }));
    expect(fallbackMarkup).toContain("OFFICIAL DATE · 8/15(土)");
    const revealedMarkup = renderToStaticMarkup(createElement(OfficialLatestResults, { favorite, dashboard, loading: false, spoilerMode: false }));
    expect(revealedMarkup).not.toContain(">FINAL<");
    expect(revealedMarkup).toContain("font-extrabold text-[#a84420]");
    expect(markup).not.toContain("font-extrabold text-[#a84420]");
    expect(revealedMarkup).toMatch(/>14<\/span><span> - <\/span><span[^>]*text-\[#a84420\][^>]*>29<\/span>/);
    expect(revealedMarkup).toContain("min-h-[84px]");
    expect(revealedMarkup).toContain("py-7 pb-2.5");
    expect(revealedMarkup).toContain("leading-[1.45]");
    expect(revealedMarkup).toContain("truncate pb-px leading-[1.45]");
    expect(revealedMarkup).not.toContain("memo-slip");
  });

  it("shows Game Stats only after a FINAL when spoiler protection is off", () => {
    const openStats = () => undefined;
    const revealedResults = renderToStaticMarkup(createElement(OfficialLatestResults, { favorite, dashboard, loading: false, spoilerMode: false, onOpenGameStats: openStats }));
    const hiddenResults = renderToStaticMarkup(createElement(OfficialLatestResults, { favorite, dashboard, loading: false, spoilerMode: true, onOpenGameStats: openStats }));
    const finalSnapshot = { nextGame: { opponentCode: "CAR", homeAway: "home" as const, seasonPhase: "preseason" as const, weekLabel: "PRESEASON WEEK 1", kickoffAt, venue: null, broadcast: null, sourceUrl: "https://www.nfl.com/games/panthers-at-bills-2026-pre-1", daznUrl: null, gameState: "FINAL", awayScore: 14, homeScore: 29, fetchedAt: kickoffAt }, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null } };
    const revealedTicket = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite, snapshot: finalSnapshot, loading: false, spoilerMode: false, onOpenGameStats: openStats }));
    const hiddenTicket = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite, snapshot: finalSnapshot, loading: false, spoilerMode: true, onOpenGameStats: openStats }));

    expect(revealedResults).toContain("GAME STATS");
    expect(hiddenResults).not.toContain("GAME STATS");
    expect(revealedTicket).toContain("GAME STATS");
    expect(hiddenTicket).not.toContain("GAME STATS");
  });

  it("reserves the revealed Game Stats action height while spoiler protection hides the action", () => {
    const openStats = () => undefined;
    const revealedMarkup = renderToStaticMarkup(createElement(OfficialLatestResults, { favorite, dashboard, loading: false, spoilerMode: false, onOpenGameStats: openStats }));
    const hiddenMarkup = renderToStaticMarkup(createElement(OfficialLatestResults, { favorite, dashboard, loading: false, spoilerMode: true, onOpenGameStats: openStats }));

    expect(revealedMarkup).toContain("mt-2 inline-flex h-3");
    expect(hiddenMarkup).toContain('aria-hidden="true" class="mt-2 block h-3"');
    expect(hiddenMarkup).not.toContain("GAME STATS");
  });

  it("removes the requested Game Ticket chrome while retaining the watch action", () => {
    const markup = renderToStaticMarkup(createElement(OfficialGameTicket, {
      favorite,
      loading: false,
      snapshot: { nextGame: { opponentCode: "CLE", homeAway: "away", seasonPhase: "preseason", weekLabel: "PRESEASON WEEK 2", kickoffAt, venue: null, broadcast: null, sourceUrl: "https://www.nfl.com/schedules", daznUrl: null, gameState: null, awayScore: null, homeScore: null }, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null } },
    }));
    expect(markup).toContain("観戦する");
    expect(markup).toContain("block sm:inline");
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

  it("never exposes live scores during spoiler protection and always shows an Inactives state on game day", () => {
    const liveSnapshot = { nextGame: { opponentCode: "CLE", homeAway: "away" as const, seasonPhase: "preseason" as const, weekLabel: "PRESEASON WEEK 2", kickoffAt, venue: null, broadcast: null, sourceUrl: "https://www.nfl.com/games/bills-at-browns", daznUrl: null, gameState: "LIVE", awayScore: 41, homeScore: 38, fetchedAt: kickoffAt }, gameDayStatus: { opponentCode: "CLE", homeAway: "away" as const, weekLabel: "PRESEASON WEEK 2", kickoffAt, sourceUrl: "https://www.nfl.com/games/bills-at-browns", gameState: "LIVE", awayScore: 41, homeScore: 38, fetchedAt: kickoffAt }, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null } };
    const spoilerMarkup = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite, snapshot: liveSnapshot, loading: false, spoilerMode: true }));
    const revealedMarkup = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite, snapshot: liveSnapshot, loading: false, spoilerMode: false }));

    expect(spoilerMarkup).toContain("ネタバレ防止中 · スコア非表示");
    expect(spoilerMarkup).not.toContain("41 — 38");
    expect(revealedMarkup).toContain("OFFICIAL SCORE 41 — 38");
    expect(spoilerMarkup).toContain("INACTIVES");
    expect(spoilerMarkup).toContain("NONE REPORTED");

    const reportedMarkup = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite, snapshot: { ...liveSnapshot, inactiveReport: { title: "Official inactive list", sourceUrl: "https://www.nfl.com/inactives/", publishedAt: kickoffAt } }, loading: false, spoilerMode: true }));
    expect(reportedMarkup).toContain("REPORTED · Official inactive list");
    expect(reportedMarkup).not.toContain("NONE REPORTED");
  });

  it("treats the NFL official INGAME state as LIVE so a current Preseason week never falls through to the next fixture", () => {
    const liveSnapshot = { nextGame: { opponentCode: "DEN", homeAway: "away" as const, seasonPhase: "preseason" as const, weekLabel: "PRESEASON WEEK 2", kickoffAt, kickoffAtEstimated: true, venue: null, broadcast: null, sourceUrl: "https://www.nfl.com/games/packers-at-broncos-2026-pre-2", daznUrl: null, gameState: "INGAME", awayScore: 7, homeScore: 10, fetchedAt: kickoffAt }, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null } };
    const markup = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite, snapshot: liveSnapshot, loading: false, spoilerMode: true }));
    expect(markup).toContain("PRESEASON WEEK 2");
    expect(markup).toContain("LIVE GAME");
    expect(markup).toContain("LIVE NOW");
    expect(markup).toContain("ネタバレ防止中 · スコア非表示");
    expect(markup).not.toContain("7 — 10");
  });

  it("shows an Inactives state for every team during game day", () => {
    const gameDayKickoff = new Date(Date.now() + 60 * 60 * 1_000);
    const gameDaySnapshot = { nextGame: { opponentCode: "CLE", homeAway: "away" as const, seasonPhase: "preseason" as const, weekLabel: "PRESEASON WEEK 2", kickoffAt: gameDayKickoff, venue: null, broadcast: null, sourceUrl: "https://www.nfl.com/games/bills-at-browns", daznUrl: null, gameState: null, awayScore: null, homeScore: null, fetchedAt: kickoffAt }, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null } };
    for (const team of nflTeams) {
      const markup = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite: team, snapshot: gameDaySnapshot, loading: false, spoilerMode: true }));
      expect(markup).toContain("GAME DAY");
      expect(markup).toContain("INACTIVES");
      expect(markup).toContain("NONE REPORTED");
      expect(markup).not.toContain("公式インアクティブ発表前");
    }
  });

  it("hides all scores for every team and relevant game state while preserving Inactives report status", () => {
    const states = ["LIVE", null, "FINAL"] as const;
    for (const team of nflTeams) {
      for (const gameState of states) {
        const kickoff = gameState === null ? new Date(Date.now() + 60 * 60 * 1_000) : kickoffAt;
        const snapshot = { nextGame: { opponentCode: "CLE", homeAway: "away" as const, seasonPhase: "preseason" as const, weekLabel: "PRESEASON WEEK 2", kickoffAt: kickoff, venue: null, broadcast: null, sourceUrl: "https://www.nfl.com/games/bills-at-browns", daznUrl: null, gameState, awayScore: 41, homeScore: 38, fetchedAt: kickoffAt }, inactiveReport: { title: "NFL Official Inactives", summary: "QB Example Player", sourceUrl: "https://www.nfl.com/inactives/", publishedAt: kickoffAt }, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null } };
        const markup = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite: team, snapshot, loading: false, spoilerMode: true }));
        expect(markup).not.toContain("41 — 38");
        expect(markup).toContain("INACTIVES");
        expect(markup).toContain("REPORTED · QB Example Player");
      }
    }
  });

  it("uses the Japanese spoiler label and omits schedule-card countdown text", () => {
    const switchMarkup = renderToStaticMarkup(createElement(SpoilerSwitch, { spoilerMode: true, onToggle: () => undefined }));
    const leagueMarkup = renderToStaticMarkup(createElement(OfficialLeagueDashboard, { favorite, dashboard, loading: false }));
    expect(switchMarkup).toContain("ネタバレ防止");
    expect(switchMarkup).not.toContain("SPOILER SAFE");
    expect(leagueMarkup).toContain("PRE · WEEK 2");
    expect(leagueMarkup).toContain("https://www.buffalobills.com/schedule/");
    expect(leagueMarkup).toContain("BUF @ CLE");
    expect(leagueMarkup).toContain("https://www.nfl.com/standings/league/2026/REG");
    expect(leagueMarkup).not.toContain("STARTS IN");
    expect(leagueMarkup).not.toContain(">AWAY<");
    expect(leagueMarkup).not.toContain(">HOME<");
    expect(leagueMarkup).toContain("bg-[#f3f4f6]");

    const homeDashboard: LeagueDashboard = { ...dashboard, calendar: [{ ...dashboard.calendar[0]!, opponentCode: "MIA", homeAway: "home" }] };
    const homeLeagueMarkup = renderToStaticMarkup(createElement(OfficialLeagueDashboard, { favorite, dashboard: homeDashboard, loading: false }));
    expect(homeLeagueMarkup).not.toContain(">HOME<");
    expect(homeLeagueMarkup).toContain("background-color:#00338D");
    expect(homeLeagueMarkup).toContain("border-left-color:#C60C30");
  });

  it("keeps the highlighted division club in the same team-name and record columns for all teams", () => {
    const standings = nflTeams.map((team, index) => ({ teamCode: team.code, wins: 17 - (index % 5), losses: index % 5, ties: 0, pct: ".500", pointsFor: null, pointsAgainst: null, sourceUrl: "https://www.nfl.com/standings", fetchedAt: kickoffAt }));
    const standingDashboard: LeagueDashboard = { ...dashboard, standings };

    for (const team of nflTeams) {
      const markup = renderToStaticMarkup(createElement(OfficialLeagueDashboard, { favorite: team, dashboard: standingDashboard, loading: false }));
      expect(markup, team.code).toContain("grid grid-cols-[18px_1fr_auto] items-center gap-2 py-2.5 bg-[#fff8ed]");
      expect(markup, team.code).not.toContain("-mx-1");
      expect(markup, team.code).not.toContain("px-1.5");
    }
  });

  it("keeps every live Week 2 matchup in rendered Schedule Desk markup at compact and wide breakpoints", () => {
    const liveCalendar: LeagueDashboard = {
      ...dashboard,
      calendar: [
        { id: -1, teamCode: "GB", opponentCode: "DEN", homeAway: "away", seasonPhase: "preseason", weekLabel: "PRESEASON WEEK 2", kickoffAt, broadcast: null, sourceUrl: "https://www.nfl.com/games/packers-at-broncos-2026-pre-2", daznUrl: null, gameState: "INGAME", awayScore: 7, homeScore: 10, liveScoreboardFallback: true },
        { id: -2, teamCode: "NYJ", opponentCode: "PIT", homeAway: "away", seasonPhase: "preseason", weekLabel: "PRESEASON WEEK 2", kickoffAt, broadcast: null, sourceUrl: "https://www.nfl.com/games/jets-at-steelers-2026-pre-2", daznUrl: null, gameState: "INGAME", awayScore: 17, homeScore: 0, liveScoreboardFallback: true },
        { id: -3, teamCode: "CAR", opponentCode: "JAX", homeAway: "away", seasonPhase: "preseason", weekLabel: "PRESEASON WEEK 2", kickoffAt, broadcast: null, sourceUrl: "https://www.nfl.com/games/panthers-at-jaguars-2026-pre-2", daznUrl: null, gameState: "INGAME", awayScore: 26, homeScore: 6 },
      ],
    };
    const markup = renderToStaticMarkup(createElement(OfficialLeagueDashboard, { favorite: { ...favorite, code: "GB", name: "Green Bay Packers" }, dashboard: liveCalendar, loading: false }));
    expect(markup).toContain("GB @ DEN");
    expect(markup).toContain("LIVE · OFFICIAL SCOREBOARD");
    expect(markup).toContain("grid grid-cols-2");
    expect(getNextSevenDayGames(liveCalendar.calendar, new Date("2026-08-22T02:00:00.000Z")).map((game) => `${game.teamCode} @ ${game.opponentCode}`)).toEqual(["GB @ DEN", "NYJ @ PIT", "CAR @ JAX"]);
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
    const snapshot = { nextGame: { opponentCode: "CLE", homeAway: "away" as const, seasonPhase: "preseason" as const, weekLabel: "PRESEASON WEEK 2", kickoffAt, venue: null, broadcast: null, gameState: "LIVE", awayScore: 10, homeScore: 7, sourceUrl: "https://www.nfl.com/games/bills-at-browns", daznUrl: null, fetchedAt: kickoffAt }, gameDayStatus: { opponentCode: "CLE", homeAway: "away" as const, weekLabel: "PRESEASON WEEK 2", kickoffAt, gameState: "LIVE", awayScore: 10, homeScore: 7, sourceUrl: "https://www.nfl.com/games/bills-at-browns", fetchedAt: kickoffAt }, roster: [], rosterCounts: [], injuries: [{ id: 1, title: "Official injury item", sourceName: "BUF Official News", sourceUrl: "https://www.buffalobills.com/news/injury", publishedAt: kickoffAt, category: "injury" as const }], rosterMoves: [{ id: 2, title: "Bills sign Example Player", sourceName: "BUF Official News", sourceUrl: "https://www.buffalobills.com/news/transaction", publishedAt: kickoffAt, category: "transaction" as const }, { id: 3, title: "Play of the Day: Example Player forces a turnover", sourceName: "BUF Official News", sourceUrl: "https://www.buffalobills.com/news/play-of-the-day", publishedAt: kickoffAt, category: "transaction" as const }], news: [], sources: { schedule: null, roster: null, injury: null, moves: "https://www.buffalobills.com/news/transaction" }, lastUpdatedAt: kickoffAt };
    const ticketMarkup = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite, snapshot, loading: false }));
    const digestMarkup = renderToStaticMarkup(createElement(OfficialRosterMoveDigest, { snapshot, loading: false }));
    const radarMarkup = renderToStaticMarkup(createElement(OfficialStatusRadar, { favorite, snapshot, loading: false }));
    expect(ticketMarkup).toContain("GAME STATUS");
    expect(ticketMarkup).toContain("INACTIVES");
    expect(ticketMarkup).toContain("NFL GAME CENTER");
    expect(ticketMarkup).not.toContain("OFFICIAL SCHEDULE");
    expect(ticketMarkup).toContain("LIVE");
    expect(digestMarkup).toContain("ROSTER MOVE DIGEST");
    expect(digestMarkup).toContain("Bills sign Example Player");
    expect(digestMarkup).not.toContain("Play of the Day: Example Player");
    expect(digestMarkup).toContain("flex items-center gap-2");
    expect(radarMarkup).toContain("INJURY RELATED");
    expect(radarMarkup).not.toContain("INJURY OR TRANSACTION RELATED");
    expect(radarMarkup).not.toContain("Bills sign Example Player");
  });

  it("labels a protected final as the last game while keeping its official score out of spoiler-safe markup", () => {
    const snapshot = { nextGame: { opponentCode: "CLE", homeAway: "away" as const, seasonPhase: "preseason" as const, weekLabel: "PRESEASON WEEK 1", kickoffAt, venue: null, broadcast: null, gameState: "FINAL", awayScore: 10, homeScore: 7, sourceUrl: "https://www.nfl.com/games/bills-at-browns", daznUrl: null, nflHighlightUrl: "https://www.nfl.com/videos/bills-vs-browns-highlights", fetchedAt: kickoffAt }, gameDayStatus: { opponentCode: "CLE", homeAway: "away" as const, weekLabel: "PRESEASON WEEK 1", kickoffAt, gameState: "FINAL", awayScore: 10, homeScore: 7, sourceUrl: "https://www.nfl.com/games/bills-at-browns", fetchedAt: kickoffAt }, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null } };
    const datedSnapshot = { ...snapshot, nextGame: { ...snapshot.nextGame, kickoffAt: new Date("2026-08-21T23:00:00.000Z"), gameDate: "2026-08-21" }, gameDayStatus: { ...snapshot.gameDayStatus, kickoffAt: new Date("2026-08-21T23:00:00.000Z"), gameDate: "2026-08-21" }, inactiveReport: { title: "NFL Official Inactives", summary: "QB Example Player", sourceUrl: "https://www.nfl.com/inactives/", publishedAt: kickoffAt } };
    const openStats = () => undefined;
    const spoilerMarkup = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite, snapshot: datedSnapshot, loading: false, spoilerMode: true, onMarkWatched: () => undefined, onOpenGameStats: openStats }));
    const normalMarkup = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite, snapshot: datedSnapshot, loading: false, spoilerMode: false, onMarkWatched: () => undefined, onOpenGameStats: openStats }));
    expect(spoilerMarkup).toContain("LAST GAME");
    expect(spoilerMarkup).toContain("ネタバレ防止中");
    expect(spoilerMarkup).toContain("OFFICIAL GAME DATE");
    expect(spoilerMarkup).toContain("8/22(土)");
    expect(spoilerMarkup).not.toContain("13:57");
    expect(spoilerMarkup).not.toContain("OFFICIAL SCORE 10 — 7");
    expect(spoilerMarkup).toContain('data-game-ticket-state="FINAL"');
    expect(spoilerMarkup).toContain("min-h-[84px] sm:min-h-[88px]");
    expect(spoilerMarkup).toContain("relative flex flex-col p-4");
    expect(spoilerMarkup).toContain("border-t border-white/15 pt-2");
    expect(spoilerMarkup).toContain('aria-hidden="true" class="inline-flex h-3"');
    expect(spoilerMarkup).toContain("flex h-[72px] flex-col justify-center");
    expect(spoilerMarkup).not.toContain("min-h-[280px]");
    expect(spoilerMarkup).toContain("REPORTED · QB Example Player");
    expect(normalMarkup).toContain("FINAL SCORE");
    expect(normalMarkup).toContain("min-h-[84px] sm:min-h-[88px]");
    expect(normalMarkup).toMatch(/>10<\/span><span> — <\/span><span[^>]*>7<\/span>/);
    expect(normalMarkup).toContain("WATCH HIGHLIGHTS");
    expect(normalMarkup).toContain("ON TO THE NEXT GAME");

    const nextGameMarkup = renderToStaticMarkup(createElement(OfficialGameTicket, {
      favorite,
      loading: false,
      hasWatchedTicket: true,
      canRestoreLastGame: true,
      onRestoreLastGame: () => undefined,
      snapshot: { ...snapshot, gameDayStatus: undefined, nextGame: { ...snapshot.nextGame, gameState: null, awayScore: null, homeScore: null } },
    }));
    expect(nextGameMarkup).toContain("RETURN TO LAST GAME");
    const cutoverMarkup = renderToStaticMarkup(createElement(OfficialGameTicket, {
      favorite,
      loading: false,
      hasWatchedTicket: true,
      canRestoreLastGame: false,
      onRestoreLastGame: () => undefined,
      snapshot: { ...snapshot, gameDayStatus: undefined, nextGame: { ...snapshot.nextGame, gameState: null, awayScore: null, homeScore: null } },
    }));
    expect(cutoverMarkup).not.toContain("RETURN TO LAST GAME");
  });

  it("renders NYJ@PIT and CAR@JAX finals with the correct JST date and preserved Inactives", () => {
    const currentFinals = [
      { matchup: "NYJ@PIT", opponentCode: "PIT", kickoffAt: new Date("2026-08-21T23:00:00.000Z") },
      { matchup: "CAR@JAX", opponentCode: "JAX", kickoffAt: new Date("2026-08-21T23:30:00.000Z") },
    ];
    for (const game of currentFinals) {
      const snapshot = { nextGame: { opponentCode: game.opponentCode, homeAway: "away" as const, seasonPhase: "preseason" as const, weekLabel: "PRESEASON WEEK 2", kickoffAt: game.kickoffAt, gameDate: "2026-08-21", venue: null, broadcast: null, sourceUrl: "https://www.nfl.com/games/example", daznUrl: null, gameState: "FINAL", awayScore: 13, homeScore: 10, fetchedAt: kickoffAt }, inactiveReport: { title: "NFL Official Inactives", summary: "QB Example Player", sourceUrl: "https://www.nfl.com/inactives/", publishedAt: kickoffAt }, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null } };
      const markup = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite, snapshot, loading: false, spoilerMode: true }));
      expect(markup, game.matchup).toContain("8/22(土)");
      expect(markup, game.matchup).toContain("INACTIVES");
      expect(markup, game.matchup).toContain("REPORTED · QB Example Player");
    }
  });

  it("adds a compact bye-week notice beside the Game Ticket details", () => {
    const snapshot = { nextGame: { opponentCode: "CLE", homeAway: "away" as const, seasonPhase: "regular" as const, weekLabel: "WEEK 8", kickoffAt, venue: null, broadcast: null, sourceUrl: "https://www.nfl.com/schedules", daznUrl: null, gameState: null, awayScore: null, homeScore: null, fetchedAt: kickoffAt }, byeWeek: { weekLabel: "WEEK 7", nextGameWeekLabel: "WEEK 8" }, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null } };
    const markup = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite, snapshot, loading: false }));
    expect(markup).toContain("BYE WEEK");
    expect(markup).toContain("WEEK 7 · NEXT WEEK 8");
    expect(markup).toContain("bg-white/[.07]");
  });

  it("keeps the availability-only PFT watch below official injury items, removes the result icon, and uses tighter result spacing", () => {
    const snapshot = { nextGame: undefined, roster: [], rosterCounts: [], injuries: [{ id: 1, title: "Official injury item", sourceName: "Team Official", sourceUrl: "https://example.com/injury", publishedAt: kickoffAt, category: "injury" as const }], externalInsights: [{ id: 1, playerName: "Example Player", statusLabel: "OUT", headline: "Example Player expected to miss time", sourceName: "ProFootballTalk (NBC Sports)", sourceUrl: "https://example.com/pft", publishedAt: kickoffAt }], news: [], sources: { schedule: null, roster: null, injury: null }, lastUpdatedAt: kickoffAt };
    const radarMarkup = renderToStaticMarkup(createElement(OfficialStatusRadar, { favorite, snapshot, loading: false }));
    const resultMarkup = renderToStaticMarkup(createElement(OfficialLatestResults, { favorite, dashboard, loading: false, spoilerMode: false }));
    expect(radarMarkup.indexOf("INJURY RELATED")).toBeLessThan(radarMarkup.indexOf("AVAILABILITY WATCH · PFT"));
    expect(radarMarkup).toContain("OUT");
    expect(resultMarkup).toContain("px-3 py-2");
    expect(resultMarkup).toContain("text-[13px]");
    expect(resultMarkup).toContain("text-[26px]");
    expect(resultMarkup).toContain("mt-1.5 flex items-center justify-between");
    expect(resultMarkup).toContain("self-center");
    expect(resultMarkup).not.toContain("lucide-trophy");
  });

  it("renders repeated injury rows only once in the screen output for multiple teams", () => {
    for (const team of ["BUF", "NYJ", "SEA"] as const) {
      const teamFavorite = { ...favorite, code: team, name: team === "NYJ" ? "New York Jets" : team === "SEA" ? "Seattle Seahawks" : "Buffalo Bills" };
      const sourceUrl = `https://example.com/${team.toLowerCase()}/injury-update`;
      const snapshot = { nextGame: undefined, roster: [], rosterCounts: [], injuries: [
        { id: 1, title: `${team} Official injury update`, sourceName: "Team Official", sourceUrl, publishedAt: kickoffAt, category: "injury" as const },
        { id: 2, title: `${team} OFFICIAL INJURY UPDATE`, sourceName: "Team Official", sourceUrl: `${sourceUrl}?utm_source=rss`, publishedAt: kickoffAt, category: "injury" as const },
        { id: 3, title: `${team} Separate practice report`, sourceName: "Team Official", sourceUrl: `https://example.com/${team.toLowerCase()}/practice`, publishedAt: kickoffAt, category: "injury" as const },
      ], news: [], sources: { schedule: null, roster: null, injury: null }, lastUpdatedAt: kickoffAt };
      const markup = renderToStaticMarkup(createElement(OfficialStatusRadar, { favorite: teamFavorite, snapshot, loading: false }));
      expect((markup.match(new RegExp(`${team} Official injury update`, "gi")) ?? [])).toHaveLength(1);
      expect((markup.match(new RegExp(`${team} Separate practice report`, "g")) ?? [])).toHaveLength(1);
      expect((markup.match(/data-feed-article="injury-related"/g) ?? [])).toHaveLength(2);
    }
  });

  it("keeps exactly one official in-ticket link and labels a schedule URL clearly", () => {
    const snapshot = { nextGame: { opponentCode: "CLE", homeAway: "away" as const, seasonPhase: "preseason" as const, weekLabel: "PRESEASON WEEK 2", kickoffAt, venue: null, broadcast: null, gameState: "LIVE", awayScore: 10, homeScore: 7, sourceUrl: "https://www.nfl.com/schedules", daznUrl: null, fetchedAt: kickoffAt }, roster: [], rosterCounts: [], injuries: [], news: [], sources: { schedule: null, roster: null, injury: null } };
    const markup = renderToStaticMarkup(createElement(OfficialGameTicket, { favorite, snapshot, loading: false }));
    expect(markup).toContain("GAME STATUS");
    expect(markup).toContain("INACTIVES");
    expect(markup).not.toContain("GAME CENTER");
    expect(markup).toContain("OFFICIAL SCHEDULE");
    expect(markup).toContain("mt-2 flex flex-wrap items-center");
    expect(markup.match(/href="https:\/\/www\.nfl\.com\/schedules"/g)).toHaveLength(1);
  });
});
