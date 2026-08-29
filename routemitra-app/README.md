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

## Routes

- `/` — search + popular routes
- `/search?from=&to=` — client-fetched results (sort by cheapest / fastest)
- `/routes/pune-to-bengaluru` — static, pre-rendered, SEO pages (one per popular
  route; JSON-LD FAQ, in `generateStaticParams`)
- `GET /api/search` — aggregator JSON (`x-cache: HIT|MISS` header)
- `POST /api/track` — click beacon · `GET /api/track` — click aggregate
- `/sitemap.xml`, `/robots.txt`

## Deploy

See [`docs/DEPLOY.md`](docs/DEPLOY.md). Root directory on Vercel is
`routemitra-app`.
