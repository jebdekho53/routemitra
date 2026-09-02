// Sentry — Node runtime init. Loaded from instrumentation.ts.
// No-op when NEXT_PUBLIC_SENTRY_DSN is unset (the SDK disables itself on a
// falsy dsn), so local dev and un-configured environments are unaffected.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  sendDefaultPii: false,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
});
