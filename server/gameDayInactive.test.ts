import { describe, expect, it } from "vitest";
import { buildSnapshotInactiveReport, getOfficialTeamSnapshot } from "./db";
import { refreshOfficialNflInactives, supportedOfficialTeamCodes } from "./officialFeeds";
import { TEAM_NAMES } from "./officialTeamData";
import { officialFeedItems } from "../drizzle/schema";

function snapshotDb(inactiveRows: Array<{ title: string; summary: string | null; sourceUrl: string; publishedAt: Date }>) {
  const queryResults = [[], [], [], [], [], [], [], [], [], inactiveRows];
  let queryIndex = 0;
  const chain = {
    from: () => chain,
    where: () => chain,
    orderBy: () => chain,
    limit: async () => queryResults[queryIndex++]!,
  };
  return { select: () => chain };
}

function inactiveMemoryDb() {
  let activeTeamCode = "";
  const storedItems: Array<{ teamCode: string; title: string; summary: string | null; sourceUrl: string; publishedAt: Date }> = [];
  const db = {
    setActiveTeam(teamCode: string) {
      activeTeamCode = teamCode;
    },
    insert: () => ({
      values: async (items: typeof storedItems) => {
        storedItems.push(...items);
      },
    }),
    select: () => {
      let table: unknown;
      const chain = {
        from: (value: unknown) => {
          table = value;
          return chain;
        },
        where: () => chain,
        orderBy: () => chain,
        limit: async () => table === officialFeedItems ? storedItems.filter((item) => item.teamCode === activeTeamCode) : [],
      };
      return chain;
    },
  };
  return db;
}

describe("Game Day inactive snapshot propagation", () => {
  it("returns a null report when no official announcement is cached", () => {
    expect(buildSnapshotInactiveReport([])).toBeNull();
  });

  it("preserves the official inactive announcement for all 32 team snapshots", () => {
    const publishedAt = new Date("2026-08-22T00:00:00.000Z");
    for (const teamCode of supportedOfficialTeamCodes) {
      const report = buildSnapshotInactiveReport([{ title: `NFL Official Inactives · ${teamCode}`, summary: `${teamCode} inactive player`, sourceUrl: "https://www.nfl.com/inactives/", publishedAt }]);
      expect(report).toEqual({ title: `NFL Official Inactives · ${teamCode}`, summary: `${teamCode} inactive player`, sourceUrl: "https://www.nfl.com/inactives/", publishedAt });
    }
  });

  it("returns inactiveReport directly from getOfficialTeamSnapshot for reported and unreported teams", async () => {
    const publishedAt = new Date("2026-08-22T00:00:00.000Z");
    const unreported = await getOfficialTeamSnapshot("BUF", undefined, false, snapshotDb([]) as never);
    expect(unreported.inactiveReport).toBeNull();

    for (const teamCode of supportedOfficialTeamCodes) {
      const reported = await getOfficialTeamSnapshot(teamCode, undefined, false, snapshotDb([{ title: `NFL Official Inactives · ${teamCode}`, summary: `${teamCode} inactive player`, sourceUrl: "https://www.nfl.com/inactives/", publishedAt }]) as never);
      expect(reported.inactiveReport).toEqual({ title: `NFL Official Inactives · ${teamCode}`, summary: `${teamCode} inactive player`, sourceUrl: "https://www.nfl.com/inactives/", publishedAt });
    }
  });

  it("passes official Inactives through one fetch-save-snapshot path for all 32 teams", async () => {
    const publishedAt = new Date("2026-08-22T00:00:00.000Z");
    const page = `<h1>NFL Inactive Reports</h1>${supportedOfficialTeamCodes.map((teamCode) => `<h2>${TEAM_NAMES[teamCode]}</h2><p>${teamCode} inactive player</p>`).join("")}`;
    let savedItems: Array<{ teamCode: string; title: string; summary: string | null; sourceUrl: string; publishedAt: Date }> = [];
    const refresh = await refreshOfficialNflInactives({ fetchHtml: async () => page, saveItems: async (items) => { savedItems = items; }, now: () => publishedAt });
    expect(refresh).toEqual({ reports: 32 });

    for (const teamCode of supportedOfficialTeamCodes) {
      const snapshot = await getOfficialTeamSnapshot(teamCode, undefined, false, snapshotDb(savedItems.filter((item) => item.teamCode === teamCode)) as never);
      expect(snapshot.inactiveReport).toEqual({ title: `NFL Official Inactives · ${teamCode}`, summary: `${teamCode} inactive player`, sourceUrl: "https://www.nfl.com/inactives/", publishedAt });
    }
  });

  it("reads saved official Inactives from the same database mock through every team snapshot", async () => {
    const publishedAt = new Date("2026-08-22T00:00:00.000Z");
    const page = `<h1>NFL Inactive Reports</h1>${supportedOfficialTeamCodes.map((teamCode) => `<h2>${TEAM_NAMES[teamCode]}</h2><p>${teamCode} inactive player</p>`).join("")}`;
    const db = inactiveMemoryDb();
    await refreshOfficialNflInactives({ fetchHtml: async () => page, saveItems: async (items) => db.insert(officialFeedItems).values(items), now: () => publishedAt });

    for (const teamCode of supportedOfficialTeamCodes) {
      db.setActiveTeam(teamCode);
      const snapshot = await getOfficialTeamSnapshot(teamCode, undefined, false, db as never);
      expect(snapshot.inactiveReport).toEqual({ title: `NFL Official Inactives · ${teamCode}`, summary: `${teamCode} inactive player`, sourceUrl: "https://www.nfl.com/inactives/", publishedAt });
    }
  });
});
