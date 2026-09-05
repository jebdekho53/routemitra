import { describe, it, expect, vi } from "vitest";
import type { RouteOption } from "@/types/route";

const POINTS: Record<string, { lat: number; lon: number; label: string }> = {
  "near delhi": { lat: 28.6139, lon: 77.209, label: "Connaught Place, Delhi" },
  "near chandigarh": { lat: 30.74, lon: 76.79, label: "Sector 17, Chandigarh" },
  leh: { lat: 34.1642, lon: 77.5848, label: "Leh, Ladakh" },
};

vi.mock("@/lib/geo", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/geo")>();
  return {
    ...actual,
    geocode: vi.fn(async (q: string) => POINTS[q.toLowerCase()] ?? null),
  };
});

const { attachDoorToDoor } = await import("@/lib/door-to-door");

function trainOption(): RouteOption {
  return {
    mode: "train",
    operator: "Kalka Shatabdi (12005)",
    price: 195,
    duration_min: 195,
    departure: "17:15",
    arrival: "20:30",
    link: "https://example.com",
  };
}

describe("attachDoorToDoor", () => {
  it("attaches a door-to-door total when both addresses are near a hub", async () => {
    const [opt] = await attachDoorToDoor(
      [trainOption()],
      "near delhi",
      "near chandigarh",
    );
    expect(opt.door_to_door).toBeDefined();
    expect(opt.door_to_door!.total_price).toBeGreaterThan(opt.price);
  });

  it("does NOT attach a door-to-door total when the address is far from every hub", async () => {
    // Leh is ~490km from the nearest hub (Amritsar) — presenting that as a
    // normal "Uber (est.)" cab leg would be misleading, not a real option.
    const [opt] = await attachDoorToDoor(
      [trainOption()],
      "Leh",
      "near chandigarh",
    );
    expect(opt.door_to_door).toBeUndefined();
    expect(opt.price).toBe(195); // untouched intercity option
  });
});
