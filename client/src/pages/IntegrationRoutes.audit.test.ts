import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("ATLAS and FIELDLINE integration routes", () => {
  it("registers both public reference routes and menu labels", () => {
    expect(appSource).toContain('path="/atlas"');
    expect(appSource).toContain('path="/fieldline"');
    expect(homeSource).toContain('ATLAS');
    expect(homeSource).toContain('FIELDLINE');
  });
});
