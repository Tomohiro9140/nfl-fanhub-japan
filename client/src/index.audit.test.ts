import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");

describe("browser icon branding", () => {
  it("uses the FAN/HUB field mark for browser and Apple touch icons", () => {
    expect(indexHtml).toContain("fan-hub-field-mark_2da1d2c0.png?v=20260817");
    expect(indexHtml).toContain('rel="apple-touch-icon"');
    expect(indexHtml).not.toContain("nfl-fan-hub-logo_44c04145.png");
  });
});
