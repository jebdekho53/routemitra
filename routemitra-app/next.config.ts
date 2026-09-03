import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const isProd = process.env.NODE_ENV === "production";

// AdSense pulls in a wide set of Google ad hosts. Only widen the CSP for it
// when ads are actually switched on (NEXT_PUBLIC_ADSENSE_CLIENT set), so the
// policy stays tight otherwise.
const adsOn = Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);
const adScript = adsOn
  ? " https://pagead2.googlesyndication.com https://*.googlesyndication.com https://adservice.google.com https://tpc.googlesyndication.com"
  : "";
const adFrame = adsOn
  ? " https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com"
  : "";
const adImg = adsOn
  ? " https://*.googlesyndication.com https://*.g.doubleclick.net https://*.google.com"
  : "";
const adConnect = adsOn
  ? " https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.g.doubleclick.net https://*.google.com"
  : "";

// Phase 15 — security headers. CSP is pragmatic: Next injects inline
// styles/scripts, and we load Google Fonts + (optionally) Plausible and
// Cloudflare Turnstile. Tighten with nonces later if needed.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `img-src 'self' data: blob: https://pics.avs.io${adImg}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://challenges.cloudflare.com${adScript}`,
  `frame-src https://challenges.cloudflare.com${adFrame}`,
  [
    "connect-src 'self'",
    "https://plausible.io",
    "https://nominatim.openstreetmap.org",
    "https://api.duffel.com",
    "https://challenges.cloudflare.com",
    "https://*.ingest.us.sentry.io",
  ].join(" ") + adConnect,
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
    // geolocation=(self) so the door-to-door "use my location" button works
    value: "camera=(), microphone=(), geolocation=(self), browsing-topics=()",
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

// Sentry wraps the config to inject the client/server SDK and (when
// SENTRY_AUTH_TOKEN is set) upload source maps. Everything Sentry does is
// inert at runtime without NEXT_PUBLIC_SENTRY_DSN.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "urbanmove-services-private-lim",
  project: process.env.SENTRY_PROJECT || "routemitra",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // We proxy nothing through Cloudflare, so keep Sentry's own ingest host
  // (allow-listed in the CSP) rather than a same-origin tunnel route.
  tunnelRoute: false,
});
