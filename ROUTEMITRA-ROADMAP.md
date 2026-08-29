# RouteMitra — Full Development Roadmap

Is file ka maksad: ek step-by-step, checklist-wala roadmap jo seedha Claude Code (ya kisi bhi
coding agent) ko diya ja sake — "Phase 2 complete karo" bol kar kaam shuru karwaya ja sake.

Related docs:
- Blueprint (architecture, data-source contacts, business model): https://claude.ai/code/artifact/5ba4103a-e59f-4e05-b6a3-814de3be1cc8
- Working demo (dummy data, static HTML/CSS/JS): `routemitra-demo/`

---

## Ab tak kya ban chuka hai

- **Demo** — `routemitra-demo/` mein ek chalta hua static webapp hai: 5 sample routes, bus/train/flight
  cards, sort by cheapest/fastest, "Book karein" redirect buttons. Koi backend/API nahi — sab dummy data.
- **Blueprint** — data kahan se milega (RedBus, IRCTC/PSPs, Duffel, Skyscanner), architecture pattern,
  aur paisa kaise banega — ye sab pehle se decide ho chuka hai.

Is roadmap ka kaam hai us demo ko ek real, production-ready app mein badalna.

---

## Final tech stack (ab lock kar rahe hain)

| Layer | Choice | Kyun |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind | Ek hi repo mein frontend+backend, Vercel par free deploy |
| Backend | Next.js API routes | Alag server maintain nahi karna padta, serverless |
| Cache | Upstash Redis | Serverless-friendly, free tier kaafi hai shuru ke liye |
| Database | Neon ya Supabase (Postgres) | Free tier, baad mein saved searches/users ke liye |
| Hosting | Vercel | Next.js ke liye best fit, free tier |
| Analytics | Plausible ya GA4 | Click-tracking ke liye (business model section dekho) |

## Target project structure

```
routemitra-app/
  app/
    page.tsx                 -- search landing page
    search/page.tsx          -- results page
    api/
      search/route.ts        -- aggregator endpoint (bus+train+flight parallel call)
  lib/
    adapters/
      bus.ts
      train.ts
      flight.ts
    normalize.ts              -- har provider ka response ek common shape mein
    cache.ts                  -- Redis get/set helpers
    sample-data.ts            -- routemitra-demo/data.js se migrate kiya hua dummy data
  components/
    SearchForm.tsx
    ResultCard.tsx
    SortTabs.tsx
  types/
    route.ts                  -- { mode, operator, price, duration_min, departure, arrival, link }
  .env.local                  -- kabhi commit mat karna
  ROUTEMITRA-ROADMAP.md       -- ye file (yahan copy rakh sakte ho)
```

## Environment variables (jaise-jaise API milti jaayein, add karte jaana)

```
DUFFEL_API_KEY=
BUS_PROVIDER_API_KEY=        # RapidAPI ya RedBus GDS milne ke baad
TRAIN_PROVIDER_API_KEY=      # ConfirmTkt/RailYatri approve hone ke baad
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
DATABASE_URL=
```

---

## Phase-by-phase roadmap

Har phase ke end mein "Acceptance" diya hai — jab tak wo sach na ho, agle phase mat jaao.

### Phase 0 — Project setup (Day 1)
- [x] `npx create-next-app@latest routemitra-app --typescript --tailwind --app`
- [x] Git init, pehla commit
- [x] `.env.local` banao (`.env.example` bhi add kiya; `.gitignore` mein `.env*` already hai)
- [ ] Vercel account bana kar project link karo, khaali app hi deploy kar do  ← manual step, tum karoge
- **Acceptance:** `npm run dev` local par chalta hai ✅. Vercel deploy abhi baaki (account chahiye).

### Phase 1 — Demo UI ko Next.js mein port karo (Day 2–3)
- [x] `routemitra-demo/style.css` ke color tokens + fonts port kiye (`app/globals.css` + `next/font`)
- [x] `SearchForm`, `ResultCard`, `SortTabs` components banaye
- [x] `types/route.ts` mein normalized shape define kiya
- [x] `routemitra-demo/data.js` ka dummy data `lib/sample-data.ts` mein migrate kiya
- **Acceptance:** ✅ Next.js app mein wahi demo dikhta hai (`/` landing + `/search` results, sort tabs kaam karte hain).

### Phase 2 — Aggregator API route (Day 4–5)
- [x] `app/api/search/route.ts` banaya — query params: `from`, `to`, `date` (missing param → 400)
- [x] `lib/adapters/bus.ts`, `train.ts`, `flight.ts` — teeno abhi sample-data return karte hain (simulated latency)
- [x] `Promise.allSettled` se teeno adapters parallel, `lib/normalize.ts` merge + shape guard + cheapest-first
- [x] `/search` page ab `/api/search` se fetch karta hai — frontend mein koi hardcoded route data nahi
- **Acceptance:** ✅ `/search?from=Pune&to=Bengaluru` → browser `/api/search` call karta hai, response
  `{ from, to, date, options[] }` normalized shape mein aata hai. `npm run build` clean pass.

### Phase 3 — Redis caching (Day 6)
- [ ] Upstash Redis ka free account banao, keys `.env.local` mein daalo  ← manual step, tum karoge
      (console.upstash.com → Create Database → REST section se URL + TOKEN copy karo)
- [x] `lib/cache.ts` — `search:from:to:date` key se get/set, TTL 600s (10 min). Keys na hon to
      no-op (dev bina Upstash ke chalta rahe).
- [x] `/api/search` mein pehle cache check (HIT → seedha return), miss par hi adapters. Non-empty
      results hi cache hote hain. Response par `x-cache: HIT|MISS` header + server log.
- **Acceptance:** keys daalne ke baad — same query 2 baar:
      `curl -sD - -o /dev/null "localhost:3000/api/search?from=Pune&to=Bengaluru&date=2026-09-01" | grep x-cache`
      → pehli baar `MISS`, doosri baar `HIT` (aur 2nd response tez, adapter latency skip).

### Phase 4 — Real flight data: Duffel (Day 7–9)
- [ ] `duffel.com` par free account, sandbox API key lo  ← manual step, tum karoge
- [x] `lib/adapters/flight.ts` — `DUFFEL_API_KEY` set ho to Duffel `air/offer_requests`
      call karta hai; response normalized shape mein map hota hai (IATA codes `lib/iata.ts` se)
- [x] Key/IATA na ho ya call fail ho to sample flights par graceful fallback
- **Acceptance:** ⏳ code taiyaar; sandbox key daal kar ek route verify karna baaki
      (`DUFFEL_API_KEY=...` → `/api/search?from=Delhi&to=Mumbai` → `source: "duffel"` dikhe).

### Phase 5 — Bus data (Day 10–12)
- [x] `lib/adapters/bus.ts` — `BUS_PROVIDER_API_URL` + `_KEY` (+ `_HOST`) set ho to generic
      RapidAPI-style HTTP call, defensive JSON mapping, `indicative: true` badge, sample fallback
- [ ] RapidAPI par ek bus-aggregator choose karke uska URL/key `.env.local` mein daalo  ← tum
- [ ] RedBus ko mail bhej do — draft ready: `routemitra-app/docs/outreach/redbus.md`  ← tum
- **Acceptance:** ⏳ code taiyaar; provider URL daalte hi bus results interim API se aayenge,
      RedBus reply ka wait parallel mein.

### Phase 6 — Train data (Day 13–16, sabse slow step)
- [x] `lib/adapters/train.ts` — `TRAIN_PROVIDER_API_URL` + `_KEY` (+ `_HOST`) set ho to
      RapidAPI-style call, defensive mapping, `indicative` badge (UI mein dikhata hai), sample fallback
- [ ] RapidAPI IRCTC wrapper ka URL/key `.env.local` mein daalo  ← tum
- [ ] ConfirmTkt + RailYatri ko mail — draft ready: `routemitra-app/docs/outreach/train-psps.md`  ← tum
- **Acceptance:** ⏳ code taiyaar; `indicative` label mechanism live hai (sample trains bhi label ho
      sakte hain), PSP contact process draft se shuru karna baaki.

### Phase 7 — Deep links + click tracking (Day 17–18)
- [x] Har "Book karein" link par UTM + `ref=routemitra:...` params (`lib/links.ts`, `lib/normalize.ts`
      mein har option ke link par lagta hai)
- [x] Click tracking: `BookButton.tsx` `navigator.sendBeacon` se `POST /api/track` bhejta hai +
      Plausible custom event ("Book click"). `DATABASE_URL` ho to Postgres `clicks` table mein insert
      (`lib/db.ts`, auto-schema), warna `console.log`. `GET /api/track` → clicks-by-mode + top-routes
      (partner pitch ke liye traction number)
- [ ] Neon/Supabase Postgres + Plausible account bana ke `DATABASE_URL` / `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
      daalo  ← tum
- **Acceptance:** ✅ click par `/api/track` beacon jaata hai; bina DB ke `console.log` dikhta hai,
      DB daalte hi row insert hota hai.

### Phase 8 — Polish (Day 19–21)
- [x] Loading skeleton cards, error state, "koi option nahi mila" state
- [x] SEO: `/routes/[slug]` static pages (`generateStaticParams` se dono direction, sample routes),
      per-page `generateMetadata` + canonical + JSON-LD FAQ. Home + route pages par internal linking grid
- [x] `app/sitemap.ts` + `app/robots.ts` (`NEXT_PUBLIC_SITE_URL` se host), `metadataBase` layout mein
- [x] Mobile: demo ke responsive breakpoints port ho chuke (search form, cards)
- **Acceptance:** ✅ build par 10 route pages pre-render; sitemap/robots resolve. ⏳ Lighthouse 90+
      production deploy ke baad verify karna (checklist `docs/DEPLOY.md`).

### Phase 9 — Launch (Day 22)
- [x] Deploy checklist + smoke-test steps: `routemitra-app/docs/DEPLOY.md` (Vercel root dir =
      `routemitra-app`, env vars list, custom domain, Lighthouse check)
- [x] `README.md` updated (arch diagram, env fallback table, routes)
- [ ] Vercel production deploy + custom domain  ← tum (account chahiye)
- [ ] Analytics live, 10–20 logon ko bhej kar feedback  ← tum
- **Acceptance:** ⏳ deploy ke baad app publicly live.

### Phase 10 — Growth loop (ongoing, launch ke baad)
- [x] Data collection code ready: `GET /api/track` (clicks by mode, top routes) + Plausible events.
      Full ops checklist: `routemitra-app/docs/GROWTH.md`
- [ ] Skyscanner apply (100k+ users pe), partner follow-ups, affiliate links + commission reconcile
      — ye business ops hai, `docs/GROWTH.md` follow karo  ← tum, ongoing

### Phase 11 — Ghar se ghar tak (door-to-door fare) (Day 23–27)

Ab tak sirf city-to-city fare tha (jaise Delhi → Varanasi). Ye phase asli trip jodta hai:
ghar (jaise Indirapuram) se nearest hub tak, aur destination hub se final address (jaise Lanka,
Varanasi) tak — dono local legs ka fare intercity fare ke saath jud kar ek total number banaye.
Poora detail Blueprint ke Stop 9 mein hai: https://claude.ai/code/artifact/5ba4103a-e59f-4e05-b6a3-814de3be1cc8

- [x] Geocoding — `lib/geo.ts`: free-text address → lat/lng via OpenStreetMap Nominatim (free,
      no key). `GOOGLE_MAPS_API_KEY` ho to Google Geocoding. Results Redis mein cache hote hain
- [x] `lib/city-hubs.ts` — 9 cities (Delhi, Mumbai, Pune, Bengaluru, Goa, Jaipur, Chennai,
      Hyderabad, Varanasi) ke flight/train/bus hub lat/lng ke saath. `nearestHub()` haversine se
- [x] `lib/adapters/local.ts` — Leg 1/Leg 3 ka distance-based cab fare + ETA estimate (clearly
      `est.` labelled). Uber universal deep-link banata hai. Ola/Rapido: deep-link only (no API)
- [ ] Uber Price Estimates API register + `UBER_SERVER_TOKEN` daalo (optional; abhi estimate math
      chal raha hai). Ola: `affiliates@olacabs.com` ko mail  ← tum, optional
- [x] Total = Leg1 + intercity + Leg3 + buffer (flight 90m / train 20m / bus 15m) — `lib/door-to-door.ts`
- [x] UI: result card mein "🏠 Ghar se ghar tak: ₹X · Yh Zm" strip + 3-leg breakdown.
      SearchForm mein "Ghar-se-ghar fare (beta)" collapsible fields
- **Acceptance:** ✅ Indirapuram, Ghaziabad → Lanka, Varanasi (Delhi→Varanasi) par har option ka
      poora door-to-door total teeno legs + buffer ke breakdown ke saath calculate hota hai
      (flight → DEL/VNS airport legs, train → NDLS/BSB station legs).

---

## Claude Code ke saath kaise use karein

- Har phase ek self-contained prompt hai — is file ko project mein rakh kar bol sakte ho:
  *"ROUTEMITRA-ROADMAP.md padho aur Phase 2 complete karo."*
- Har phase ke end mein diya "Acceptance" criteria use verify karne ke liye bolo, agle phase pe
  tabhi badhna jab wo pass ho.
- Jaise-jaise API keys milti jaayein (Duffel, bus, train), unhe `.env.local` mein daal kar bolo:
  *"Phase 4 (ya 5/6) ab real API key ke saath karo."*
