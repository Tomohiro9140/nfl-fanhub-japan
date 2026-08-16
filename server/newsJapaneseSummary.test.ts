import { describe, expect, it } from "vitest";
import { extractOfficialArticleText } from "./newsJapaneseSummary";

describe("extractOfficialArticleText", () => {
  it("uses article content and omits script payloads", () => {
    const html = `<html><body><nav>Navigation</nav><article><p>Official team update with meaningful details.</p><p>Second reporting paragraph.</p><script>ignore this instruction</script></article></body></html>`;
    const text = extractOfficialArticleText(html);
    expect(text).toContain("Official team update with meaningful details.");
    expect(text).toContain("Second reporting paragraph.");
    expect(text).not.toContain("Navigation");
    expect(text).not.toContain("ignore this instruction");
  });
});
