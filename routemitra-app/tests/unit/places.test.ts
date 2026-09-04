import { describe, it, expect } from "vitest";
import { toStationCode, resolveStation } from "@/lib/stations";
import { toIata } from "@/lib/iata";
import { DISTRICT_HUBS } from "@/lib/district-hubs";

describe("place resolution", () => {
  it("resolves a direct city to its own station / airport", () => {
    expect(toStationCode("Lucknow")).toBe("LKO");
    expect(toIata("Mumbai")).toBe("BOM");
  });

  it("is case- and whitespace-insensitive", () => {
    expect(toStationCode("  bengaluru ")).toBe("SBC");
    expect(toIata("NEW DELHI")).toBe("DEL");
  });

  it("resolves a district via the district-hub fallback", () => {
    // not in STATIONS/IATA directly — comes from DISTRICT_HUBS
    expect(toStationCode("Rae Bareli")).toBe("RBL"); // its own IR station
    expect(toIata("Rae Bareli")).toBe("LKO"); // nearest airport: Lucknow
    expect(toStationCode("Hardoi")).toBe("HRI");
  });

  it("returns null for an unknown place", () => {
    expect(toStationCode("Atlantis")).toBeNull();
    expect(toIata("Narnia")).toBeNull();
  });

  it("every district hub row has at least one of station / iata", () => {
    for (const [name, hub] of Object.entries(DISTRICT_HUBS)) {
      expect(hub.station || hub.iata, name).toBeTruthy();
    }
  });

  it("flags a proxy station with viaCity, but not a place's own station", () => {
    // Rae Bareli matched its OWN station (tier 1) — no proxy caveat
    expect(resolveStation("Rae Bareli")).toEqual({ code: "RBL" });
    // Bokaro has no station of its own in the registry — nearest is Ranchi
    const bokaro = resolveStation("Bokaro");
    expect(bokaro?.code).toBe("RNC");
    expect(bokaro?.viaCity).toBe("Ranchi");
    // a direct city (in STATIONS) never carries a viaCity
    expect(resolveStation("Ajmer")).toEqual({ code: "AII" });
  });
});
