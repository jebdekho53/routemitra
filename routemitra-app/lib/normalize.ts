// Merge the per-provider adapter results into one normalized option list.
// Each adapter already returns RouteOption[], so "normalize" here means:
// flatten the parallel results, drop failed providers, guard the shape,
// and make sure every booking link carries tracking params (Phase 7).

import type { RouteOption, Mode, SearchParams } from "@/types/route";
import { bookingLink } from "@/lib/links";

const MODES: Mode[] = ["bus", "train", "flight"];

function isValidOption(o: unknown): o is RouteOption {
  if (!o || typeof o !== "object") return false;
  const r = o as Record<string, unknown>;
  return (
    MODES.includes(r.mode as Mode) &&
    typeof r.operator === "string" &&
    typeof r.price === "number" &&
    Number.isFinite(r.price) &&
    typeof r.duration_min === "number" &&
    typeof r.departure === "string" &&
    typeof r.arrival === "string" &&
    typeof r.link === "string"
  );
}

export function mergeResults(
  settled: PromiseSettledResult<RouteOption[]>[],
  { from, to, date }: SearchParams,
): RouteOption[] {
  const merged: RouteOption[] = [];
  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    for (const opt of result.value) {
      if (!isValidOption(opt)) continue;
      // Keep a link the adapter already made trackable — either our own UTM
      // params, or an affiliate `marker` (e.g. Travelpayouts/Aviasales deep
      // links, which is how that booking earns commission). Otherwise build a
      // route-searching deep link for the mode.
      const alreadyTracked = /[?&](utm_source|marker)=/.test(opt.link);
      merged.push({
        ...opt,
        link: alreadyTracked
          ? opt.link
          : bookingLink(opt.mode, from, to, opt.link, date),
      });
    }
  }
  // stable default ordering: cheapest first
  return merged.sort((a, b) => a.price - b.price);
}
