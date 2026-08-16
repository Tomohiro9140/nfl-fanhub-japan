import { describe, expect, it } from "vitest";
import { confirmedVenue } from "./gameVenue";

describe("confirmedVenue", () => {
  it("hides NFL placeholder venues", () => {
    expect(confirmedVenue("TBA")).toBeNull();
    expect(confirmedVenue(" tbd ")).toBeNull();
    expect(confirmedVenue("To Be Announced")).toBeNull();
  });

  it("keeps an actual venue name", () => {
    expect(confirmedVenue("Highmark Stadium")).toBe("Highmark Stadium");
  });
});
