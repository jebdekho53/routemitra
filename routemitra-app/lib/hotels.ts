// Hotels — affiliate deep links only. Travelpayouts deprecated the free
// Hotellook price API, so we don't show structured hotel results; instead we
// send the user to a hotel search for the destination city with our marker
// attached (hotels pay ~4–7% commission, the best rate we have).
//
// Default target is Hotellook (Travelpayouts marker). Set NEXT_PUBLIC_AFF_HOTELS
// to a full search-URL template to override it — e.g. a Cuelinks-wrapped
// Booking.com / MakeMyTrip Hotels link (both auto-approved on Cuelinks). The
// template may contain {city} / {checkIn} / {checkOut} placeholders, which are
// substituted URL-encoded (both bare `{city}` and an already-encoded
// `%7Bcity%7D`, since Cuelinks' link generator encodes the wrapped URL).

const HOTELLOOK_SEARCH = "https://search.hotellook.com/";

function fillHotelTemplate(
  template: string,
  vars: { city: string; checkIn?: string | null; checkOut?: string | null },
): string {
  const sub = (s: string, key: string, value: string) =>
    s
      .replace(new RegExp(`\\{${key}\\}`, "g"), encodeURIComponent(value))
      .replace(new RegExp(`%7B${key}%7D`, "gi"), encodeURIComponent(value));
  let out = sub(template, "city", vars.city);
  const ci = vars.checkIn && /^\d{4}-\d{2}-\d{2}$/.test(vars.checkIn) ? vars.checkIn : "";
  const co = vars.checkOut && /^\d{4}-\d{2}-\d{2}$/.test(vars.checkOut) ? vars.checkOut : "";
  out = sub(out, "checkIn", ci);
  out = sub(out, "checkOut", co);
  return out;
}

/** Affiliate link to hotels in `city`. Uses NEXT_PUBLIC_AFF_HOTELS if set,
 *  otherwise Hotellook with TRAVELPAYOUTS_MARKER. */
export function hotelSearchLink(
  city: string,
  opts: { checkIn?: string | null; checkOut?: string | null } = {},
): string {
  const custom = process.env.NEXT_PUBLIC_AFF_HOTELS?.trim();
  if (custom) {
    return fillHotelTemplate(custom, { city, checkIn: opts.checkIn, checkOut: opts.checkOut });
  }

  // NEXT_PUBLIC_ copy so client components (search results) can attribute too;
  // the marker is public anyway — it's in every affiliate link on the site.
  const marker =
    process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ||
    process.env.TRAVELPAYOUTS_MARKER;
  const u = new URL(HOTELLOOK_SEARCH);
  u.searchParams.set("destination", city);
  u.searchParams.set("currency", "inr");
  if (marker) u.searchParams.set("marker", marker);
  if (opts.checkIn && /^\d{4}-\d{2}-\d{2}$/.test(opts.checkIn)) {
    u.searchParams.set("checkIn", opts.checkIn);
    if (opts.checkOut && /^\d{4}-\d{2}-\d{2}$/.test(opts.checkOut)) {
      u.searchParams.set("checkOut", opts.checkOut);
    }
  }
  u.searchParams.set("utm_source", "routemitra");
  return u.toString();
}

/** Rough "stays typically start around" figure per city — for context only,
 *  clearly framed as an approximate starting price. */
const FROM_NIGHTLY: Record<string, number> = {
  goa: 1400,
  mumbai: 2200,
  delhi: 1800,
  bengaluru: 1900,
  jaipur: 1200,
  udaipur: 1600,
  varanasi: 900,
  agra: 1000,
  kochi: 1300,
  thiruvananthapuram: 1200,
  mysuru: 1100,
  chennai: 1700,
  hyderabad: 1600,
  kolkata: 1500,
  pune: 1600,
  ahmedabad: 1300,
  amritsar: 1000,
  chandigarh: 1600,
  nagpur: 1200,
  indore: 1100,
  lucknow: 1100,
};

export function fromNightly(city: string): number | null {
  return FROM_NIGHTLY[city.trim().toLowerCase()] ?? null;
}
