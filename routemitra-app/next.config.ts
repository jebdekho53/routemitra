import type { NextConfig } from "next";

// Phase 15 — security headers. CSP is intentionally pragmatic: Next injects
// inline styles/scripts, and we load Google Fonts + (optionally) Plausible and
// Cloudflare Turnstile. Tighten with nonces later if needed.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
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
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
