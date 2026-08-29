import { describe, it, expect } from "vitest";
import { mergeResults } from "@/lib/normalize";
import type { RouteOption, SearchParams } from "@/types/route";

const params: SearchParams = { from: "Pune", to: "Bengaluru", date: null };

function ok(value: RouteOption[]): PromiseSettledResult<RouteOption[]> {
  return { status: "fulfilled", value };
}
function rejected(): PromiseSettledResult<RouteOption[]> {
  return { status: "rejected", reason: new Error("provider down") };
}

const bus: RouteOption = {
  mode: "bus",
  operator: "VRL",
  price: 950,
  duration_min: 660,
  departure: "20:30",
  arrival: "07:30",
  link: "https://www.redbus.in/",
};
const flight: RouteOption = {
  mode: "flight",
  operator: "IndiGo",
  price: 2899,
  duration_min: 80,
  departure: "14:20",
  arrival: "15:40",
  link: "https://www.cleartrip.com/?utm_source=routemitra",
};

describe("mergeResults", () => {
  it("flattens fulfilled results and skips rejected providers", () => {
    const out = mergeResults([ok([bus]), rejected(), ok([flight])], params);
    expect(out).toHaveLength(2);
  });

  it("sorts cheapest first", () => {
    const out = mergeResults([ok([flight, bus])], params);
    expect(out.map((o) => o.price)).toEqual([950, 2899]);
  });

  it("adds tracking params to links that lack them", () => {
    const [b] = mergeResults([ok([bus])], params);
    expect(b.link).toContain("utm_source=routemitra");
    expect(b.link).toContain("utm_campaign=bus_book");
    expect(b.link).toContain("ref=routemitra");
  });

  it("leaves already-tracked links untouched", () => {
    const [f] = mergeResults([ok([flight])], params);
    expect(f.link).toBe("https://www.cleartrip.com/?utm_source=routemitra");
  });

  it("drops malformed options", () => {
    const bad = { mode: "boat", operator: "X" } as unknown as RouteOption;
    const out = mergeResults([ok([bad, bus])], params);
    expect(out).toHaveLength(1);
    expect(out[0].mode).toBe("bus");
  });
});
