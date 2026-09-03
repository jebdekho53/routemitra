// Sample data has 2–4 options per route — too thin for the departure/arrival
// time filters to feel useful. densify() pads each mode that ALREADY appears
// in a route with a realistic spread of extra departures across the day.
//
// Deterministic: seeded from the route key, so SSR and the client render the
// exact same list (no hydration mismatch) and reloads are stable. Curated
// options are kept as-is; synthesized ones are marked indicative.

import type { RouteOption, Mode } from "@/types/route";

// tiny seeded PRNG (mulberry32)
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedOf(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const BUS_OPS = [
  "IntrCity SmartBus (AC Sleeper)",
  "Zingbus Plus (AC Sleeper)",
  "NueGo Electric (AC Seater)",
  "VRL Travels (AC Sleeper)",
  "Orange Tours (AC Sleeper)",
  "SRS Travels (AC Seater)",
  "Kaveri Travels (Non-AC Sleeper)",
  "Sharma Transports (AC Seater)",
  "Parveen Travels (AC Sleeper)",
];
const TRAIN_TYPES = [
  "SF Express",
  "Superfast",
  "Intercity Express",
  "Express",
  "Garib Rath",
  "Duronto",
];
const AIRLINES = [
  ["IndiGo", "6E"],
  ["Air India", "AI"],
  ["Akasa Air", "QP"],
  ["SpiceJet", "SG"],
  ["Vistara", "UK"],
];

// spread of departure hours per mode — buses skew overnight, flights all-day,
// each list has an early-hours slot so the 00–06 filter isn't dead
const DEP_HOURS: Record<Mode, number[]> = {
  bus: [5, 6, 14, 16, 19, 20, 21, 22, 23],
  train: [2, 5, 7, 11, 14, 16, 20, 23],
  flight: [1, 6, 8, 10, 12, 14, 16, 18, 20, 21],
};
const TARGET: Record<Mode, number> = { bus: 7, train: 6, flight: 6 };

const hhmm = (mins: number) => {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export function densify(
  base: RouteOption[],
  from: string,
  to: string,
): RouteOption[] {
  if (base.length === 0) return base;
  const rand = rng(seedOf(`${from}|${to}`.toLowerCase()));
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const jitter = (v: number, pct: number) =>
    Math.round(v * (1 + (rand() * 2 - 1) * pct));

  const out: RouteOption[] = [...base];

  for (const mode of ["bus", "train", "flight"] as Mode[]) {
    const sameMode = base.filter((o) => o.mode === mode);
    if (sameMode.length === 0) continue; // route doesn't serve this mode — leave it

    const proto = sameMode[0];
    const medianPrice =
      [...sameMode].sort((a, b) => a.price - b.price)[
        Math.floor(sameMode.length / 2)
      ].price;
    const medianDur =
      [...sameMode].sort((a, b) => a.duration_min - b.duration_min)[
        Math.floor(sameMode.length / 2)
      ].duration_min;

    const used = new Set(sameMode.map((o) => o.departure));
    const hours = [...DEP_HOURS[mode]].sort(() => rand() - 0.5);
    let added = 0;
    const need = TARGET[mode] - sameMode.length;

    for (const h of hours) {
      if (added >= need) break;
      const dep = h * 60 + (rand() < 0.5 ? 0 : rand() < 0.5 ? 15 : 30);
      const depStr = hhmm(dep);
      if (used.has(depStr)) continue;
      used.add(depStr);

      const dur = Math.max(30, jitter(medianDur, 0.12));
      const price = Math.max(60, jitter(medianPrice, mode === "flight" ? 0.22 : 0.16));

      let operator: string;
      if (mode === "bus") operator = pick(BUS_OPS);
      else if (mode === "train") {
        const num = 10000 + Math.floor(rand() * 89999);
        operator = `${pick(["Sampark Kranti", "Rajya Rani", "Jan Shatabdi", "Humsafar", "Antyodaya", "Gatiman"])} ${pick(TRAIN_TYPES)} (${num})`;
      } else {
        const [name, code] = pick(AIRLINES);
        operator = `${name} ${code}-${1000 + Math.floor(rand() * 8999)}`;
      }

      out.push({
        mode,
        operator,
        price,
        duration_min: dur,
        departure: depStr,
        arrival: hhmm(toMin(depStr) + dur),
        link: proto.link,
        indicative: true,
        stops: mode === "flight" ? (rand() < 0.75 ? 0 : 1) : undefined,
        source: "sample",
      });
      added++;
    }
  }

  return out;
}
