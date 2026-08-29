# Growth loop (Phase 10) — post-launch, ongoing

The app already emits the data this phase needs. This is an operations checklist,
not code.

## 1. Collect traffic data

- `GET /api/track` → clicks by mode + top routes (needs `DATABASE_URL`).
- Plausible dashboard → top pages, top `/routes/*` slugs, "Book click" events by
  mode/operator.
- Weekly: note the 10 most-searched routes. Add the strong ones to
  `lib/sample-data.ts` (and they auto-appear in `/routes/*`, sitemap, home).

## 2. Skyscanner Travel API

- Requires ~100k+ monthly users — don't apply until organic traffic is close.
- Grow `/routes/*` SEO first: more routes, real FAQ content, backlinks.
- When ready: apply at https://www.partners.skyscanner.net/ with the Plausible
  monthly-uniques screenshot.

## 3. Partner follow-ups (with traction numbers)

- RedBus (`partner_support@redbus.com`) — see `docs/outreach/redbus.md`
- ConfirmTkt / RailYatri — see `docs/outreach/train-psps.md`
- Bump each thread monthly with updated numbers: "X searches/week, Y clicks to
  your platform last month via `ref=routemitra`".

## 4. Business model — make commission real

- Replace redirect links with each partner's affiliate/deep-link format once
  signed (edit `lib/links.ts` `bookingLink()` per mode, or per operator).
- Add a `bookings` table + partner postback/webhook to reconcile commission
  against the `clicks` table.
- Track: clicks → partner-attributed bookings → commission per mode. Double down
  on the mode/route with the best conversion.

## 5. Content / SEO cadence

- One new `/routes/*` cluster per week for a high-volume route (e.g. add nearby
  city pairs).
- Keep fares labelled `indicative` until a live source is wired — trust matters
  more than looking complete.
