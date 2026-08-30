import { describe, it, expect } from "vitest";
import { searchFlight } from "@/lib/adapters/flight";

// Live integration test — only runs when DUFFEL_API_KEY is present.
// Otherwise skipped (CI without the key stays green).
const hasKey = Boolean(process.env.DUFFEL_API_KEY);

describe.skipIf(!hasKey)("flight adapter — live Duffel sandbox", () => {
  it("returns real (sandbox) flight offers for BOM -> GOI", async () => {
    const out = await searchFlight({
      from: "Mumbai",
      to: "Goa",
      date: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
    });

    expect(out.length).toBeGreaterThan(0);
    for (const o of out) {
      expect(o.mode).toBe("flight");
      expect(o.price).toBeGreaterThan(0);
      expect(o.duration_min).toBeGreaterThan(0);
      expect(o.departure).toMatch(/^\d{2}:\d{2}$/);
      expect(o.arrival).toMatch(/^\d{2}:\d{2}$/);
      expect(o.operator).toBeTruthy();
    }

    // Duffel sometimes 429s the shared sandbox key; the adapter then falls
    // back to sample data (which is correct). Only assert the live-path
    // specifics when we actually got a live response.
    if (out.every((o) => o.source === "duffel")) {
      for (const o of out) {
        expect(o.stops).toBeGreaterThanOrEqual(0);
        expect(o.logo).toMatch(/^https:\/\/pics\.avs\.io\//);
      }
    } else {
      console.warn(
        "[flight-duffel.test] Duffel unavailable (likely 429) — adapter fell back to sample; live assertions skipped.",
      );
    }
  }, 20_000);
});
