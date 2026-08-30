import type { RouteOption } from "@/types/route";

export interface ResultMeta {
  count: number;
  minPrice: number;
  maxPrice: number;
  minDur: number;
  maxDur: number;
  cheapest: RouteOption | null;
  fastest: RouteOption | null;
  bestValue: RouteOption | null;
}

export function computeMeta(options: RouteOption[]): ResultMeta {
  if (options.length === 0) {
    return {
      count: 0,
      minPrice: 0,
      maxPrice: 0,
      minDur: 0,
      maxDur: 0,
      cheapest: null,
      fastest: null,
      bestValue: null,
    };
  }
  const cheapest = options.reduce((a, b) => (a.price <= b.price ? a : b));
  const fastest = options.reduce((a, b) =>
    a.duration_min <= b.duration_min ? a : b,
  );
  const prices = options.map((o) => o.price);
  const durs = options.map((o) => o.duration_min);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDur = Math.min(...durs);
  const maxDur = Math.max(...durs);

  // best value = lowest normalised (price + time) score, excluding the two
  // options that already carry a headline tag
  const span = (v: number, lo: number, hi: number) =>
    hi > lo ? (v - lo) / (hi - lo) : 0;
  let bestValue: RouteOption | null = null;
  let bestScore = Infinity;
  for (const o of options) {
    if (o === cheapest || o === fastest) continue;
    const score =
      span(o.price, minPrice, maxPrice) * 0.6 +
      span(o.duration_min, minDur, maxDur) * 0.4;
    if (score < bestScore) {
      bestScore = score;
      bestValue = o;
    }
  }

  return {
    count: options.length,
    minPrice,
    maxPrice,
    minDur,
    maxDur,
    cheapest,
    fastest,
    bestValue,
  };
}

export function tagsFor(opt: RouteOption, meta: ResultMeta): string[] {
  const t: string[] = [];
  if (opt === meta.cheapest) t.push("Cheapest");
  if (opt === meta.fastest) t.push("Fastest");
  if (opt === meta.bestValue) t.push("Best value");
  return t;
}
