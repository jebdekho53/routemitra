import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Phase 15 — security headers. CSP is pragmatic: Next injects inline
// styles/scripts, and we load Google Fonts + (optionally) Plausible and
// Cloudflare Turnstile. Tighten with nonces later if needed.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https://pics.avs.io",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  [
    "connect-src 'self'",
    "https://plausible.io",
    "https://nominatim.openstreetmap.org",
    "https://api.duffel.com",
    "https://challenges.cloudflare.com",
  ].join(" "),
  // NOTE: no `upgrade-insecure-requests`. On a proper HTTPS deploy every
  // asset is already https (same-origin or the listed CDNs), so it buys
  // nothing — and over http (dev, or a phone on http://LAN-IP) WebKit/Safari
  // upgrades every asset to https, fails the TLS handshake, and the page
  // loads completely unstyled. HSTS (prod) is what enforces https.
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // HSTS only makes sense on HTTPS; sending it over http dev is pointless
  // and can wedge a browser if it ever saw the dev host on https.
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // `next dev` blocks its own CSS/JS chunks when the page is opened from an
  // origin other than localhost (e.g. a phone hitting the LAN IP) — which
  // shows up as an unstyled page. Allow local network hosts in dev.
  allowedDevOrigins: [
    "192.168.1.7",
    "192.168.1.*",
    "192.168.0.*",
    "10.0.0.*",
    "172.20.10.*",
    "*.local",
  ],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
