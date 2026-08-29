// Canonical site URL. Set NEXT_PUBLIC_SITE_URL in production (custom domain).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://routemitra.vercel.app"
).replace(/\/$/, "");
