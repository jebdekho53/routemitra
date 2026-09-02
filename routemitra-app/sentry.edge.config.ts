// Sentry — Edge runtime init (proxy.ts, edge routes). Loaded from
// instrumentation.ts. No-op without NEXT_PUBLIC_SENTRY_DSN.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  sendDefaultPii: false,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
});
