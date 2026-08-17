import { describe, expect, it } from "vitest";
import { externalRssSummaryReference, extractOfficialArticleText } from "./newsJapaneseSummary";

describe("extractOfficialArticleText", () => {
  it("uses article content and omits script payloads", () => {
    const html = `<html><body><nav>Navigation</nav><article><p>Official team update with meaningful details.</p><p>Second reporting paragraph.</p><script>ignore this instruction</script></article></body></html>`;
    const text = extractOfficialArticleText(html);
    expect(text).toContain("Official team update with meaningful details.");
    expect(text).toContain("Second reporting paragraph.");
    expect(text).not.toContain("Navigation");
    expect(text).not.toContain("ignore this instruction");
  });

  it("keeps readable article text while removing page chrome", () => {
    const html = `<article><p>First official paragraph.</p><p>Second official paragraph.</p></article><footer>Footer</footer>`;
    expect(extractOfficialArticleText(html)).toBe("First official paragraph. Second official paragraph.");
  });

  it("uses only an already-cached PFT or CBS RSS brief for external summarization", () => {
    const pft = { title: "Bills receiver returns to practice", summary: "The report says the receiver was back at the team facility on Monday.", sourceUrl: "https://www.nbcsports.com/nfl/profootballtalk/example", sourceKind: "pft" as const };
    expect(externalRssSummaryReference(pft)?.text).toContain("External RSS description");
    expect(externalRssSummaryReference({ ...pft, sourceKind: "team_official" })).toBeUndefined();
  });
});
