// Standalone Duffel sandbox check — no Next.js needed.
//
//   DUFFEL_API_KEY=duffel_test_xxx node scripts/test-duffel.mjs [FROM] [TO] [YYYY-MM-DD]
//
// Prints the raw first offer + how flight.ts would map it. Use this to confirm
// the key works before wiring it into the app.

const key = process.env.DUFFEL_API_KEY;
if (!key) {
  console.error("Set DUFFEL_API_KEY first. Get a test key at https://app.duffel.com (Developers → Access tokens → 'Test' token, starts with duffel_test_).");
  process.exit(1);
}

const [from = "PNQ", to = "BLR", date] = process.argv.slice(2);
const departure_date =
  date ?? new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);

const res = await fetch(
  "https://api.duffel.com/air/offer_requests?return_offers=true&supplier_timeout=10000",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Duffel-Version": "v2",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: {
        slices: [{ origin: from, destination: to, departure_date }],
        passengers: [{ type: "adult" }],
        cabin_class: "economy",
      },
    }),
  },
);

console.log(`HTTP ${res.status} ${res.statusText}`);
const json = await res.json();
if (!res.ok) {
  console.error(JSON.stringify(json, null, 2));
  process.exit(1);
}

const offers = json?.data?.offers ?? [];
console.log(`\n${offers.length} offers for ${from} → ${to} on ${departure_date}\n`);

for (const o of offers.slice(0, 5)) {
  const slice = o.slices?.[0] ?? {};
  const segs = slice.segments ?? [];
  const f = segs[0] ?? {};
  const l = segs[segs.length - 1] ?? {};
  const isoMin = (iso) => {
    const m = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso || "");
    return m ? +(m[1] || 0) * 60 + +(m[2] || 0) : 0;
  };
  console.log({
    operator: `${o.owner?.name} ${f.marketing_carrier?.iata_code}-${f.marketing_carrier_flight_number}`,
    price: Math.round(parseFloat(o.total_amount)),
    currency: o.total_currency,
    duration_min: isoMin(slice.duration),
    departure: (f.departing_at || "").slice(11, 16),
    arrival: (l.arriving_at || "").slice(11, 16),
    stops: segs.length - 1,
  });
}
