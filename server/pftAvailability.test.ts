import { describe, expect, it } from "vitest";
import { availabilityStatus, parsePftAvailabilityArticle, pftInsightStatus } from "./pftAvailability";

const articleHtml = `<!doctype html><html><head><title>Christian Gonzalez remains out of practice Saturday | NBC Sports</title><script type="application/ld+json">{"datePublished":"2026-08-15T13:41:25.823Z"}</script></head><body><article>New England Patriots coach Mike Vrabel said Christian Gonzalez is physically unavailable and not ready to return. Vrabel also announced that reserve offensive lineman Ben Brown will miss the rest of the preseason with an injury.</article></body></html>`;

describe("PFT availability parsing", () => {
  it("classifies multi-week absence language without storing article body", () => {
    expect(availabilityStatus("Ben Brown will miss a few weeks")).toBe("OUT · MULTI-WEEK");
    expect(availabilityStatus("Ben Brown will miss the rest of the preseason")).toBe("OUT · MULTI-WEEK");
    const insights = parsePftAvailabilityArticle(articleHtml, "https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/christian-gonzalez-remains-out-of-practice-saturday", [{ teamCode: "NE", playerName: "Ben Brown" }, { teamCode: "NE", playerName: "Christian Gonzalez" }]);
    expect(insights).toHaveLength(2);
    expect(insights).toContainEqual(expect.objectContaining({ teamCode: "NE", playerName: "Ben Brown", statusLabel: "OUT · MULTI-WEEK", sourceName: "ProFootballTalk (NBC Sports)" }));
    expect(insights).toContainEqual(expect.objectContaining({ teamCode: "NE", playerName: "Christian Gonzalez", statusLabel: "LIMITED" }));
  });

  it("does not match a player to an unrelated team", () => {
    const insights = parsePftAvailabilityArticle(articleHtml, "https://example.com/article", [{ teamCode: "BUF", playerName: "Ben Brown" }]);
    expect(insights).toEqual([]);
  });

  it("does not assign Ben Brown's multi-week absence to a teammate named in the same article", () => {
    const insights = parsePftAvailabilityArticle(articleHtml, "https://example.com/article", [{ teamCode: "NE", playerName: "Christian Gonzalez" }]);
    expect(insights).toEqual([expect.objectContaining({ playerName: "Christian Gonzalez", statusLabel: "LIMITED" })]);
  });

  it("classifies roster moves as transaction insights without treating autograph events as a move", () => {
    expect(pftInsightStatus("The Texans signed center Example Player to the active roster.")).toBe("TRANSACTION");
    expect(pftInsightStatus("Example Player signed autographs for fans after practice.")).toBeNull();
  });

  it("ignores player and status words found only in navigation or related links outside the article body", () => {
    const htmlWithRelatedLinks = articleHtml.replace("</body>", "<nav>New York Giants quarterback Jaxson Dart is out for the season. Cleveland Browns quarterback Deshaun Watson is out for the season.</nav></body>");
    const insights = parsePftAvailabilityArticle(htmlWithRelatedLinks, "https://example.com/article-body-only", [{ teamCode: "NE", playerName: "Ben Brown" }, { teamCode: "NE", playerName: "Christian Gonzalez" }, { teamCode: "NYG", playerName: "Jaxson Dart" }, { teamCode: "CLE", playerName: "Deshaun Watson" }]);
    expect(insights).toEqual(expect.arrayContaining([expect.objectContaining({ teamCode: "NE", playerName: "Ben Brown", statusLabel: "OUT · MULTI-WEEK" })]));
    expect(insights.some((item) => item.teamCode === "NYG" || item.teamCode === "CLE")).toBe(false);
  });

  it("rejects a Giants player mentioned in a stale in-article module when the headline identifies only another team", () => {
    const titansArticle = `<!doctype html><html><head><title>Titans TE Jaren Kanak, DE Jaylen Harrell out for season with injuries | NBC Sports</title><script type="application/ld+json">{"datePublished":"2026-08-15T22:36:43.000Z"}</script></head><body><article>The Titans lost a pair of players to season-ending injuries. Related story: New York Giants quarterback Jaxson Dart is out for the season.</article></body></html>`;
    const insights = parsePftAvailabilityArticle(titansArticle, "https://example.com/titans", [{ teamCode: "NYG", playerName: "Jaxson Dart" }]);
    expect(insights).toEqual([]);
  });
});
