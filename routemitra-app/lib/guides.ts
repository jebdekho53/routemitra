// Data for the /travel/[slug] door-to-door route guides — SEO content pages
// that answer "how do I actually get from X to Y, door to door".
// Built from sample data + city-hub coordinates; all figures are estimates.

import type { RouteOption, Mode } from "@/types/route";
import { getSampleOptions, listSampleRoutes } from "@/lib/sample-data";
import { CITY_HUBS, hubForCity } from "@/lib/city-hubs";
import { haversineKm } from "@/lib/geo";
import { toSlug, fromSlug } from "@/lib/routes";

const HUB_CITIES = new Set(Object.keys(CITY_HUBS));

/** Both directions of every sample route where both cities have hub data. */
export function guideSlugs(): string[] {
  const set = new Set<string>();
  for (const { from, to } of listSampleRoutes()) {
    if (HUB_CITIES.has(from.toLowerCase()) && HUB_CITIES.has(to.toLowerCase())) {
      set.add(toSlug(from, to));
      set.add(toSlug(to, from));
    }
  }
  return [...set];
}

export { fromSlug as guideFromSlug };

// --- local (cab) leg estimate -------------------------------------------------

const CAB_BASE = 50;
const CAB_PER_KM = 15;
const CAB_MIN = 80;
const KMPH = 24;
const roadKm = (straight: number) => straight * 1.3;

export interface LocalLegEstimate {
  hubName: string;
  hubCode: string;
  distanceKm: number;
  price: number; // one-way cab, INR
  durationMin: number;
  central: boolean; // hub is in/near the city core (train / bus stands)
}

/** Rough cab leg from the city core (proxied by the train station) to the
 *  hub for `mode`. Flight hubs get a real distance-based figure; central
 *  hubs get a flat "short hop" estimate. */
export function typicalLocalLeg(
  city: string,
  mode: Mode,
): LocalLegEstimate | null {
  const hub = hubForCity(city, mode);
  const centre = hubForCity(city, "train");
  if (!hub || !centre) return null;

  const km = roadKm(haversineKm(centre, hub));
  const central = mode !== "flight" && km < 6;
  const price = central
    ? 120
    : Math.max(CAB_MIN, Math.round(CAB_BASE + CAB_PER_KM * km));
  const durationMin = central
    ? 15
    : Math.max(10, Math.round((km / KMPH) * 60));

  return {
    hubName: hub.name,
    hubCode: hub.code,
    distanceKm: Math.round(km * 10) / 10,
    price,
    durationMin,
    central,
  };
}

// --- assembled guide data ---------------------------------------------------

const BUFFER_MIN: Record<Mode, number> = { flight: 90, train: 20, bus: 15 };

export interface GuideOption {
  option: RouteOption;
  fromLeg: LocalLegEstimate | null;
  toLeg: LocalLegEstimate | null;
  bufferMin: number;
  totalPrice: number | null; // door-to-door
  totalMin: number | null;
}

export interface GuideData {
  from: string;
  to: string;
  distanceKm: number | null;
  options: GuideOption[]; // cheapest-first
  cheapest: GuideOption | null;
  fastest: GuideOption | null;
  bestDoorToDoor: GuideOption | null;
  byMode: Record<Mode, GuideOption[]>;
}

export function guideData(from: string, to: string): GuideData | null {
  const opts = getSampleOptions(from, to);
  if (opts.length === 0) return null;

  const fc = from.toLowerCase();
  const tc = to.toLowerCase();

  const options: GuideOption[] = [...opts]
    .sort((a, b) => a.price - b.price)
    .map((option) => {
      const fromLeg = typicalLocalLeg(fc, option.mode);
      const toLeg = typicalLocalLeg(tc, option.mode);
      const bufferMin = BUFFER_MIN[option.mode];
      const totalPrice =
        fromLeg && toLeg ? fromLeg.price + option.price + toLeg.price : null;
      const totalMin =
        fromLeg && toLeg
          ? fromLeg.durationMin +
            bufferMin +
            option.duration_min +
            toLeg.durationMin
          : null;
      return { option, fromLeg, toLeg, bufferMin, totalPrice, totalMin };
    });

  const byMode: Record<Mode, GuideOption[]> = { bus: [], train: [], flight: [] };
  for (const g of options) byMode[g.option.mode].push(g);

  const pick = (
    arr: GuideOption[],
    better: (a: GuideOption, b: GuideOption) => boolean,
  ) => arr.reduce<GuideOption | null>((a, b) => (!a || better(b, a) ? b : a), null);

  const cheapest = pick(options, (a, b) => a.option.price < b.option.price);
  const fastest = pick(
    options,
    (a, b) => a.option.duration_min < b.option.duration_min,
  );
  const bestDoorToDoor = pick(
    options.filter((g) => g.totalPrice != null),
    (a, b) => (a.totalPrice ?? Infinity) < (b.totalPrice ?? Infinity),
  );

  const fh = hubForCity(fc, "train");
  const th = hubForCity(tc, "train");
  const distanceKm = fh && th ? Math.round(haversineKm(fh, th)) : null;

  return {
    from,
    to,
    distanceKm,
    options,
    cheapest,
    fastest,
    bestDoorToDoor,
    byMode,
  };
}

/** A few other guides to cross-link to, sharing a city with this route. */
export function relatedGuideSlugs(from: string, to: string, limit = 6): string[] {
  const self = new Set([toSlug(from, to), toSlug(to, from)]);
  const f = from.toLowerCase();
  const t = to.toLowerCase();
  return guideSlugs()
    .filter((s) => !self.has(s))
    .filter((s) => s.startsWith(`${f}-to-`) || s.includes(`-to-${f}`) || s.startsWith(`${t}-to-`) || s.includes(`-to-${t}`))
    .slice(0, limit);
}
