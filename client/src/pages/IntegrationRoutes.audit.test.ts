import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const atlasSource = readFileSync(resolve(process.cwd(), "client/src/pages/Atlas.tsx"), "utf8");
const fieldlineSource = readFileSync(resolve(process.cwd(), "client/src/pages/Fieldline.tsx"), "utf8");
const embeddedNavSource = readFileSync(resolve(process.cwd(), "client/src/components/EmbeddedAppNav.tsx"), "utf8");
const indexHtml = readFileSync(resolve(process.cwd(), "client/index.html"), "utf8");

describe("ATLAS and FIELDLINE integration routes", () => {
  it("registers both public reference routes and opens the original apps through their permanent URLs", () => {
    expect(appSource).toContain('path="/atlas"');
    expect(appSource).toContain('path="/fieldline"');
    expect(homeSource).toContain('ATLAS');
    expect(homeSource).toContain('FIELDLINE');
    expect(atlasSource).toContain('https://nflplayeratl-tus9mrqw.manus.space/');
    expect(fieldlineSource).toContain('https://nflteamstats-4q87cnse.manus.space/');
    expect(atlasSource).toContain('EmbeddedAppNav current="ATLAS"');
    expect(fieldlineSource).toContain('EmbeddedAppNav current="FIELDLINE"');
    expect(atlasSource).toContain('window.location.replace(originalAtlasUrl)');
    expect(fieldlineSource).toContain('window.location.replace(originalFieldlineUrl)');
    expect(atlasSource).toContain('OPEN ATLAS DIRECTLY');
    expect(fieldlineSource).toContain('OPEN FIELDLINE DIRECTLY');
    expect(atlasSource).not.toContain('<iframe');
    expect(fieldlineSource).not.toContain('<iframe');
    expect(indexHtml).toContain('rel="preconnect" href="https://nflplayeratl-tus9mrqw.manus.space"');
    expect(indexHtml).toContain('rel="preconnect" href="https://nflteamstats-4q87cnse.manus.space"');
    expect(embeddedNavSource).toContain('Menu');
    expect(embeddedNavSource).toContain('HOME');
    expect(embeddedNavSource).toContain('ATLAS');
    expect(embeddedNavSource).toContain('FIELDLINE');
  });
});
