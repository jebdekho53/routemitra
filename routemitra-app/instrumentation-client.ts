// Sentry — browser init. Runs before the app becomes interactive.
// No-op without NEXT_PUBLIC_SENTRY_DSN (baked at build time).
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  sendDefaultPii: false,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
});

// App Router navigation instrumentation.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
