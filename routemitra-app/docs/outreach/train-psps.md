# Train data — PSP outreach (Phase 6)

IRCTC does not give fare/availability APIs directly to startups. You go through an
authorised **PSP (Payment/Booking aggregator)**. Contact both below in parallel and
go with whoever replies first with workable terms. Until then the app shows
`indicative` fares from a RapidAPI IRCTC wrapper.

---

## 1. ConfirmTkt

**Channel:** https://www.confirmtkt.com/partners.php (partner form) — also try
partners@confirmtkt.com
**Subject:** API partnership — RouteMitra (multi-modal travel search)

Hi ConfirmTkt team,

I run **RouteMitra** (https://routemitra.vercel.app), a bus/train/flight route
comparison site for Indian travellers. I'd like to show live train availability,
fare and prediction data and hand booking off to ConfirmTkt.

Could you share:
- API access for train search / availability / fare / confirmation-prediction
- Commercials and the redirect-affiliate option to start with

Traffic today: [searches/week, unique users — real numbers]. We normalise every
provider into one schema, so integration is quick on our side. Demo and roadmap
available on request.

Thanks,
[Your name] · [phone] · [email]

---

## 2. RailYatri

**To:** sales@railyatri.in
**Subject:** API partnership request — RouteMitra (bus + train + flight search)

Hi RailYatri team,

Building **RouteMitra** (https://routemitra.vercel.app) — one page to compare bus,
train and flight for a route. Looking for train search/availability/fare API access
(and your bus inventory too, if available), with a booking handoff to RailYatri.

Please share programme details, commercials, and whether we can begin with an
affiliate redirect while API access is provisioned.

Current traffic: [fill in]. Quick to integrate — single normalised schema our side.

Thanks,
[Your name] · [phone] · [email]

---

## Notes

- Keep the interim RapidAPI wrapper clearly labelled `indicative` in the UI
  (already implemented) until an official source is live.
- When one PSP is signed, swap `lib/adapters/train.ts` `mapTrainResponse()` for
  their response shape and set `indicative: false`.
