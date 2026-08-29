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
- [ ] Upstash Redis ka free account banao, keys `.env.local` mein daalo
- [ ] `lib/cache.ts` — `route+date` key se get/set, TTL ~5–10 min
- [ ] `/api/search` mein pehle cache check, tab hi adapters call karo
- **Acceptance:** Same query dobara karne par 2nd response fast ho (log se cache-hit verify karo).

### Phase 4 — Real flight data: Duffel (Day 7–9)
- [ ] `duffel.com` par free account, sandbox API key lo
- [ ] `lib/adapters/flight.ts` mein Duffel ka flight-search call karo
- [ ] Duffel response ko normalized shape mein map karo
- [ ] Sandbox/test mode se ek route verify karo (Duffel test airlines deta hai)
- **Acceptance:** Kam se kam ek route par real (sandbox) flight results dikhein.

### Phase 5 — Bus data (Day 10–12)
- [ ] Interim: RapidAPI ka koi bus-aggregator try karo
- [ ] Parallel mein RedBus ko `partner_support@redbus.com` par mail bhej do (Seat Seller/GDS API maango
  — Blueprint ke "official contacts" section mein poora template hai)
- [ ] `lib/adapters/bus.ts` ko jo bhi API mile usse implement karo
- **Acceptance:** Ek route par bus results dikhein (interim API se), aur RedBus ko reply ka wait parallel
  mein chal raha ho.

### Phase 6 — Train data (Day 13–16, sabse slow step)
- [ ] ConfirmTkt (`confirmtkt.com/partners.php`) aur RailYatri (`sales@railyatri.in`) dono ko mail
  bhej do — jo pehle reply kare
- [ ] Interim: RapidAPI ke IRCTC wrapper se demo-quality data dikhao, clearly label karo "indicative fare"
- [ ] Official access milne par `lib/adapters/train.ts` ko real API se badal do
- **Acceptance:** Train card dikh raha ho (interim data se sahi), aur PSP contact process shuru ho chuka ho.

### Phase 7 — Deep links + click tracking (Day 17–18)
- [ ] Har card ke "Book karein" link mein UTM/ref params add karo
- [ ] Simple click-tracking (Plausible custom event ya DB table) — kaunsa mode/operator click hua, ye
  data future partner-negotiation (RedBus/ConfirmTkt se "hamare paas itna traffic hai" dikhane) mein
  kaam aayega
- **Acceptance:** Click hone par analytics event log ho raha ho.

### Phase 8 — Polish (Day 19–21)
- [ ] Loading skeletons, error states, "route not found" state
- [ ] SEO: popular routes ke liye static pages (`/routes/pune-to-bengaluru`) — organic traffic ka
  main source yahi hoga
- [ ] Mobile responsive check
- [ ] Basic `sitemap.xml`
- **Acceptance:** Lighthouse performance/SEO score 90+.

### Phase 9 — Launch (Day 22)
- [ ] Vercel production deploy, custom domain
- [ ] Analytics live
- [ ] 10–20 log (dost/family) ko bhej kar real feedback lo
- **Acceptance:** App publicly live hai aur real users use kar rahe hain.

### Phase 10 — Growth loop (ongoing, launch ke baad)
- [ ] Traffic data collect karo — kaunse routes zyada search ho rahe hain
- [ ] Us data ke saath Skyscanner Travel API ke liye apply karo (unhe 100k+ monthly users chahiye —
  pehle organic traffic badhao, phir apply karo)
- [ ] RedBus/ConfirmTkt/RailYatri ko traction dikha kar follow-up karo
- [ ] Business-model section implement karo — affiliate links properly track karo, commission aana
  shuru ho

---

## Claude Code ke saath kaise use karein

- Har phase ek self-contained prompt hai — is file ko project mein rakh kar bol sakte ho:
  *"ROUTEMITRA-ROADMAP.md padho aur Phase 2 complete karo."*
- Har phase ke end mein diya "Acceptance" criteria use verify karne ke liye bolo, agle phase pe
  tabhi badhna jab wo pass ho.
- Jaise-jaise API keys milti jaayein (Duffel, bus, train), unhe `.env.local` mein daal kar bolo:
  *"Phase 4 (ya 5/6) ab real API key ke saath karo."*
