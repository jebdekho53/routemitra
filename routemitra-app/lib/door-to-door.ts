// Phase 11 — stitch local cab legs onto each intercity option to get a real
// home-to-address total. Best-effort: needs geocoding to resolve, and hub
// coordinates from lib/city-hubs. Returns options unchanged if it can't.

import type { RouteOption, DoorToDoor, Mode } from "@/types/route";
import { geocode, haversineKm, type GeoPoint } from "@/lib/geo";
import { allHubs, type Hub } from "@/lib/city-hubs";
import { estimateLocalLeg } from "@/lib/adapters/local";

// boarding / check-in margin before the line-haul departs
const BUFFER_MIN: Record<Mode, number> = { flight: 90, train: 20, bus: 15 };

// Only ~30 cities have a hub (lib/city-hubs.ts) — a home address far from all
// of them (e.g. Leh, a hill town) still finds "nearest", just a very distant
// one. Presenting that as a normal "Uber (est.)" leg is actively misleading
// (a 490 km, 20-hour "cab ride" isn't a real Uber option) — past this radius
// there's no local cab, so don't attach a door-to-door total at all.
const MAX_LOCAL_KM = 80;

function nearestHub(
  point: GeoPoint,
  mode: Mode,
): { hub: Hub; km: number } | null {
  let best: Hub | null = null;
  let bestKm = Infinity;
  for (const { hub } of allHubs(mode)) {
    const km = haversineKm(point, hub);
    if (km < bestKm) {
      bestKm = km;
      best = hub;
    }
  }
  return best ? { hub: best, km: bestKm } : null;
}

export async function attachDoorToDoor(
  options: RouteOption[],
  originAddr: string,
  destinationAddr: string,
): Promise<RouteOption[]> {
  if (!originAddr || !destinationAddr || options.length === 0) return options;

  const [origin, destination] = await Promise.all([
    geocode(originAddr),
    geocode(destinationAddr),
  ]);
  if (!origin || !destination) {
    console.warn("[d2d] geocode miss:", { originAddr, destinationAddr });
    return options;
  }

  return options.map((opt) => {
    const originHub = nearestHub(origin, opt.mode);
    const destHub = nearestHub(destination, opt.mode);
    if (!originHub || !destHub) return opt;
    if (originHub.km > MAX_LOCAL_KM || destHub.km > MAX_LOCAL_KM) return opt;

    const access = estimateLocalLeg(origin, originAddr, originHub.hub, "access");
    const egress = estimateLocalLeg(destination, destinationAddr, destHub.hub, "egress");
    const buffer_min = BUFFER_MIN[opt.mode];

    const d2d: DoorToDoor = {
      origin: origin.label,
      destination: destination.label,
      access,
      line_haul: {
        price: opt.price,
        duration_min: opt.duration_min,
        label: `${opt.operator} (${opt.mode})`,
      },
      egress,
      buffer_min,
      total_price: access.price + opt.price + egress.price,
      total_duration_min:
        access.duration_min +
        buffer_min +
        opt.duration_min +
        egress.duration_min,
    };
    return { ...opt, door_to_door: d2d };
  });
}
