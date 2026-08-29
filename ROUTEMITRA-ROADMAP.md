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

**Update (is roadmap ka v2):** Phases 0–11 (search + door-to-door) code-complete hain — lekin
"real website jaisa" feel karne ke liye sirf search kaafi nahi hai. Skyscanner/Ola jaisi site
mein login/signup/logout, legal pages, security, aur polish bhi hota hai — wo sab Phase 12–18
mein hai. Neeche ek quick map hai ki kya ban chuka hai aur kya abhi missing hai.

| Category | Status |
|---|---|
| Search + compare (bus/train/flight) | ✅ Phase 0–2 |
| Cache, real flight/bus/train adapters | ✅ Phase 3–6 (code ready, keys baaki) |
| Click-tracking, SEO, deploy, growth | ✅ Phase 7–10 |
| Door-to-door (ghar se ghar) | ✅ Phase 11 |
| **Accounts — signup/login/logout** | ❌ Phase 12 |
| **Saved searches, price alerts** | ❌ Phase 13 |
| **Legal — privacy, terms, cookie consent** | ⚠️ Phase 14 (stub pages hain, content baaki) |
| **Security — CAPTCHA, rate-limit, monitoring** | ❌ Phase 15 |
| **Polish — remove demo feel, PWA, error pages** | ✅ Phase 16 |
| **Testing/CI** | ✅ Phase 17 |
| **Admin dashboard** | ✅ Phase 18 |

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

### Phase 12 — Accounts: Signup, Login, Logout (Day 28–31)

Abhi tak sab kuch anonymous hai. Real product (Ola/Skyscanner jaisa) mein user account banata
hai, login karta hai, logout karta hai — tabhi saved searches, price alerts, booking history
jaisi cheezein possible hoti hain.

- [ ] Auth library: **Auth.js (NextAuth v5)** — Next.js ke saath sabse better fit, email+password
  aur OAuth dono handle karta hai, session cookies khud manage karta hai
- [ ] `users` table Postgres mein: `id, email, name, password_hash, email_verified_at,
  oauth_provider, created_at`
- [ ] **Signup** — email + password form, password `bcrypt`/`argon2` se hash, ek verification
  email bhejo (link click → `email_verified_at` set)
- [ ] **Login** — email+password + "Continue with Google" button (India mein Google login
  sabse zyada use hota hai — kam friction)
- [ ] **Logout** — session/cookie clear, `/` par redirect
- [ ] **Forgot password** — reset-link email flow
- [ ] Header mein login state: logged-out par "Login" button, logged-in par "Hi, {name} ▾"
  dropdown (Account, Logout)
- [ ] Account settings page — naam/email update, password change, **delete account** (data
  privacy ke liye zaroori — user apna data delete kar sake)
- [ ] Login/signup par basic rate-limit (Upstash Redis already hai — usi se IP-based limiter)
- **Acceptance:** Naya user signup kare → verification email aaye → login kare → header mein
  naam dikhe → logout kare → session clear ho jaaye. Google se bhi login chale.

### Phase 13 — Logged-in user features (Day 32–34)

- [ ] Saved/recent searches — logged-in user ki last 10 searches DB mein save ho, dashboard
  par dikhein
- [ ] Price alerts — user ek route "watch" kare, agar fare kam ho to email jaaye (daily cron
  check — Vercel Cron ya GitHub Actions scheduled job)
- [ ] Wishlist/favourite routes
- **Acceptance:** Logged-in user ek route watch kare, test mein fare-drop simulate karke email
  aata dikhe.

### Phase 14 — Legal, trust & compliance (Day 35–36)

Ek search-and-redirect site ke liye bhi ye zaroori hai — bina iske koi bhi real user trust
nahi karega, aur India ke DPDP Act 2023 ke hisaab se data collect karne par disclosure zaroori
bhi hai.

- [ ] **Privacy Policy** — kya data collect hota hai (email, search history, click events),
  kaise use hota hai, delete kaise karayein
- [ ] **Terms of Service**
- [ ] **Cookie consent banner** — pehli visit par (Plausible + click-tracking cookies ke liye)
- [ ] **Affiliate disclosure** — "Hum kuch bookings par commission kama sakte hain" — Skyscanner
  bhi ye clearly likhta hai, transparency trust badhata hai
- [ ] **Booking disclaimer** — clarify karo ki actual booking RedBus/IRCTC/airline ki site par
  hoti hai, RouteMitra us transaction ko control nahi karta (refund/cancellation unki policy se)
- [ ] **Help/Contact page** — real support email, FAQ
- [ ] **About page**
- [ ] Footer redesign — sab legal links + social + copyright, har page par consistent
- **Acceptance:** Har legal page live aur footer se ek click mein accessible; cookie banner
  pehli visit par dikhta hai aur dismiss hone ke baad wapas nahi aata.

### Phase 15 — Security & reliability (Day 37–39)

- [ ] Security headers — CSP, HSTS, X-Frame-Options (`next.config.ts` mein)
- [ ] Form validation — `zod` se signup/login/search input sanitize + validate
- [ ] CAPTCHA on signup — **Cloudflare Turnstile** (free, privacy-friendly, Google reCAPTCHA se
  behtar UX)
- [ ] API rate-limiting — `@upstash/ratelimit` (Redis already hai) `/api/search` aur auth
  endpoints par
- [ ] Error monitoring — **Sentry** free tier, frontend + API dono
- [ ] Uptime monitoring — UptimeRobot ya Better Uptime free tier, site down hone par alert
- [ ] Postgres backup verify — Neon/Supabase ka auto-backup on hai ye confirm karo
- **Acceptance:** Sentry mein ek test error log ho; rapid-fire requests par rate-limit 429
  return kare; uptime monitor live URL ping kar raha ho.

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
      disclosure. Legal stub pages: `/about /help /privacy /terms` (Phase 14 content bharega)
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
- [ ] `.env.local` mein `ADMIN_USER` + `ADMIN_PASSWORD` set karo  ← tum
- **Acceptance:** ✅ creds ke saath `/admin` 200 (dashboard), bina creds 401, env unset 503.
      Verified: `curl -u admin:… /admin`.

---

## Claude Code ke saath kaise use karein

- Har phase ek self-contained prompt hai — is file ko project mein rakh kar bol sakte ho:
  *"ROUTEMITRA-ROADMAP.md padho aur Phase 2 complete karo."*
- Har phase ke end mein diya "Acceptance" criteria use verify karne ke liye bolo, agle phase pe
  tabhi badhna jab wo pass ho.
- Jaise-jaise API keys milti jaayein (Duffel, bus, train), unhe `.env.local` mein daal kar bolo:
  *"Phase 4 (ya 5/6) ab real API key ke saath karo."*
