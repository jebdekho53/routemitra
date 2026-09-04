import { describe, it, expect } from "vitest";
import { toStationCode } from "@/lib/stations";
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
});
