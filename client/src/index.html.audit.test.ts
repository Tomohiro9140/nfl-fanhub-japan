import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const indexHtml = readFileSync(fileURLToPath(new URL("../index.html", import.meta.url)), "utf8");

describe("共有メタデータ", () => {
  it("非wwwを正規URLとしてcanonical・Open Graph・X Cardを統一する", () => {
    const canonicalUrl = "https://nfl-fanhub-japan.com/";
    const ogImageUrl =
      "https://nfl-fanhub-japan.com/manus-storage/nfl-fan-hub-japan-og_ed00cd6c.jpg";

    expect(indexHtml).toContain(`<link rel="canonical" href="${canonicalUrl}" />`);
    expect(indexHtml).toContain(`<meta property="og:url" content="${canonicalUrl}" />`);
    expect(indexHtml).toContain(`<meta property="og:image" content="${ogImageUrl}" />`);
    expect(indexHtml).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(indexHtml).toContain(`<meta name="twitter:image" content="${ogImageUrl}" />`);
  });
});
