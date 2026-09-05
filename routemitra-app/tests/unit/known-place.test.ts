import { describe, it, expect } from "vitest";
import { isKnownPlace } from "@/lib/known-place";

describe("isKnownPlace", () => {
  it("recognizes districts, stations and airports", () => {
    expect(isKnownPlace("Shillong")).toBe(true);
    expect(isKnownPlace("Guwahati")).toBe(true);
    expect(isKnownPlace("Madurai")).toBe(true);
    expect(isKnownPlace("Chandigarh")).toBe(true);
  });

  it("recognizes a place through a nickname/IATA code", () => {
    expect(isKnownPlace("Bombay")).toBe(true);
    expect(isKnownPlace("BLR")).toBe(true);
  });

  it("returns false for a town that's neither a district nor has its own station/airport", () => {
    expect(isKnownPlace("Rameswaram")).toBe(false);
    expect(isKnownPlace("Manali")).toBe(false);
  });

  it("returns false for gibberish", () => {
    expect(isKnownPlace("Atlantis")).toBe(false);
    expect(isKnownPlace("")).toBe(false);
  });
});
