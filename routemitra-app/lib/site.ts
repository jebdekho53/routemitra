// Canonical site URL. Set NEXT_PUBLIC_SITE_URL in production (custom domain).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://routemitra-gamma.vercel.app"
).replace(/\/$/, "");

// --- Legal / operator identity (Phase 14) --------------------------------
// RouteMitra is operated by UrbanMove Services Private Limited. All identity
// fields are env-driven so nothing sensitive is hard-coded; the privacy /
// terms pages render the registered-entity wording when an entity name other
// than the bare "RouteMitra" fallback is set.
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@routemitra.example";

export const LEGAL_ENTITY_NAME =
  process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME || "RouteMitra";

// "registered" once a real operating entity is named (address optional).
export const LEGAL_ENTITY_STATUS =
  LEGAL_ENTITY_NAME.toLowerCase() !== "routemitra"
    ? "registered"
    : "pre-incorporation";

export const LEGAL_ADDRESS = process.env.NEXT_PUBLIC_LEGAL_ADDRESS || null;

// MCA Corporate Identification Number — public record once registered.
export const LEGAL_CIN = process.env.NEXT_PUBLIC_LEGAL_CIN || null;

export const GRIEVANCE_OFFICER_NAME =
  process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER_NAME || "Grievance Officer";

export const GRIEVANCE_OFFICER_EMAIL =
  process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER_EMAIL || SUPPORT_EMAIL;
