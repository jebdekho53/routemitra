// Phase 11 — stitch local cab legs onto each intercity option to get a real
// home-to-address total. Best-effort: needs geocoding to resolve, and hub
// coordinates (lib/city-hubs for the ~30 curated metros, else a geocoded
// fallback so every district is covered). Returns options unchanged if it
// can't place a hub within a sane local-cab radius.

import type { RouteOption, DoorToDoor, Mode } from "@/types/route";
import { geocode, haversineKm, type GeoPoint } from "@/lib/geo";
import { allHubs, type Hub } from "@/lib/city-hubs";
import { estimateLocalLeg } from "@/lib/adapters/local";
import { resolveStation } from "@/lib/stations";
import { resolveAirport } from "@/lib/iata";

// boarding / check-in margin before the line-haul departs
const BUFFER_MIN: Record<Mode, number> = { flight: 90, train: 20, bus: 15 };
const MODES: Mode[] = ["bus", "train", "flight"];

// A home address far from every hub (e.g. Leh) still finds a "nearest" one,
// just a very distant one — presenting that as a normal "Uber (est.)" leg is
// misleading (a 490 km "cab ride" isn't real). Past this radius there's no
// local cab, so don't attach a door-to-door total at all.
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

// For districts/towns with no curated hub: anchor on the searched city's
// centre (geocoded) and name the hub from resolveStation/resolveAirport, so
// the cab leg is address -> local railhead rather than being skipped.
async function fallbackHub(city: string, mode: Mode): Promise<Hub | null> {
  if (!city.trim()) return null;
  const pt = await geocode(`${city}, India`);
  if (!pt) return null;
  let code = mode as string;
  let name = `${city} — nearest railhead`;
  if (mode === "flight") {
    const a = resolveAirport(city);
    if (a) {
      code = a.code;
      name = `${a.viaCity ?? city} airport`;
    }
  } else {
    const s = resolveStation(city);
    if (s) {
      code = s.code;
      name = `${s.viaCity ?? city} station`;
    }
  }
  return { code, name, lat: pt.lat, lon: pt.lon };
}

async function pickHub(
  point: GeoPoint,
  city: string,
  mode: Mode,
): Promise<{ hub: Hub; km: number } | null> {
  const curated = nearestHub(point, mode);
  if (curated && curated.km <= MAX_LOCAL_KM) return curated;
  const fb = await fallbackHub(city, mode);
  if (fb) {
    const km = haversineKm(point, fb);
    if (km <= MAX_LOCAL_KM) return { hub: fb, km };
  }
  return curated; // may be null or too-far — caller applies the cap again
}

export async function attachDoorToDoor(
  options: RouteOption[],
  originAddr: string,
  destinationAddr: string,
  fromCity = "",
  toCity = "",
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

  // hubs only depend on the two points + mode — resolve all three once
  const hubs = new Map<
    Mode,
    { o: { hub: Hub; km: number } | null; d: { hub: Hub; km: number } | null }
  >();
  await Promise.all(
    MODES.map(async (m) => {
      const [o, d] = await Promise.all([
        pickHub(origin, fromCity, m),
        pickHub(destination, toCity, m),
      ]);
      hubs.set(m, { o, d });
    }),
  );

  return options.map((opt) => {
    const { o: originHub, d: destHub } = hubs.get(opt.mode) ?? { o: null, d: null };
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
