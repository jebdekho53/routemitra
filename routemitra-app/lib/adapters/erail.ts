// erail.in — unofficial, free "trains between stations" data. No key, no
// quota. It's a grey-area scrape of a public site: the response format can
// change and Vercel's egress IPs could get rate-limited or blocked with no
// warning. So it's gated behind TRAIN_ERAIL and every failure falls through
// to the next source. Meant as a bridge until the TripJack / TBO rail API is
// live. Fares aren't in the feed — they're estimated and flagged indicative.

import type { RouteOption } from "@/types/route";

const GET_TRAINS = "https://erail.in/rail/getTrains.aspx";

// Last erail outcome, for the /status page and log context. Per serverless
// instance (resets on cold start) — enough to spot a sustained outage.
export interface ErailHealth {
  at: string | null; // ISO of the last attempt
  ok: boolean | null; // did the last attempt yield >=1 row
  rows: number;
  note: string;
}
let health: ErailHealth = { at: null, ok: null, rows: 0, note: "no calls yet" };

export function erailHealth(): ErailHealth {
  return { ...health };
}
function record(ok: boolean, rows: number, note: string) {
  health = { at: new Date().toISOString(), ok, rows, note };
}

/** "05.00" | "5.0" -> minutes since midnight, or -1 */
function hhDotMm(s: string): number {
  const m = /^(\d{1,2})[.:](\d{1,2})$/.exec((s || "").trim());
  if (!m) return -1;
  const h = +m[1];
  const mm = +m[2];
  if (h > 23 || mm > 59) return -1;
  return h * 60 + mm;
}
const pad2 = (n: number) => String(n).padStart(2, "0");
const toClock = (min: number) => `${pad2(Math.floor(min / 60) % 24)}:${pad2(min % 60)}`;

// erail duration is also HH.MM but can exceed 24h ("17.40" = 17h 40m)
function durHhMm(s: string): number {
  const m = /^(\d{1,3})[.:](\d{1,2})$/.exec((s || "").trim());
  if (!m) return 0;
  return +m[1] * 60 + +m[2];
}

// crude class from the train name — enough for a fare estimate
function estimateFare(durationMin: number, name: string): number {
  const n = name.toUpperCase();
  // \b before SHATABDI so "JANSHATABDI" (a budget day train) doesn't match it
  const premium = /\b(RAJDHANI|SHATABDI|VANDE ?BHARAT|TEJAS|DURONTO|GATIMAAN|HUMSAFAR)\b/.test(n);
  const superfast = /\bSF\b|SUPERFAST|GARIB ?RATH|SAMPARK ?KRANTI|ANTYODAYA|JAN ?SHATABDI/.test(n);
  const perMin = premium ? 3.1 : superfast ? 1.35 : 1.0;
  return Math.min(4500, Math.max(120, Math.round(durationMin * perMin)));
}

/**
 * @param fromCode / toCode  IR station codes (NDLS, BCT …)
 * @param date  YYYY-MM-DD — when given, drops trains that don't run that weekday
 */
export async function erailTrains(
  fromCode: string,
  toCode: string,
  date: string | null,
): Promise<RouteOption[]> {
  const url = `${GET_TRAINS}?Station_From=${encodeURIComponent(fromCode)}&Station_To=${encodeURIComponent(toCode)}&DataSource=0&Language=0&Cache=true`;

  let body: string;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Referer: "https://erail.in/",
        Accept: "*/*",
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[train] erail HTTP ${res.status} for ${fromCode}-${toCode}`);
      record(false, 0, `HTTP ${res.status}`);
      return [];
    }
    body = await res.text();
  } catch (err) {
    const note = err instanceof Error ? err.name : "fetch error";
    console.error(`[train] erail fetch failed for ${fromCode}-${toCode}:`, err);
    record(false, 0, note);
    return [];
  }

  if (!body || !body.includes("^")) {
    // reachable but no usable payload — often an error page or a station typo
    console.warn(`[train] erail: empty/unparseable body for ${fromCode}-${toCode}`);
    record(false, 0, "empty body");
    return []; // no trains / error page
  }

  // weekday index in erail's Mon..Sun order
  let wantDay = -1;
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const js = new Date(`${date}T12:00:00Z`).getUTCDay(); // 0=Sun..6=Sat
    wantDay = (js + 6) % 7; // -> 0=Mon..6=Sun
  }

  const out: RouteOption[] = [];
  const segments = body.split("^");
  // segment 0 is the header
  for (let i = 1; i < segments.length; i++) {
    const f = segments[i].split("~");
    if (f.length < 14) continue;

    const number = f[0].trim();
    const name = f[1].trim();
    const boardCode = f[7].trim();
    const dropCode = f[9].trim();
    const depMin = hhDotMm(f[10]);
    const arrMin = hhDotMm(f[11]);
    const durMin = durHhMm(f[12]);
    const days = f[13].trim(); // 7-char bitmask, Mon..Sun

    if (!/^\d{3,6}$/.test(number)) continue;
    if (depMin < 0 || arrMin < 0 || durMin <= 0) continue;
    if (boardCode && dropCode && boardCode === dropCode) continue;
    if (wantDay >= 0 && days.length === 7 && days[wantDay] !== "1") continue;

    out.push({
      mode: "train",
      operator: `${name} (${number})`,
      price: estimateFare(durMin, name),
      duration_min: durMin,
      departure: toClock(depMin),
      arrival: toClock(arrMin),
      stops: 0,
      link: "https://www.confirmtkt.com/", // mergeResults -> route+date deep link
      indicative: true,
      source: "erail",
    });

    if (out.length >= 15) break;
  }

  if (out.length === 0) {
    console.warn(`[train] erail: 0 rows parsed for ${fromCode}-${toCode}`);
    record(false, 0, "0 rows parsed");
  } else {
    record(true, out.length, "ok");
  }
  return out;
}
