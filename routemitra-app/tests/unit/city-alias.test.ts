import { describe, it, expect } from "vitest";
import { canonicalCity } from "@/lib/city-alias";
import { getSampleOptions } from "@/lib/sample-data";

describe("canonicalCity", () => {
  it("maps common nicknames to the spelling the app keys data on", () => {
    expect(canonicalCity("Bombay")).toBe("Mumbai");
    expect(canonicalCity("Bangalore")).toBe("Bengaluru");
    expect(canonicalCity("Madras")).toBe("Chennai");
    expect(canonicalCity("Calcutta")).toBe("Kolkata");
    expect(canonicalCity("Vizag")).toBe("Visakhapatnam");
  });

  it("resolves 3-letter IATA codes to their city", () => {
    expect(canonicalCity("DEL")).toBe("Delhi");
    expect(canonicalCity("BOM")).toBe("Mumbai");
    expect(canonicalCity("BLR")).toBe("Bengaluru");
    expect(canonicalCity("del")).toBe("Delhi");
  });

  it("passes through a place it doesn't recognize", () => {
    expect(canonicalCity("  Pune ")).toBe("Pune");
    expect(canonicalCity("Rae Bareli")).toBe("Rae Bareli");
  });

  it("fixes the bus-alias mismatch: Bangalore now finds the same bus data as Bengaluru", () => {
    const canonical = getSampleOptions("Bengaluru", "Chennai").filter(
      (o) => o.mode === "bus",
    );
    const viaAlias = getSampleOptions(
      canonicalCity("Bangalore"),
      canonicalCity("Chennai"),
    ).filter((o) => o.mode === "bus");
    expect(canonical.length).toBeGreaterThan(0);
    expect(viaAlias.length).toBe(canonical.length);
  });
});
