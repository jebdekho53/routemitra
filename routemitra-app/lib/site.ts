// Canonical site URL. Set NEXT_PUBLIC_SITE_URL in production (custom domain).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://routemitra.vercel.app"
).replace(/\/$/, "");

// --- Legal identity (Phase 14) -------------------------------------------
// DPDP Act 2023 treats any person/entity that decides why & how personal
// data is processed as a "Data Fiduciary" — a registered company is not
// required. These are env-driven so nothing fabricated ships in the repo:
// fill NEXT_PUBLIC_LEGAL_* once there's a real registered entity, and the
// privacy/terms pages pick it up automatically. Until then the honest
// pre-incorporation fallback below is what renders.
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@routemitra.example";

export const LEGAL_ENTITY_NAME =
  process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME || "RouteMitra";

export const LEGAL_ENTITY_STATUS = process.env.NEXT_PUBLIC_LEGAL_ADDRESS
  ? "registered"
  : "pre-incorporation"; // no registered company yet — run by an individual founder

export const LEGAL_ADDRESS = process.env.NEXT_PUBLIC_LEGAL_ADDRESS || null;

export const GRIEVANCE_OFFICER_NAME =
  process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER_NAME || "RouteMitra Founder";

export const GRIEVANCE_OFFICER_EMAIL =
  process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER_EMAIL || SUPPORT_EMAIL;
