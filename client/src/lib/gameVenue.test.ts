import { describe, expect, it } from "vitest";
import { compactVenue, confirmedVenue } from "./gameVenue";

describe("confirmedVenue", () => {
  it("hides NFL placeholder venues", () => {
    expect(confirmedVenue("TBA")).toBeNull();
    expect(confirmedVenue(" tbd ")).toBeNull();
    expect(confirmedVenue("To Be Announced")).toBeNull();
  });

  it("keeps an actual venue name", () => {
    expect(confirmedVenue("Highmark Stadium")).toBe("Highmark Stadium");
  });

  it("shortens only common venue suffixes for compact mobile display", () => {
    expect(compactVenue("Highmark Stadium")).toBe("Highmark Stdm.");
    expect(compactVenue("Lincoln Financial Field")).toBe("Lincoln Financial Field");
    expect(compactVenue("TBA")).toBeNull();
  });
});
