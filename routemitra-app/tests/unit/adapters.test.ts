import { describe, it, expect } from "vitest";
import { searchBus } from "@/lib/adapters/bus";
import { searchTrain } from "@/lib/adapters/train";
import { searchFlight } from "@/lib/adapters/flight";
import type { SearchParams } from "@/types/route";

// No provider env vars set in tests => every adapter returns sample data
// filtered to its own mode.

const pb: SearchParams = { from: "Pune", to: "Bengaluru", date: null };
const reversed: SearchParams = { from: "Bengaluru", to: "Pune", date: null };
const unknown: SearchParams = { from: "Nowhere", to: "Elsewhere", date: null };

describe("adapters (sample-data fallback)", () => {
  it("bus adapter returns only bus options", async () => {
    const out = await searchBus(pb);
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((o) => o.mode === "bus")).toBe(true);
    expect(out.every((o) => o.source === "sample")).toBe(true);
  });

  it("train adapter returns only train options", async () => {
    const out = await searchTrain(pb);
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((o) => o.mode === "train")).toBe(true);
  });

  it("flight adapter returns only flight options", async () => {
    const out = await searchFlight(pb);
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((o) => o.mode === "flight")).toBe(true);
  });

  it("matches routes in either direction", async () => {
    const forward = await searchBus(pb);
    const back = await searchBus(reversed);
    expect(back.map((o) => o.operator).sort()).toEqual(
      forward.map((o) => o.operator).sort(),
    );
  });

  it("returns [] for an unknown route", async () => {
    expect(await searchBus(unknown)).toEqual([]);
    expect(await searchTrain(unknown)).toEqual([]);
    expect(await searchFlight(unknown)).toEqual([]);
  });

  it("every option has a well-formed shape", async () => {
    const out = await searchTrain(pb);
    for (const o of out) {
      expect(typeof o.price).toBe("number");
      expect(o.price).toBeGreaterThan(0);
      expect(o.departure).toMatch(/^\d{2}:\d{2}$/);
      expect(o.link).toMatch(/^https?:\/\//);
    }
  });
});
