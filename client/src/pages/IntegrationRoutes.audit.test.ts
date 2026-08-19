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
  it("registers both public reference routes and renders the native ATLAS route without restoring the broken iframe flow", () => {
    expect(appSource).toContain('path="/atlas"');
    expect(appSource).toContain('path="/fieldline"');
    expect(homeSource).toContain('ATLAS');
    expect(homeSource).toContain('FIELDLINE');
    expect(fieldlineSource).toContain('https://nflteamstats-4q87cnse.manus.space/');
    expect(atlasSource).toContain('atlas-shell');
    expect(atlasSource).toContain('atlas-display');
    expect(fieldlineSource).toContain('EmbeddedAppNav current="FIELDLINE"');
    expect(atlasSource).toContain('trpc.atlas.search.useQuery');
    expect(atlasSource).toContain('trpc.atlas.profile.useQuery');
    expect(atlasSource).toContain('trpc.atlas.career.useQuery');
    expect(atlasSource).toContain('trpc.atlas.awards.useQuery');
    expect(atlasSource).toContain('trpc.atlas.stats.useQuery');
    expect(atlasSource).toContain('trpc.atlas.contracts.useQuery');
    expect(atlasSource).toContain('キャリア');
    expect(atlasSource).toContain('契約情報');
    expect(atlasSource).toContain('NFL PLAYER');
    expect(atlasSource).not.toContain('window.location.replace');
    expect(atlasSource).not.toContain('nflplayeratl-tus9mrqw.manus.space');
    expect(fieldlineSource).toContain('window.location.replace(originalFieldlineUrl)');
    expect(fieldlineSource).toContain('OPEN FIELDLINE DIRECTLY');
    expect(atlasSource).not.toContain('<iframe');
    expect(fieldlineSource).not.toContain('<iframe');
    expect(indexHtml).not.toContain('nflplayeratl-tus9mrqw.manus.space');
    expect(indexHtml).toContain('rel="preconnect" href="https://nflteamstats-4q87cnse.manus.space"');
    expect(embeddedNavSource).toContain('Menu');
    expect(embeddedNavSource).toContain('HOME');
    expect(embeddedNavSource).toContain('ATLAS');
    expect(embeddedNavSource).toContain('FIELDLINE');
  });
});
