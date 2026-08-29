import { describe, it, expect } from "vitest";
import { toSlug, fromSlug, popularRouteSlugs } from "@/lib/routes";
import { searchCacheKey } from "@/lib/cache";

describe("route slugs", () => {
  it("round-trips city pairs", () => {
    expect(toSlug("Pune", "Bengaluru")).toBe("pune-to-bengaluru");
    expect(fromSlug("pune-to-bengaluru")).toEqual({
      from: "Pune",
      to: "Bengaluru",
    });
  });

  it("handles multi-word cities", () => {
    expect(fromSlug("new-delhi-to-goa")).toEqual({
      from: "New Delhi",
      to: "Goa",
    });
  });

  it("rejects malformed slugs", () => {
    expect(fromSlug("garbage")).toBeNull();
  });

  it("popular slugs cover both directions and are unique", () => {
    const slugs = popularRouteSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toContain("pune-to-bengaluru");
    expect(slugs).toContain("bengaluru-to-pune");
  });
});

describe("searchCacheKey", () => {
  it("is stable and case-insensitive", () => {
    expect(searchCacheKey("Pune", "Bengaluru", "2026-09-01")).toBe(
      searchCacheKey("  pune ", "BENGALURU", "2026-09-01"),
    );
  });

  it("varies with door-to-door addresses", () => {
    const base = searchCacheKey("Delhi", "Varanasi", null);
    const d2d = searchCacheKey("Delhi", "Varanasi", null, "Indirapuram", "Lanka");
    expect(d2d).not.toBe(base);
    expect(d2d).toContain("d2d");
  });
});
