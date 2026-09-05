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

**Update (is roadmap ka v5, 2026-09-05):** Phases 0–21 code-complete. Site **production pe live**
hai (`routemitra-gamma.vercel.app`) — UrbanMove Services Private Limited operate karti hai.
Phases 22–32 (revenue system, real train data via erail.in, search UX, geolocation, compliance
copy, real SMTP email, district-level place resolution, full visual refresh, a data-trust bug
fix) bhi ho chuke — detail neeche.

| Category | Status |
|---|---|
| Search + compare (bus/train/flight) | ✅ Phase 0–2 |
| Cache, real flight/bus/train adapters | ✅ Phase 3–6 |
| Click-tracking, SEO, deploy, growth | ✅ Phase 7–10 (prod live) |
| Door-to-door (ghar se ghar) | ✅ Phase 11 |
| Accounts — signup/login/logout | ✅ Phase 12 (**Neon Postgres + `AUTH_SECRET` live on prod**) |
| Saved searches, price alerts | ✅ Phase 13 (**DB + `CRON_SECRET` live**; email delivery needs `RESEND_API_KEY`) |
| Legal — privacy, terms, cookie consent | ✅ Phase 14 (entity + grievance-officer env vars **set on prod**) |
| Security — CAPTCHA, rate-limit, monitoring | ✅ Phase 15 (Sentry + source maps live, Turnstile live; **rate-limit + cache no-op — no Upstash Redis on prod**) |
| Polish — remove demo feel, PWA, error pages | ✅ Phase 16 |
| Testing/CI | ✅ Phase 17 |
| Admin dashboard | ✅ Phase 18 (`ADMIN_PASSWORD` set on prod) |
| Mobile-first + premium visual refresh | ✅ Phase 19 |
| Real flight data (Duffel + Travelpayouts) | ✅ Phase 4 / 20 (Travelpayouts live on prod) |
| **Affiliate wiring — Cuelinks + INRDeals** | ✅ Phase 22 (`CUELINKS_CID` live; RedBus/ConfirmTkt campaigns paused upstream) |
| **Ancillary revenue — trip extras + packing list** | ✅ Phase 23 (5 Travelpayouts programs + Amazon Associates live) |
| **Observability — Sentry / Plausible / AdSense CSP** | ✅ Phase 24 |
| **Time-of-day filters + result densify** | ✅ Phase 25 |
| **Real train data — erail.in + ISR route pages** | ✅ Phase 26 (`TRAIN_ERAIL=1` on prod) |
| **Search UX — mode checkboxes, autocomplete, geolocation** | ✅ Phase 27 |
| **Compliance copy — aggregator disclaimer + IT-Rules grievance officer** | ✅ Phase 28 |
| **Transactional email — real SMTP (Hostinger) send** | ✅ Phase 29 (verify/reset/price-alert emails actually deliver) |
| **District-level place resolution (autocomplete + station/airport hub)** | ✅ Phase 30 (all 749 districts searchable) |
| **Full visual refresh — hero art, destination banners, icon set, ticket cards** | ✅ Phase 31 |
| **Bug fix — proxy-station/airport results now flagged, not presented as exact matches** | ✅ Phase 32 |
| B2B travel-API onboarding (TBO / TripJack) | ⏳ in progress (agent accounts filed) |
| Custom domain + Upstash Redis + RapidAPI IRCTC Pro | ⏳ pending (tum) |

**"Demo" text ka fix:** ✅ ho gaya (Phase 16). Sabhi pages ka masthead/footer ab shared
`Masthead` + `SiteFooter` components se aata hai — kahin "Demo build · sample data" ya
"working demo" text nahi. Result cards par "indicative" badge sirf estimate fares par dikhta
hai — wo intentional disclosure hai (Skyscanner/ixigo bhi fare estimate disclose karte hain),
poori site "demo" nahi.

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
- [x] Vercel account + project link — **live at `routemitra-gamma.vercel.app`**
      (Build Command override: `next build --webpack`, Phase 24 dekho)
- **Acceptance:** ✅ `npm run dev` local + prod deploy dono live.

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

### Phase 4 — Real flight data: Duffel (Day 7–9)  ✅
- [x] Duffel test account + `duffel_test_…` key (`.env.local`, gitignored)
- [x] `lib/adapters/flight.ts` — `DUFFEL_API_KEY` set ho to Duffel `air/offer_requests`
      (v2) call, offers normalized shape mein map (IATA `lib/iata.ts` se)
- [x] Sandbox fares USD/GBP mein aate hain → `FX_TO_INR` se INR mein convert, converted
      fare `indicative: true` (honest). Real INR Duffel offers as-is.
- [x] Key/IATA na ho, call fail ho, ya **429 rate-limit** ho → sample flights par graceful fallback
      (E2E ne 429 trigger kiya, fallback ne handle kiya, tests green)
- [x] `scripts/test-duffel.mjs` (standalone check) + `tests/unit/flight-duffel.test.ts`
      (live test, key ke bina auto-skip)
- **Acceptance:** ✅ `/api/search?from=Mumbai&to=Goa` → 8 flight options `source: "duffel"`,
      real airlines/times, INR-converted (~₹3,700+), bus/train ke saath sahi sort. 26 unit + 10 e2e pass.

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
- [x] Plausible live — `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` set on prod (cookieless analytics)
- [x] **Neon Postgres live** — `DATABASE_URL` (+ `DATABASE_URL_UNPOOLED`, `PG*`, `POSTGRES_*`) set
      on Production/Preview/Development via the Vercel↔Neon marketplace integration (resource
      "routemitra", us-east-1). All 9 app tables exist (`ensureSchema()` has run):
      `users, auth_tokens, saved_searches, route_watches, favourite_routes, clicks, searches,
      feedback, errors`. Connect pgAdmin to the same string from the Neon dashboard.
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
- [x] Vercel production deploy — **live** (`routemitra-gamma.vercel.app`)
- [x] Analytics live (Plausible)
- [ ] Custom domain (`getroutemitra.com` ya jo final ho) + 10–20 logon ko feedback ke liye bhejo  ← tum
- **Acceptance:** ✅ app publicly live on the Vercel subdomain; custom domain baaki.

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

### Phase 12 — Accounts: Signup, Login, Logout (Day 28–31)

Abhi tak sab kuch anonymous hai. Real product (Ola/Skyscanner jaisa) mein user account banata
hai, login karta hai, logout karta hai — tabhi saved searches, price alerts, booking history
jaisi cheezein possible hoti hain.

- [x] **Auth.js (NextAuth v5)** — `auth.ts` (JWT sessions), `app/api/auth/[...nextauth]`,
      `SessionProvider` layout mein
- [x] `users` + `auth_tokens` tables (`lib/db.ts` ensureSchema mein). Hand-rolled queries:
      `lib/auth/users.ts`. Password hash: Node `scrypt` (`lib/auth/password.ts`)
- [x] **Signup** — `/signup` + `POST /api/auth/signup` (zod + rate-limit + Turnstile), verify
      email → `GET /api/auth/verify?token=` → `email_verified_at` set
- [x] **Login** — `/login`, Credentials provider + "Continue with Google" (button sirf tab jab
      `AUTH_GOOGLE_ID`+`SECRET` set hon)
- [x] **Logout** — `UserMenu` se `signOut()`, `/` par redirect
- [x] **Forgot/reset** — `/forgot` + `/reset` + `POST /api/auth/forgot|reset` (token hashed,
      1hr expiry, no email-enumeration leak)
- [x] Header: `UserMenu` — logged-out "Login", logged-in "Hi, {name} ▾" (Dashboard/Account/Logout)
- [x] `/account` — naam/email update, password change, **delete account** (cascade delete)
      via server actions
- [x] Signup/login/forgot/reset par IP rate-limit (`lib/ratelimit.ts` — Upstash, no-op bina Redis)
- [x] `AUTH_SECRET` + `AUTH_GOOGLE_ID/SECRET` set on prod. `RESEND_API_KEY` abhi **nahi** —
      verification/reset email console me print hote hain jab tak wo (+ domain) na aaye.
- **Acceptance:** ✅ DB + `AUTH_SECRET` live — signup → verify → login → logout end-to-end
      chalta hai (email step console). Protected routes bina login redirect (E2E).

### Phase 13 — Logged-in user features (Day 32–34)

- [x] Recent searches — `/api/search` logged-in user ki search DB mein save karta hai (last 10
      cap, fire-and-forget). `lib/user-data.ts`, `saved_searches` table
- [x] Price alerts — `route_watches` table, "🔔 Watch price" button (`RouteActions`),
      `POST /api/watches`. Cron: `app/api/cron/price-check` (Bearer `CRON_SECRET`) re-prices
      har active watch, fare gire to `priceAlertEmail` bhejta hai, `last_price` update.
      `vercel.json` — roz 6am
- [x] Favourite routes — `favourite_routes` table, "☆ Save route" button, `POST /api/favourites`
- [x] `/dashboard` — recent searches + watches + favourites, har item se remove
- **Acceptance:** ✅ DB live on prod — logged-in user "🔔 Watch price" dabaye → watch save,
      `/dashboard` me dikhe → roz 6am cron ([vercel.json](routemitra-app/vercel.json)) re-price kare
      (`CRON_SECRET` set, endpoint 401 without bearer — verified) → fare gire to `priceAlertEmail`.
      **Email abhi console me** (no `RESEND_API_KEY`) — feature ka baaki sab live.

### Phase 14 — Legal, trust & compliance (Day 35–36)  ✅

- [x] **Privacy Policy** (`app/privacy/page.tsx`) — DPDP Act 2023 shaped: itemised data/purpose
  table, consent mechanics, cookies (§5 — Plausible is cookieless, only cookie is the login
  session), sharing/processors + cross-border disclosure, retention table, Data Principal
  rights (access/correct/erase/nominate/grievance), named Grievance Officer, contact
- [x] **Terms of Service** (`app/terms/page.tsx`) — what RouteMitra is (search only, not the
  seller), eligibility, acceptable use, fares/indicative disclaimer, booking/refund disclaimer,
  affiliate/commission disclosure, IP, liability, termination, governing law
- [x] **Cookie consent banner** (`components/CookieConsent.tsx`, wired in `app/layout.tsx`) —
  shows once (localStorage), honest copy (nothing non-essential to consent to yet — see §5)
- [x] Affiliate disclosure — in Terms §6 and `SiteFooter`
- [x] Booking disclaimer — Terms §5, Help page, footer
- [x] Help/Contact page (`app/help/page.tsx`) — booking FAQ, fare-accuracy FAQ, data-rights FAQ,
  grievance-officer contact, support email
- [x] About page (`app/about/page.tsx`)
- [x] `lib/site.ts` — legal identity (`LEGAL_ENTITY_NAME`, `LEGAL_ADDRESS`,
  `GRIEVANCE_OFFICER_NAME/EMAIL`, `SUPPORT_EMAIL`) is env-driven with an honest
  pre-incorporation fallback — nothing fabricated ships in the repo
- [x] Real values **set on Vercel prod**: `NEXT_PUBLIC_LEGAL_ENTITY_NAME` = "UrbanMove Services
  Private Limited", `NEXT_PUBLIC_LEGAL_ADDRESS` = "Mariahu, Jaunpur, Uttar Pradesh 222161"
  (abbreviated, not the residential C/o line), `NEXT_PUBLIC_LEGAL_CIN` = "U49224UP2025PTC229800",
  `NEXT_PUBLIC_GRIEVANCE_OFFICER_NAME` = "Rahul Seth",
  `NEXT_PUBLIC_GRIEVANCE_OFFICER_EMAIL` = "urbanmove.services.pvt.ltd@gmail.com"
- **Acceptance:** ✅ `tsc` + `lint` clean. Legal pages live on prod, footer se accessible;
  cookie banner once. Grievance Officer copy broadened in Phase 28 (IT Rules 2021 + DPDP).

### Phase 15 — Security & reliability (Day 37–39)

- [x] Security headers — `next.config.ts`: CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options,
      Referrer-Policy, Permissions-Policy, `poweredByHeader: false` (E2E se verify)
- [x] Form validation — `lib/validation.ts` (zod) — signup/login/forgot/reset/search/watch schemas,
      routes mein `parse()` se
- [x] CAPTCHA — Cloudflare Turnstile: `components/auth/Turnstile.tsx` + `lib/turnstile.ts`
      server verify. Keys unset ho to widget hidden + verification skip (dev)
- [x] Rate-limiting — `lib/ratelimit.ts` (`@upstash/ratelimit`): `/api/search` (60/min), signup
      (5/10min), forgot/reset. Redis na ho to no-op
- [x] `/api/health` — uptime monitor ping target
- [x] Error capture stopgap — `errors` table + `/api/client-error` (Phase 18 se), admin par dikhta
- [x] **Sentry** integrated (Phase 24) — `@sentry/nextjs` 10.x, client+server+edge configs,
      `instrumentation.ts`, `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_AUTH_TOKEN` (org token, `org:ci`)
      on prod. Source maps upload via Build Command `next build --webpack`.
- [x] Turnstile live — Cloudflare keys set on prod.
- [ ] External uptime monitor (UptimeRobot → `/api/health`, alert on `train_feed.last_ok === false`).
      Neon/Supabase auto-backup confirm  ← tum
- **Acceptance:** ✅ security headers + Sentry + source maps live on prod; rate-limit 429 when Redis
      configured; zod 400 on bad input.

### Phase 16 — Polish: real-website feel (Day 40–42)  ✅

- [x] Brandmark logo (`components/Brandmark.tsx` — 3-mode dots tile) + `app/icon.svg` favicon +
      `app/apple-icon.png` (default Next favicon hataya)
- [x] Custom `app/not-found.tsx` (404, popular-route links) + `app/error.tsx` (500, retry +
      error beacon) + `app/global-error.tsx`
- [x] PWA: `app/manifest.ts` (standalone, theme-color, 192/512 + maskable icons), `viewport`
      themeColor layout mein
- [x] Shared `Masthead` + `SiteFooter` components — har page ka header/footer ab ek jagah se
      (pehle har page apna "Demo build" text carry karta tha)
- [x] "Demo"/"sample" text sabhi pages se hataya; footer mein booking + affiliate + indicative
      disclosure. Legal pages: `/about /help /privacy /terms` — full DPDP-shaped content as of Phase 14
- [x] `indicative` badge: chhota, tooltip ke saath "kyun estimate hai"
- [ ] Professional contact email domain milne par (`hello@routemitra.com`)  ← tum
- **Acceptance:** ✅ prod build mein "demo"/"sample" text nahi (indicative badge ke alawa);
      manifest + maskable icons serve hote hain (Chrome "Install app" ready).

### Phase 17 — Testing & CI (Day 43–44)  ✅

- [x] Vitest unit tests (`tests/unit/`): `normalize` (merge/validate/tracking-links/sort),
      adapters (sample fallback, mode filter, either-direction, unknown route), route slugs +
      cache key. **17 tests pass.**
- [x] Playwright E2E (`tests/e2e/search.spec.ts`): home→search→results→book-link tracking,
      sort reorders, unknown-route empty state, static route page + JSON-LD, 404. **5 pass.**
- [x] GitHub Actions CI (`.github/workflows/ci.yml`): push/PR par `npm ci` → lint → test →
      build, phir alag job mein Playwright E2E
- **Acceptance:** ✅ `npm test` + `npm run test:e2e` dono green locally. CI GitHub par push hone
      par chalega.

### Phase 18 — Admin visibility (Day 45)  ✅

- [x] `/admin` — Basic Auth se protected (`proxy.ts`, `ADMIN_USER`/`ADMIN_PASSWORD`; env unset
      ho to `/admin` 503). Dikhata hai: total clicks, clicks-by-mode, top routes, recent errors
- [x] Provider status table — flight/bus/train/cache/db/geocode/analytics/errors har ek "live"
      (real API) hai ya "fallback" par, `lib/status.ts` se
- [x] `errors` table + `POST /api/client-error` beacon (`app/error.tsx` se) — Sentry (Phase 15)
      tak ke liye stopgap
- [x] `ADMIN_USER` + `ADMIN_PASSWORD` set on prod (`/admin/*` returns 401 without auth — verified).
- **Acceptance:** ✅ creds ke saath `/admin` 200, bina creds 401, env unset 503.

### Phase 19 — Mobile-first + premium visual refresh (autonomous session)  ✅

Sabse zyada users mobile par — poori site mobile-first rebuild + warm-editorial
identity ka premium polish.

- [x] `globals.css` mobile-first rewrite: token scale (space/radius/elevation),
      16px inputs (iOS zoom fix), 44px+ touch targets, `env(safe-area-inset)`,
      `overflow-x` guard, `prefers-reduced-motion`, focus-visible rings. Palette
      gehri (warm paper), dark mode behtar, elevation scale.
- [x] Naya `SiteHeader` — sticky translucent app bar (brand + hamburger),
      scroll par hairline border. Har page use karta hai (`Masthead` bhi).
- [x] **Mobile nav**: `BottomNav` — fixed 3-tab bar (Search / Saved / Account,
      SVG icons, active state, ≥48em pe hide). `NavMenu` — hamburger se
      full-height right drawer (links + Login/Logout + Auto/Light/Dark theme
      control + secondary links). Portal se `<body>` mein render (appbar ka
      backdrop-filter position:fixed ko trap kar deta tha). `UserMenu` +
      standalone `ThemeToggle` ismein fold ho gaye.
- [x] Sticky/overflow iOS fix: `overflow-x: hidden` → `clip` (hidden sticky
      todta hai), date-input `min-width: 0`, `-webkit-` prefixes.
- [x] Result cards (stagger-in), sort tabs (segmented pill), search form, auth
      cards, empty/loading/error states, cookie banner — sab redesign, mobile
      pe stack. Theme toggle (Auto/Light/Dark). Dynamic OG image.
- [x] Operator identity: RouteMitra ko **UrbanMove Services Private Limited**
      operate karti hai — `lib/site.ts` "registered" wording, footer credit,
      named grievance officer (Rahul Seth). `.env.local` mein set.
- [x] Data expand: 18 routes, ~55 cities (IATA), 15 city-hubs (door-to-door).
      60 static pages.
- [x] PWA manifest: shortcuts, categories, maskable icon, portrait.
- [x] a11y: skip-link, `id="main"`, `sr-only` headings.
- [x] Tests: Playwright `mobile` project (Pixel 7) + `tests/e2e/mobile.spec.ts`
      (horizontal overflow per-element on 8 pages, 44px targets, sticky bar,
      hamburger sheet, bottom-nav visibility, mobile search flow).
      **32 e2e + 26 unit green.**
- [x] `next build` Duffel skip (NEXT_PHASE) — quota bachaya, build shaant.
- **Acceptance:** ✅ 375px viewport par koi horizontal scroll nahi, tap targets
      44px+, sticky header stick hota hai, bottom nav + hamburger sheet kaam
      karte hain, search flow chalta hai — Playwright mobile project verify
      karta hai. Warm-editorial identity intact + polished.

### Phase 20 — Free data sources + richer results UI  ✅

**Data — sab env-gated, key na ho to sample:**
- [x] **Flights**: `lib/adapters/flight.ts` priority Duffel > **Travelpayouts** > sample.
      Travelpayouts (Aviasales `prices_for_dates`) = free, INR, cached fares +
      commission (marker se). Airline name+logo (`lib/airlines.ts`,
      `pics.avs.io`), `stops` field.
- [x] **Trains**: `lib/adapters/train.ts` priority **RapidAPI irctc1** > generic > sample.
      `trainBetweenStations` + city→station map (`lib/stations.ts`). Endpoint mein
      fare nahi — `estimateFare(duration, train_type)` se estimate, `indicative`.
- [x] **Buses**: koi free structured API nahi. Sample rahega jab tak RedBus/AbhiBus
      **affiliate** (Cuelinks/INRDeals) sign na ho — tab "Book" links commission denge.
- [x] `TRAVELPAYOUTS_TOKEN` + `_MARKER` (772299) set on prod — flights + hotels + trip-extras live.
- [x] `RAPIDAPI_IRCTC_KEY` set on prod **but free-tier quota exhausted** — adapter tries it first,
      gets nothing, falls to erail.in (Phase 26). Pro ($9.99/mo) baad mein.
- **Amadeus Self-Service band ho gaya (Jul 2026)** — skip.

**UI v2 — richer product feel:**
- [x] Result card redesign (`.rc`): airline logo / mode glyph, visual
      departure–timeline–arrival with duration + stops, bada bold price,
      **Cheapest / Fastest / Best value** tags (`lib/result-meta.ts`), filled Book CTA,
      mode-coloured left border
- [x] Comparison summary strip ("N options · ₹range · time range · sabse sasta …")
- [x] Mode filter chips (Sab / Bus / Train / Flight, counts, coloured active)
- **Acceptance:** ✅ Mumbai→Goa par 12 cards, timeline + logos + tags dikhte hain,
      mode filter kaam karta hai, koi horizontal scroll nahi. 32 e2e + 26 unit green.

---

## Phase 21 — Feedback, support & real admin ✅

**Feedback loop (site-wide):**
- [x] `feedback` table (kind / message / email / page / user / status).
- [x] `POST /api/feedback` — zod-validated, IP rate-limited (5 / 10 min),
      DB-backed with console fallback, best-effort email to `SUPPORT_EMAIL`.
- [x] `components/FeedbackButton.tsx` — floating 💬 widget on every page
      (hidden on `/admin`), kind chips + message + optional email, portal dialog.

**Contact & help:**
- [x] `/contact` — real contact form (posts to `/api/feedback`) + direct channels
      (support email, Grievance Officer, help link, operating entity).
- [x] `/help` rebuilt as a **help center** — 7 categories, `<details>` accordion,
      `FAQPage` JSON-LD for SEO. Footer + nav ab `/contact` link karte hain.

**Admin v2 — sidebar + multi-page (`/admin/*`, Basic-Auth gated):**
- [x] `app/admin/layout.tsx` — sticky sidebar shell + `AdminNav` (active state);
      mobile = scrollable top bar. Sub-routes:
  - **Overview** (`/admin`) — stat cards (link to sections) + daily bar chart +
    newest-feedback preview + top-routes preview
  - **Feedback** (`/admin/feedback`) — full inbox, New/Resolved/All tabs w/ counts,
    Resolve/Reopen server actions (`revalidatePath("/admin","layout")`)
  - **Traffic** (`/admin/traffic`) — searches/clicks cards, search→click %,
    daily chart, top routes (40), clicks-by-mode, recent booking clicks
  - **Users** (`/admin/users`) — total/verified/oauth/alerts/saved-search cards +
    recent signups table
  - **System** (`/admin/system`) — integration status + recent errors
- [x] `searches` table + fire-and-forget `logSearch()` in `/api/search`
      (aggregate only — no IP, no user id).
- [x] `lib/metrics.ts` — `adminMetrics` / `trafficStats` / `userStats` /
      `recentErrors`, all `make_interval(days => $1)` windowed (1d·7d·30d).
- **Acceptance:** ✅ lint + tsc clean; unit 25 pass; **e2e 84 pass** across
      chromium + android + iPhone 14 + iPhone SE. All 5 admin routes 200 w/ auth,
      401 without; feedback submit + inbox + resolve/reopen verified against real
      Postgres; QA user + 10 searches + 3 feedback + 5 clicks + 2 watches all
      reflected in the dashboard.

---

## Phase 22 — Affiliate link wiring (Cuelinks + INRDeals) ✅

Bus/train "Book" links ab commission-capable — ek hi wrapper se.

- [x] `lib/links.ts` — `affiliateWrap(url, mode)` `withTracking()` ke end mein. Bus/train only.
      Precedence: `CUELINKS_CID` → `linksredirect.com/?cid=…&source=linkkit&url=…`,
      warna `INRDEALS_ID` → `inr.deals/track?id=…&src=routemitra&url=…`, warna plain.
      Already-wrapped URL (`linksredirect.com` / `inr.deals/track`) dobara wrap nahi hota.
- [x] `CUELINKS_CID` = 316487 **set on prod** (channel meta-tag verified: `VERIFY-CL-1HCTWR4R`
      in `app/layout.tsx` `metadata.other`). INRDeals ID `urb679085621` as fallback.
- [x] `lib/status.ts` — "Bus / train links (Cuelinks / INRDeals)" row.
- [x] Tests: `tests/unit/links.test.ts` — Cuelinks-over-INRDeals precedence, INRDeals-only
      fallback (11 tests).
- **Note:** Cuelinks par **RedBus + ConfirmTkt campaigns PAUSED** hain (upstream). Plumbing
  ready — resume hote hi commission chalu, koi code change nahi.
- **Acceptance:** ✅ prod `/api/search` — har bus/train option ka `link` =
  `linksredirect.com/?cid=316487…` → deep link. Flights = Travelpayouts `tp.media/r?…`.

## Phase 23 — Ancillary revenue: trip extras + packing list ✅

Har destination/route page pe "before you go" upsell cards + Amazon packing strip.

- [x] `lib/ancillary.ts` — `Extra` type + env-gated builders: `carRental` (`NEXT_PUBLIC_AFF_CARS`),
      `esim` (`_ESIM`), `insurance` (`_INSURANCE`), `activities` (`_ACTIVITIES`),
      `transfer` (`_TRANSFERS`), `lounge` (`_LOUNGE`), `forex` (`_FOREX`),
      `amazon(query,label)` (`NEXT_PUBLIC_AMAZON_ASSOC_TAG`, adds `linkCode=ur2`),
      `uberTo(place)` (free, no env). `fill()` templatiser, `extrasForDestination()`,
      `travelGear()` (6-item `GEAR` list), `ancillaryStatus()`.
- [x] `components/TripExtras.tsx` — server component, card grid (`repeat(auto-fill,minmax(240px,1fr))`,
      1-col ≤520px), `rel="noopener nofollow sponsored"` on paid links, disclosure line.
- [x] `components/TravelGear.tsx` — "Packing list" chips, "As an Amazon Associate…" disclosure.
- [x] Wired into `/search` results, `/routes/[slug]`, `/travel/[slug]` (~90 guide pages).
- [x] Live on prod: **5 Travelpayouts programs** (EKTA insurance, Airalo eSIM, Localrent cars,
      Kiwitaxi transfers, Klook activities — Project 569491, marker 772299) +
      **Amazon Associates** tag `routemitra-21`. GetYourGuide + Viator declined (site too new).
- [x] `lib/status.ts` — `Revenue · …` rows per stream.
- **Acceptance:** ✅ prod trip-extras block renders real `tp.media/r?…` + `amazon.in/s?...&tag=routemitra-21`
      links; hidden when no env configured; mobile 1-col verified.

## Phase 24 — Observability: Sentry, Plausible, AdSense CSP ✅

- [x] **Sentry** `@sentry/nextjs` 10.73 — `instrumentation.ts` (`register` + `onRequestError`),
      `instrumentation-client.ts` (`onRouterTransitionStart`), `sentry.server/edge.config.ts`,
      `global-error.tsx` capture. `withSentryConfig` from `@sentry/nextjs/config`.
      `tracesSampleRate` 0.1 prod. Auto-disables on falsy DSN.
- [x] **Source maps** — Next 16 default build is Turbopack but doesn't set `TURBOPACK` env, so
      Sentry misdetects webpack and skips upload. Fix = Vercel **Build Command → `next build --webpack`**.
      Org token (`org:ci` scope) as `SENTRY_AUTH_TOKEN`. Verified: 12/13 chunks with debug IDs,
      Source Maps page shows archives.
- [x] `next.config.ts` — `connect-src` includes `https://*.ingest.us.sentry.io`;
      `adsOn` (`NEXT_PUBLIC_ADSENSE_CLIENT`) conditionally widens `script/img/frame/connect-src`
      for AdSense; `app/layout.tsx` loads `adsbygoogle.js` only when the client id is set.
- [x] Plausible + Turnstile keys set on prod.
- [ ] AdSense — account needs a custom domain + traffic before approval  ← tum
- **Acceptance:** ✅ Sentry receiving events + source maps on prod; CSP allows Sentry ingest;
      AdSense script gated behind an unset env (no-op for now).

## Phase 25 — Time-of-day filters + result densify ✅

Skyscanner-style "leaves / arrives" windows, and enough options for them to matter.

- [x] `lib/time-buckets.ts` — 4 windows (Night 00–06, Morning 06–12, Afternoon 12–18,
      Evening 18–24), `bucketOf(hhmm)`.
- [x] `components/TimeFilter.tsx` — two rows of 4 chips (dep + arr) with counts, `aria-pressed`,
      disabled when count 0, "Clear times". Mobile: wrap to 2×2.
- [x] `app/search/SearchResults.tsx` — `depBuckets`/`arrBuckets` `Set<number>` state, reset on
      route change, `modeFiltered` → `depCounts`/`arrCounts` → `sortedOptions` filter+sort,
      "N of M options" summary, empty-state "Clear filters".
- [x] `lib/densify.ts` — seeded PRNG (mulberry32 + FNV-1a from route key) pads each mode a route
      already serves with realistic departures across all 4 buckets (~19 options), deterministic
      (SSR == client), marked `indicative` + `source: "sample"`. `lib/sample-data.ts`
      `getSampleOptions()` routes curated sample through `densify()`.
- **Acceptance:** ✅ verified on prod + mobile — chips filter, counts update, no horizontal scroll.

## Phase 26 — Real train data: erail.in + ISR route pages ✅

Bridge until a rail API (TripJack / RapidAPI Pro) is live.

- [x] `lib/adapters/erail.ts` — `erailTrains(fromCode,toCode,date)` fetches
      `erail.in/rail/getTrains.aspx` (`~`/`^` delimited, NOT JSON), needs `User-Agent` + `Referer`.
      Parses train no/name, boarding/alighting, dep/arr (HH.MM), duration, 7-char running-days
      bitmask (Mon..Sun) → drops trains not running the requested weekday. Fares **estimated**
      (`estimateFare` from duration + class regex) and flagged `indicative`, `source: "erail"`.
      10s timeout, empty on any failure. Caps at 15.
- [x] `lib/adapters/train.ts` — source priority now
      **RapidAPI irctc1 → erail (`TRAIN_ERAIL`) → generic provider → sample**.
      `NEXT_PHASE` guard keeps erail out of `next build`. Warn logs on empty/fallback.
- [x] `app/routes/[slug]/page.tsx` — `sampleSearch()` → `runSearch()` (still SSG). Build renders
      sample (phase guard); the ISR revalidate fetches live flights (Travelpayouts) + trains (erail).
- [x] `revalidate` 3600 → **600** so live data propagates ~10 min after a deploy.
      (Every push redeploys and resets that window — expect ~11 min of sample on `/routes/*`
      right after a deploy. `/search` is unaffected, always live.)
- [x] `TRAIN_ERAIL=1` **set on prod**. Verified: Mumbai→Goa shows real Konkan Railway trains
      (Konkan Kanya, Mandovi, Mangaluru Exp, Goa Sampark Kranti, MAO Vande Bharat/Tejas);
      `/routes/mumbai-to-goa` flipped to real data after the 600s window + FAQ JSON-LD updated.
- [x] **Health signal** — `erail.ts` records last outcome per serverless instance;
      `erailHealth()`. `/admin/system` "Trains" row shows `OK (N rows)` / `DEGRADED: <reason>`.
      `/api/health` adds `train_feed { enabled, last_ok, last_at, last_rows, note }` for uptime
      monitors. User-facing notes on the results page: "times from the public IR timetable" when
      erail-sourced, a distinct "representative samples" note when fallen back.
- **Risk (documented):** unofficial scrape, ToS-grey for a registered company, can rate-limit or
      IP-block Vercel egress with no notice, no live fares. Every failure falls through to the next
      source. Retire once TripJack rail is live.
- **Acceptance:** ✅ prod `/api/search` + `/routes/*` show real trains; `/api/health` `train_feed`
      goes `last_ok: true` after a search; degraded path falls back cleanly.

## Phase 27 — Search UX: mode checkboxes, autocomplete, geolocation ✅

- [x] **Mode checkboxes** — `SearchForm` "Show me" ☑ Bus ☑ Train ☑ Flight (all on by default).
      A real subset adds `?modes=bus,train` to the URL; `runSearch` calls only those adapters
      (`Promise.resolve([])` for the rest) — **saves provider quota**. Cache key includes the subset.
      `lib/validation.ts` + `/api/search` accept `modes`; `types/route.ts` `SearchParams.modes`.
- [x] **Autocomplete** — `<datalist>` on from/to now covers every city in `lib/stations.ts`
      (`STATION_CITIES`, ~60), not just the ~20 sample routes. Native, no API call per keystroke.
- [x] **Geolocation** — door-to-door "📍 Use my location" button next to "Full pickup address":
      `navigator.geolocation` → `/api/reverse-geocode?lat=&lon=` → fills the field (still editable).
      `lib/geo.ts` `reverseGeocode()` via Nominatim `/reverse` (Google fallback if
      `GOOGLE_MAPS_API_KEY`), cached. Permission-denied / failure → "type it in" message.
- [x] `next.config.ts` — `Permissions-Policy` `geolocation=()` → `geolocation=(self)` (the `()`
      form blocked the API outright).
- **Acceptance:** ✅ verified on prod (375px + desktop): checkboxes fit one row, datalist resolves
      "chen" → Chennai, `/api/reverse-geocode` returns an address, `Permissions-Policy` allows self.

## Phase 28 — Compliance copy: aggregator disclaimer + IT-Rules grievance officer ✅

- [x] **Aggregator disclaimer at point of use** — a plain-language line on the search results
      page (next to the Book buttons) and `/routes/[slug]`: RouteMitra compares options and
      **doesn't sell tickets**; payment, refunds and support are the operator's / OTA's, under
      their policy. (Footer + `/terms` §1/§4/§5 already had it site-wide.)
- [x] **Grievance Officer broadened** — `/privacy#grievance` §8 now cites **both** the DPDP Act
      2023 and the **IT (Intermediary Guidelines) Rules 2021**, with the registered entity +
      address + CIN and a **24-hour acknowledge / 15-day resolve** commitment + escalation to the
      Data Protection Board. `/contact` block relabeled to match.
- [x] `.env.example` — worked examples for the legal-identity vars.
- **Acceptance:** ✅ all four surfaces verified live on prod (deploy `6b91158`).
- **Open:** the grievance mailbox (`urbanmove.services.pvt.ltd@gmail.com`) must actually be
  monitored to the 24h/15-day SLA; move to `grievance@<domain>` once a domain exists  ← tum

## Phase 29 — Transactional email: real SMTP delivery ✅

Price-alert / verify / reset emails go out for real now, not just console.log.

- [x] `lib/email.ts` — `sendEmail()` picks a transport by env: **SMTP first**
      (`SMTP_HOST`+`SMTP_USER`+`SMTP_PASS`, via `nodemailer`), else Resend, else console.
      `nodemailer` pinned to `^10` (via `overrides` — `next-auth`'s `@auth/core` wants `^7||^8`
      but doesn't exercise the Email-provider path in this app, so forcing 10 is safe and closes
      GHSA-p6gq-j5cr-w38f).
- [x] **Envelope-sender fix** — Hostinger rejected the first attempt with
      `501 5.1.7 Bad sender address syntax` because `MAIL FROM` came from a display-name /
      quote-wrapped `EMAIL_FROM`. Fixed: strip a surrounding quote pair, fall back to `SMTP_USER`
      when there's no `@`, and always send `envelope.from` as a bare addr-spec.
- [x] `SMTP_HOST/PORT/SECURE/USER/PASS` + `EMAIL_FROM` set on prod (Hostinger, `support@jebdekho.com`).
- **Acceptance:** ✅ verified on prod — triggered real reset emails (`/api/auth/forgot`) to
      `jebdekho@gmail.com` and a fresh test signup to `vermavihaan05@gmail.com`; Vercel logs show
      no SMTP error after the envelope fix (the `501` is gone). Deliverability (inbox vs spam)
      depends on `jebdekho.com`'s SPF/DKIM/DMARC — see "Still pending".
- **Open:** rotate the SMTP mailbox password (it passed through a chat transcript).

## Phase 30 — District-level place resolution ✅

Search now understands all 749 Indian districts, not just ~60 major cities — `/list_of_stations.json`
(India Post pincode centroids) is `lib/districts.ts`; two more files the user supplied
(`list_of_stations.json` — 13,147 IR stations, name/code only, no coords; and
`list-of-airports-in-india.csv` — scheduled airports with coords) power the hub fallback.

- [x] `lib/districts.ts` — 749 district names (title-cased), generated from the India Post pincode
      dataset (`Book1.xlsx`, gitignored — regenerate with `scratchpad/parse-districts.mjs`).
- [x] `components/SearchForm.tsx` — `<datalist>` now unions sample-route cities + station cities +
      all 749 districts (769 options) so typing e.g. "luc" suggests "Lucknow". Still a native
      datalist — **zero API calls per keystroke**.
- [x] `lib/district-hubs.ts` — district → nearest station code + nearest airport IATA, generated
      by `scratchpad/gen-district-hubs.mjs`:
  - **Station**: tier 1 = the district's own IR station where its name matches
    `list_of_stations.json` (340 districts); tier 2 = nearest of ~60 major-city stations by
    great-circle distance from the district centroid, capped 275 km (391 more — 735/749 total).
    Regional hub coords added for the NE/hill belt (Agartala, Silchar, Dimapur, New Jalpaiguri,
    Balurghat, Raiganj) so Nagaland/Manipur/Tripura/Mizoram/Sikkim/north-Bengal resolve properly.
    The remaining 14 (Arunachal interior, Ladakh, Lakshadweep, Andaman & Nicobar) genuinely have
    no nearby railway — left station-less rather than faking one.
  - **Airport**: nearest of 85 scheduled airports (81 from the 2020 CSV snapshot + 4 patched in —
    Kushinagar KBK, Sindhudurg SDW, Kalaburagi GBI, Itanagar/Donyi Polo HGI, codes verified via
    web search since the CSV predates them), capped 450 km — **749/749 covered**.
- [x] `lib/stations.ts` `toStationCode()` and `lib/iata.ts` `toIata()` — direct city map first,
      then `DISTRICT_HUBS[key]` fallback. So the erail/IRCTC train adapter and the
      Duffel/Travelpayouts flight adapter both resolve any district, not just the curated city list.
- [x] `tests/unit/places.test.ts` — direct-city, case-insensitivity, district-fallback,
      unknown-place, and "every hub row has station or iata" coverage (5 tests).
- **Acceptance:** ✅ verified on prod, desktop + mobile — `Rae Bareli → Delhi` (neither city was in
      the old ~60-city map) returns 8 real erail trains + 7 real Travelpayouts flights;
      `Kalaburagi → Bengaluru` returns 15 real trains via its own new station (KLBG). No horizontal
      overflow, disclaimers render correctly on both viewports.
- **Note:** `list_of_stations.json` and the airports CSV are gitignored (local source data,
      1.5 MB / 32 KB) — only the generated `lib/district-hubs.ts` (749 rows, ~35 KB) ships.

## Phase 31 — Full visual refresh ✅

The site read as flat/generic — no images anywhere, one blue accent, every page
identical. Fix: **original SVG art**, not stock photos, so no licensing risk.

- [x] `components/HeroArt.tsx` — decorative "journey line" (bus stop → train →
      plane, dotted route) with a warm gradient glow on the homepage hero.
      Desktop only (≥62em), dark-mode aware. New `--warm-1/2/3` + `--warm-ink`
      tokens (light + both dark blocks), kept separate from `--accent` so
      existing UI chrome is untouched.
- [x] `components/DestinationArt.tsx` + `lib/destination-mood.ts` — route,
      travel-guide, **and now `/search`** pages get a gradient banner + line-art
      silhouette keyed to the destination's mood: **beach** (waves + palm,
      teal — Goa, Kochi, Vizag, Trivandrum…), **heritage** (fort/arches,
      terracotta-gold — Jaipur, Udaipur, Jodhpur, Agra, Varanasi, Amritsar…),
      or **metro** (skyline + lit windows, indigo — everything else, the
      default). White text + shadow for contrast regardless of mood. Wired
      into `Masthead` via a `mood` prop; `/search` previously had no banner at
      all (plain `SiteHeader` + a visually-hidden h1) despite being the page
      most searches land on first — fixed.
- [x] `components/ModeIcon.tsx` — stroke-based bus/train/flight icon set
      replacing emoji glyphs in `ResultCard`/`ResumeBooking`; the mode badge
      gets a tinted background in the mode's color instead of flat grey.
- [x] **Result cards — boarding-pass treatment**: a dashed "tear line" before
      the price/book column with two circular notches punched through in the
      page-background color (desktop, `:has()`-free — plain `::before`/`::after`);
      the mode icon now rides the timeline (was two bare dots); a card
      carrying the "Cheapest" tag gets a soft green ring via `:has(.tag-cheap)`;
      1px hover lift.
- [x] `.claude/launch.json` — `routemitra-dev` preview config for future
      `npm run dev` sessions.
- **Acceptance:** ✅ verified via dev-server screenshots (homepage hero,
      beach/heritage/metro banners on Mumbai→Goa / Delhi→Jaipur / Mumbai→Delhi,
      mobile with no text/art overlap, dark mode) and confirmed live on prod
      via a mix of screenshots and computed-style checks when the preview
      pane wasn't paintable that turn.

## Phase 32 — Bug: a proxy station/airport can present a route that doesn't exist ✅

User caught this live: `Ajmer → Bokaro` returned **one** erail "result" —
`AII SRC SPL (08612)`, tagged both Cheapest and Fastest — booking straight to
`confirmtkt.com/trains/ajmer-to-bokaro-train-tickets`. ConfirmTkt's own page
for that exact route says *"No direct train found from Ajmer to Bokaro"* and
lists different alternates entirely.

Root cause: Bokaro has no station of its own in the registry, so it resolved
to the nearest railhead (Ranchi, via `district-hubs.ts`). erail returned a
real, running Ajmer↔Ranchi train and it got presented as if it were an
Ajmer-Bokaro option — the feed only knows the two codes it's handed, not that
one of them is a 100 km proxy.

- [x] `lib/stations.ts` — `resolveStation()` returns `{ code, viaCity? }`;
      `viaCity` is set only when the match came from the district-hub
      "nearest railhead" fallback, not the searched place's own station
      (340/749 districts matched their own station by name; those never
      carry a `viaCity`). `MAJOR_STATION_CITY` names the ~55 fallback-only
      codes. `toStationCode()` now wraps it (back-compat).
- [x] `lib/adapters/train.ts` — when either endpoint is a proxy, every option
      gets `note: "Nearest station used for X via Y — this train may not
      serve the exact place directly. Confirm the stop before booking."`
      Applied to both the irctc1 and erail paths.
- [x] `lib/iata.ts` — the same for flights: `resolveAirport()` /
      `AIRPORT_CITY` (78 codes, generated from the airports CSV + the 4
      patched post-2020 ones). **Every** district-hub airport is a proxy
      (there's no "own airport" tier like stations have), so any district
      without its own airport gets `note: "Nearest airport used for X via Y."`
      on its flights. Lower severity than the train case — Duffel/
      Travelpayouts only return real bookable flights, so there's no
      "this route doesn't exist" risk — but the departure city can still
      surprise someone who typed a small town.
- [x] `types/route.ts` — `RouteOption.note`; `ResultCard` renders it as a
      small warning strip (amber, `⚠`) below the timeline/price row.
- [x] Audited the rest of the fallback surface: 415/749 districts use the
      tier-2 station proxy. Spot-checked 8 spread across regions/states
      (Agar Malwa, Bemetara, Goalpara, Kamareddy, Sundargarh, Paschim
      Bardhaman, West Garo Hills, and a both-sides-proxy pair) — the note
      attaches correctly every time; no other route reproduced the
      single-wrong-result pattern.
- [x] `tests/unit/places.test.ts` — `resolveStation`/`resolveAirport` viaCity
      behavior (36 tests total, all green).
- **Acceptance:** ✅ verified directly against the adapter and live on prod —
      `Ajmer → Bokaro`'s `AII SRC SPL` result now carries the caveat instead
      of presenting a clean match; `Sitapur → Mumbai` shows no note on its
      (own-station) trains but "Nearest airport used for Sitapur via
      Lucknow." on its flights.

---

## Already live on prod (env verified 2026-09-05)

`DATABASE_URL` (Neon, all envs — 9 tables exist) · `AUTH_SECRET` · `AUTH_GOOGLE_ID/SECRET` ·
`CRON_SECRET` · `ADMIN_USER/PASSWORD` · `TRAVELPAYOUTS_TOKEN/MARKER` · `CUELINKS_CID` ·
`RAPIDAPI_IRCTC_KEY` (quota-exhausted) · `TRAIN_ERAIL` · `NEXT_PUBLIC_SENTRY_DSN` +
`SENTRY_AUTH_TOKEN` · `TURNSTILE_SITE_KEY/SECRET` · `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` ·
`GOOGLE_MAPS_API_KEY` · `NEXT_PUBLIC_AFF_*` (cars/esim/insurance/activities/transfers) ·
`NEXT_PUBLIC_AMAZON_ASSOC_TAG` · legal-identity + grievance-officer vars ·
`SMTP_HOST/PORT/SECURE/USER/PASS` + `EMAIL_FROM` (Hostinger).

## Still pending (2026-09-05)

**Tum (external accounts / KYC / money):**
- Rotate secrets that have passed through a chat transcript — `AUTH_SECRET`, `CRON_SECRET`,
  `ADMIN_PASSWORD`, Duffel token, Cuelinks pw, **the Neon DB password** (Neon dashboard → Roles →
  reset `neondb_owner`; the Vercel integration auto-updates `DATABASE_URL`), **and the SMTP
  mailbox password** (Hostinger hPanel → Emails → support@jebdekho.com → Change password, then
  update `SMTP_PASS` on Vercel + redeploy)
- **`jebdekho.com` SPF/DKIM/DMARC DNS** — emails send without error now, but a brand-new domain
  needs these three records or Gmail/Outlook will spam-filter or silently drop them. SPF+DKIM
  are usually auto-set by Hostinger (verify in hPanel → Emails → DNS records); add DMARC:
  `_dmarc.jebdekho.com TXT "v=DMARC1; p=none; rua=mailto:support@jebdekho.com"`
- Custom domain (unblocks AdSense; email already works via Hostinger regardless)
- **Upstash Redis** — accept the marketplace terms
  (`https://vercel.com/jebdekho-1810s-projects/~/integrations/accept-terms/upstash?source=cli`),
  then say so and it gets provisioned in one step. Without it the search cache and all
  rate-limits (`/api/search` 60/min, signup, forgot/reset) are no-ops in production
- Travelpayouts payout method (Payoneer — PayPal India nahi chalta)
- Amazon Associates payment/tax (company PAN `AADCU9117A` + bank) — else tag suspends at 180 days
- RapidAPI IRCTC **Pro** ($9.99/mo) — real fares + live status, better than erail
- External uptime monitor → `/api/health` (alert on `train_feed.last_ok === false`)
- **TBO** KYC docs (Application #185068) when they email
- **TripJack** — submit rail agent form (Owner Name + DOB), then API access via `connect@tripjack.com` + wallet recharge
- GetYourGuide / Viator — reapply when the site is ~2 months old
- Cuelinks — wait for RedBus + ConfirmTkt campaigns to un-pause

**Code (bol do to):**
- Swap erail → TripJack rail adapter when that API is live
- `grievance@<domain>` + monitored inbox once domain exists
- Newer post-2020 airports beyond the 4 already patched, if any matter for a specific route

---

## Claude Code ke saath kaise use karein

- Har phase ek self-contained prompt hai — is file ko project mein rakh kar bol sakte ho:
  *"ROUTEMITRA-ROADMAP.md padho aur Phase 2 complete karo."*
- Har phase ke end mein diya "Acceptance" criteria use verify karne ke liye bolo, agle phase pe
  tabhi badhna jab wo pass ho.
- Jaise-jaise API keys milti jaayein (Duffel, bus, train), unhe `.env.local` mein daal kar bolo:
  *"Phase 4 (ya 5/6) ab real API key ke saath karo."*
