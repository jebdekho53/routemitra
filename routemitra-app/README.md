# RouteMitra

One page to compare **bus, train and flight** options for an Indian city-to-city
route, then hand off to the operator/OTA to book. Next.js 16 (App Router) +
TypeScript. See [`../ROUTEMITRA-ROADMAP.md`](../ROUTEMITRA-ROADMAP.md) for the
phase-by-phase plan.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional — app runs on sample data without any keys
npm run dev                  # http://localhost:3000
```

## How it works

```
Search form ─▶ /api/search ─▶ lib/search.runSearch()
                                 ├─ cache check (Upstash Redis, lib/cache.ts)
                                 ├─ Promise.allSettled([
                                 │     adapters/bus.ts    (RapidAPI → RedBus GDS)
                                 │     adapters/train.ts  (RapidAPI → ConfirmTkt/RailYatri)
                                 │     adapters/flight.ts (Duffel)
                                 │  ])
                                 ├─ lib/normalize.ts  (merge, validate, add tracking params)
                                 └─ cache set (non-empty only)
```

**Every integration is optional.** With an env var unset, that adapter (or the
cache, or the DB) falls back to sample data / a no-op, so the whole app always
runs. Fill in keys as providers are approved — see `.env.example`.

| Concern | Env vars | Fallback when unset |
|---|---|---|
| Cache | `UPSTASH_REDIS_REST_*` | no caching |
| Flights | `DUFFEL_API_KEY` | sample flights |
| Bus | `BUS_PROVIDER_API_URL` / `_KEY` / `_HOST` | sample buses |
| Train | `TRAIN_PROVIDER_API_URL` / `_KEY` / `_HOST` | sample trains (labelled `indicative`) |
| Click tracking | `DATABASE_URL` | `console.log` only |
| Analytics | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | script not loaded |
| Canonical URLs | `NEXT_PUBLIC_SITE_URL` | `https://routemitra.vercel.app` |
| Geocoding (door-to-door) | `GOOGLE_MAPS_API_KEY` | free OSM Nominatim |
| Admin dashboard | `ADMIN_USER` + `ADMIN_PASSWORD` | `/admin` returns 503 |
| Accounts (Auth.js) | `AUTH_SECRET` (+ DB) | auth routes 503 |
| Google login | `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` | button hidden |
| Transactional email | `RESEND_API_KEY` | emails printed to console |
| Signup CAPTCHA | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | skipped |
| Price-alert cron | `CRON_SECRET` | endpoint open (dev) |

## Routes

- `/` — search + popular routes
- `/search?from=&to=` — client-fetched results (sort by cheapest / fastest);
  optional `&origin=&destination=` for door-to-door totals
- `/routes/pune-to-bengaluru` — static, pre-rendered, SEO pages (one per popular
  route; JSON-LD FAQ, in `generateStaticParams`)
- `/about`, `/help`, `/privacy`, `/terms` — legal/info (stubs; Phase 14)
- `/login`, `/signup`, `/forgot`, `/reset` — auth (Auth.js / NextAuth v5)
- `/dashboard` — recent searches, price watches, favourites (auth-gated)
- `/account` — profile / password / delete account (auth-gated)
- `/admin` — Basic-Auth dashboard: clicks, top routes, provider status, errors
- `GET /api/search` — aggregator JSON (`x-cache: HIT|MISS`; zod-validated; rate-limited)
- `POST /api/track` — click beacon · `GET /api/track` — click aggregate
- `POST /api/watches` · `POST /api/favourites` — save routes (auth)
- `GET /api/cron/price-check` — price-alert cron (Bearer `CRON_SECRET`)
- `GET /api/health` — uptime ping
- `/manifest.webmanifest`, `/sitemap.xml`, `/robots.txt`

## Tests

```bash
npm test         # Vitest unit tests (normalize, adapters, routes)
npm run test:e2e # Playwright E2E (search flow) — needs: npx playwright install chromium
```

CI (`.github/workflows/ci.yml`, repo root) runs lint + unit + build, then E2E,
on every push/PR to `main`.

## Deploy

See [`docs/DEPLOY.md`](docs/DEPLOY.md). Root directory on Vercel is
`routemitra-app`.
