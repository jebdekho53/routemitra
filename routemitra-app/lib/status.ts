// Which integrations are live (real API configured) vs running on the
// sample-data / no-op fallback. Pure env inspection — safe to call anywhere
// server-side. Never expose keys, only booleans.

export interface IntegrationStatus {
  key: string;
  label: string;
  live: boolean;
  detail: string;
}

export function integrationStatus(): IntegrationStatus[] {
  const has = (v?: string) => Boolean(v && v.trim());
  return [
    {
      key: "flight",
      label: "Flights (Duffel)",
      live: has(process.env.DUFFEL_API_KEY),
      detail: has(process.env.DUFFEL_API_KEY)
        ? "Duffel API"
        : "sample data fallback",
    },
    {
      key: "bus",
      label: "Bus provider",
      live: has(process.env.BUS_PROVIDER_API_URL) && has(process.env.BUS_PROVIDER_API_KEY),
      detail:
        has(process.env.BUS_PROVIDER_API_URL) && has(process.env.BUS_PROVIDER_API_KEY)
          ? "HTTP provider (indicative)"
          : "sample data fallback",
    },
    {
      key: "train",
      label: "Train provider",
      live: has(process.env.TRAIN_PROVIDER_API_URL) && has(process.env.TRAIN_PROVIDER_API_KEY),
      detail:
        has(process.env.TRAIN_PROVIDER_API_URL) && has(process.env.TRAIN_PROVIDER_API_KEY)
          ? "HTTP provider (indicative)"
          : "sample data fallback",
    },
    {
      key: "cache",
      label: "Cache (Upstash Redis)",
      live: has(process.env.UPSTASH_REDIS_REST_URL) && has(process.env.UPSTASH_REDIS_REST_TOKEN),
      detail:
        has(process.env.UPSTASH_REDIS_REST_URL) && has(process.env.UPSTASH_REDIS_REST_TOKEN)
          ? "connected"
          : "disabled (no-op)",
    },
    {
      key: "db",
      label: "Database (Postgres)",
      live: has(process.env.DATABASE_URL),
      detail: has(process.env.DATABASE_URL) ? "connected" : "console.log only",
    },
    {
      key: "geocode",
      label: "Geocoding",
      live: true,
      detail: has(process.env.GOOGLE_MAPS_API_KEY)
        ? "Google Geocoding"
        : "OpenStreetMap Nominatim (free)",
    },
    {
      key: "analytics",
      label: "Analytics (Plausible)",
      live: has(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN),
      detail: has(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN)
        ? String(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN)
        : "not configured",
    },
    {
      key: "errors",
      label: "Error monitoring (Sentry)",
      live: has(process.env.SENTRY_DSN),
      detail: has(process.env.SENTRY_DSN)
        ? "Sentry"
        : "local errors table only (Phase 15)",
    },
  ];
}
