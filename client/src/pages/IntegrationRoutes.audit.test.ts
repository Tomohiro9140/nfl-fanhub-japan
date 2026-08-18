import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const atlasSource = readFileSync(resolve(process.cwd(), "client/src/pages/Atlas.tsx"), "utf8");
const fieldlineSource = readFileSync(resolve(process.cwd(), "client/src/pages/Fieldline.tsx"), "utf8");

describe("ATLAS and FIELDLINE integration routes", () => {
  it("registers both public reference routes and preserves the original apps behind them", () => {
    expect(appSource).toContain('path="/atlas"');
    expect(appSource).toContain('path="/fieldline"');
    expect(homeSource).toContain('ATLAS');
    expect(homeSource).toContain('FIELDLINE');
    expect(atlasSource).toContain('https://3000-ituqp183l2vhyriklj7k9-6f5ac53f.sg1.manus.computer/');
    expect(fieldlineSource).toContain('https://3000-im4jq1epwl9r74izjlp1y-9b5a11d5.sg1.manus.computer/');
  });
});
