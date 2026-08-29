# Deploy & launch checklist (Phase 9)

## One-time: Vercel

1. Push this repo to GitHub (done — `jebdekho53/routemitra`).
2. https://vercel.com → **Add New → Project** → import `jebdekho53/routemitra`.
3. **Root Directory: `routemitra-app`** (the repo also contains the roadmap + demo).
4. Framework preset auto-detects Next.js. Build command / output: leave default.
5. Add environment variables (Project → Settings → Environment Variables) — copy
   from `.env.example`, only the ones you actually have keys for:
   - `NEXT_PUBLIC_SITE_URL` = your final URL (e.g. `https://routemitra.vercel.app`
     or a custom domain)
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
   - `DUFFEL_API_KEY`
   - `DATABASE_URL`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (when ready)
   - bus/train provider vars (when ready)
6. Deploy. Every push to `main` now auto-deploys.

## Custom domain (optional)

Vercel → Project → Domains → add domain → follow DNS steps. Then update
`NEXT_PUBLIC_SITE_URL` and redeploy so canonical URLs / sitemap use it.

## Analytics

- **Plausible:** create a site at plausible.io for your domain, set
  `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` to that domain. The script loads automatically
  (see `app/layout.tsx`). "Book click" custom events fire from `BookButton.tsx`.
- **Own click table:** set `DATABASE_URL` (Neon/Supabase). `POST /api/track` writes
  rows; `GET /api/track` returns the aggregate (clicks by mode, top routes) — this
  is the traction number for partner emails.

## Pre-launch smoke test

```bash
cd routemitra-app
npm run build && npm start
```

- [ ] `/` loads, search works, popular-route links work
- [ ] `/routes/pune-to-bengaluru` renders results server-side (view source → cards
      in HTML, JSON-LD present)
- [ ] `/sitemap.xml` and `/robots.txt` resolve with the right host
- [ ] `/api/search?from=Pune&to=Bengaluru` returns normalized JSON; 2nd call
      `x-cache: HIT` (needs Upstash)
- [ ] "Book karein" opens the platform with `utm_source=routemitra` in the URL
- [ ] Lighthouse (Chrome devtools) Performance + SEO ≥ 90 on `/` and a `/routes/*`

## Launch

- [ ] Deploy to production
- [ ] Analytics live and receiving events
- [ ] Share with 10–20 friends/family, collect feedback (what route did they
      search, did they trust the fares, did they click through)
