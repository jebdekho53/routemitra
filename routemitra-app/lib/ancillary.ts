// Ancillary revenue — every extra a traveller might buy around a trip, each
// wired as an affiliate deep link. Same philosophy as lib/hotels.ts and
// lib/links.ts: nothing is invented. A stream is *off* (its CTA hidden) until
// you paste the affiliate link you generated in that program's own dashboard
// into the matching NEXT_PUBLIC_AFF_* env var.
//
// The env var holds a full affiliate URL and may contain these placeholders,
// substituted (URL-encoded) at render time:
//   {city}  {from}  {to}  {date}
//
// Why NEXT_PUBLIC_: these CTAs render in both server and client components,
// and an affiliate marker/ID is public anyway — it sits in every outbound
// link on the site.

export type Extra = {
  key: string;
  /** single emoji shown in the card */
  icon: string;
  label: string;
  blurb: string;
  href: string;
  /** true => affiliate link (rel="sponsored"); false => plain deep link */
  paid: boolean;
};

function fill(
  template: string,
  vars: { city?: string; from?: string; to?: string; date?: string },
): string {
  return template
    .replace(/\{city\}/g, encodeURIComponent(vars.city ?? ""))
    .replace(/\{from\}/g, encodeURIComponent(vars.from ?? ""))
    .replace(/\{to\}/g, encodeURIComponent(vars.to ?? ""))
    .replace(/\{date\}/g, encodeURIComponent(vars.date ?? ""));
}

const env = (k: string) => {
  const v = process.env[k];
  return v && v.trim() ? v.trim() : null;
};

// --- individual streams -------------------------------------------------

/** Rental cars at the destination (EconomyBookings / LocalRent / QEEQ via
 *  Travelpayouts, or DiscoverCars). ~ $8–15 per booking. */
export function carRental(city: string): Extra | null {
  const t = env("NEXT_PUBLIC_AFF_CARS");
  if (!t) return null;
  return {
    key: "cars",
    icon: "🚗",
    label: `Rent a car in ${city}`,
    blurb: "Self-drive and chauffeur options, free cancellation on most.",
    href: fill(t, { city }),
    paid: true,
  };
}

/** Travel eSIM (Airalo / Yesim via Travelpayouts). ~ 15–20% per sale. */
export function esim(): Extra | null {
  const t = env("NEXT_PUBLIC_AFF_ESIM");
  if (!t) return null;
  return {
    key: "esim",
    icon: "📶",
    label: "Get a travel eSIM",
    blurb: "Data the moment you land — no roaming bill, no SIM swap.",
    href: t,
    paid: true,
  };
}

/** Trip insurance (via Travelpayouts partners, or ACKO / Digit direct).
 *  High value — ~ ₹80–250 per policy. */
export function insurance(from: string, to: string, date?: string | null): Extra | null {
  const t = env("NEXT_PUBLIC_AFF_INSURANCE");
  if (!t) return null;
  return {
    key: "insurance",
    icon: "🛡️",
    label: "Insure this trip",
    blurb: "Delay, cancellation and medical cover from a few rupees a day.",
    href: fill(t, { from, to, date: date ?? "" }),
    paid: true,
  };
}

/** Things to do at the destination (Klook / GetYourGuide / Viator).
 *  ~ 5–8% per booking, high basket on tours. */
export function activities(city: string): Extra | null {
  const t = env("NEXT_PUBLIC_AFF_ACTIVITIES");
  if (!t) return null;
  return {
    key: "activities",
    icon: "🎟️",
    label: `Things to do in ${city}`,
    blurb: "Tours, tickets and experiences — skip-the-line where it counts.",
    href: fill(t, { city }),
    paid: true,
  };
}

/** Airport transfer / outstation cab (Gozo / Savaari). Commission on
 *  intercity cabs — the natural upsell for a door-to-door search. */
export function transfer(from: string, to: string, date?: string | null): Extra | null {
  const t = env("NEXT_PUBLIC_AFF_TRANSFERS");
  if (!t) return null;
  return {
    key: "transfer",
    icon: "🚕",
    label: "Book an airport transfer",
    blurb: "Fixed-price pickup, so the first and last mile is sorted.",
    href: fill(t, { from, to, date: date ?? "" }),
    paid: true,
  };
}

/** Airport lounge access (DreamFolks / Priority Pass). Per pass sold. */
export function lounge(): Extra | null {
  const t = env("NEXT_PUBLIC_AFF_LOUNGE");
  if (!t) return null;
  return {
    key: "lounge",
    icon: "🛋️",
    label: "Airport lounge access",
    blurb: "Skip the crowded gate — buy a single-visit pass.",
    href: t,
    paid: true,
  };
}

/** Forex card / travel money (Wise, Niyo, BookMyForex). Per activated card. */
export function forex(): Extra | null {
  const t = env("NEXT_PUBLIC_AFF_FOREX");
  if (!t) return null;
  return {
    key: "forex",
    icon: "💳",
    label: "Travel money card",
    blurb: "Zero-markup spending abroad — order before you fly.",
    href: t,
    paid: true,
  };
}

/** Amazon Associates search link for trip gear. Set NEXT_PUBLIC_AMAZON_ASSOC_TAG
 *  (e.g. "routemitra-21"). ~ 1–4% on India store. */
export function amazon(query: string, label: string): Extra | null {
  const tag = env("NEXT_PUBLIC_AMAZON_ASSOC_TAG");
  if (!tag) return null;
  const u = new URL("https://www.amazon.in/s");
  u.searchParams.set("k", query);
  u.searchParams.set("tag", tag);
  return {
    key: `amazon-${query.replace(/\s+/g, "-")}`,
    icon: "🎒",
    label,
    blurb: "",
    href: u.toString(),
    paid: true,
  };
}

// --- free (non-affiliate) deep links — still improve the door-to-door UX ---

/** Uber universal link, pre-filled with the drop-off. No key, no commission —
 *  it just completes the "and then a cab from the station" step. */
export function uberTo(place: string): Extra {
  const u = new URL("https://m.uber.com/ul/");
  u.searchParams.set("action", "setPickup");
  u.searchParams.set("pickup", "my_location");
  u.searchParams.set("dropoff[formatted_address]", place);
  return {
    key: "uber",
    icon: "🚕",
    label: `Cab to ${place}`,
    blurb: "Opens Uber with the drop-off filled in.",
    href: u.toString(),
    paid: false,
  };
}

// --- aggregate helpers used by the UI ---------------------------------

/** Everything relevant to a city-level page (guide / route / search). */
export function extrasForDestination(
  city: string,
  from?: string,
  date?: string | null,
): Extra[] {
  return [
    activities(city),
    transfer(from ?? city, city, date),
    from ? insurance(from, city, date) : null,
    carRental(city),
    esim(),
    lounge(),
    forex(),
  ].filter((x): x is Extra => x !== null);
}

/** Which streams are configured — for /admin/system. */
export function ancillaryStatus(): { key: string; label: string; live: boolean }[] {
  const has = (k: string) => Boolean(env(k));
  return [
    { key: "cars", label: "Car rental", live: has("NEXT_PUBLIC_AFF_CARS") },
    { key: "esim", label: "Travel eSIM", live: has("NEXT_PUBLIC_AFF_ESIM") },
    { key: "insurance", label: "Trip insurance", live: has("NEXT_PUBLIC_AFF_INSURANCE") },
    { key: "activities", label: "Activities / tours", live: has("NEXT_PUBLIC_AFF_ACTIVITIES") },
    { key: "transfer", label: "Airport transfers", live: has("NEXT_PUBLIC_AFF_TRANSFERS") },
    { key: "lounge", label: "Lounge access", live: has("NEXT_PUBLIC_AFF_LOUNGE") },
    { key: "forex", label: "Forex card", live: has("NEXT_PUBLIC_AFF_FOREX") },
    { key: "amazon", label: "Amazon Associates", live: has("NEXT_PUBLIC_AMAZON_ASSOC_TAG") },
    { key: "adsense", label: "Display ads (AdSense)", live: has("NEXT_PUBLIC_ADSENSE_CLIENT") },
  ];
}
