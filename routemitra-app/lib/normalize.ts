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
      merged.push({
        ...opt,
        link: /[?&]utm_source=/.test(opt.link)
          ? opt.link
          : bookingLink(opt.mode, from, to, opt.link, date),
      });
    }
  }
  // stable default ordering: cheapest first
  return merged.sort((a, b) => a.price - b.price);
}
