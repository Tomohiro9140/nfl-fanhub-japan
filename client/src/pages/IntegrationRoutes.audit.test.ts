import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const atlasSource = readFileSync(resolve(process.cwd(), "client/src/pages/Atlas.tsx"), "utf8");
const fieldlineSource = readFileSync(resolve(process.cwd(), "client/src/pages/Fieldline.tsx"), "utf8");

describe("ATLAS and FIELDLINE integration routes", () => {
  it("registers both public reference routes and preserves the original apps behind permanent URLs", () => {
    expect(appSource).toContain('path="/atlas"');
    expect(appSource).toContain('path="/fieldline"');
    expect(homeSource).toContain('ATLAS');
    expect(homeSource).toContain('FIELDLINE');
    expect(atlasSource).toContain('https://nflplayeratl-tus9mrqw.manus.space/');
    expect(fieldlineSource).toContain('https://nflteamstats-4q87cnse.manus.space/');
    expect(atlasSource).toContain('FAN/HUB HOME');
    expect(fieldlineSource).toContain('FAN/HUB HOME');
    expect(atlasSource).toContain('onLoad={() => setIsLoaded(true)}');
    expect(fieldlineSource).toContain('onLoad={() => setIsLoaded(true)}');
  });
});
