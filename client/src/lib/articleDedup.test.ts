import { describe, expect, it } from "vitest";
import { canonicalArticleUrl, dedupeDisplayArticles } from "./articleDedup";

const publishedAt = new Date("2026-08-25T00:00:00.000Z");

describe("article display deduplication", () => {
  it("removes query-parameter URL duplicates and normalized title duplicates", () => {
    const result = dedupeDisplayArticles([
      { title: "Official Update", sourceUrl: "https://www.example.com/news/update?utm_source=rss", publishedAt },
      { title: "OFFICIAL UPDATE", sourceUrl: "https://example.com/news/update", publishedAt },
      { title: "Distinct Article", sourceUrl: "https://example.com/news/distinct", publishedAt },
    ]);
    expect(result.map((item) => item.title)).toEqual(["Official Update", "Distinct Article"]);
    expect(canonicalArticleUrl("https://www.example.com/news/update?utm_source=rss")).toBe("https://example.com/news/update");
  });
});
