import Link from "next/link";
import { LEGAL_ENTITY_NAME, LEGAL_CIN } from "@/lib/site";

// Shared site footer. Legal pages (Privacy/Terms/About/Help) are real as of
// Phase 14 — DPDP-compliant privacy policy, ToS, cookie-consent banner.
export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <nav className="footer-links" aria-label="Footer">
          <Link href="/about">About</Link>
          <Link href="/help">Help</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <p>
          RouteMitra only searches and compares — the actual booking happens on
          the respective platform (RedBus, IRCTC, airline / OTA), under their own
          refund / cancellation policy. Where a fare is an estimate you’ll see
          an <b>indicative</b> badge. We may earn a commission on some bookings.
        </p>
        <p className="footer-copy">
          {LEGAL_ENTITY_NAME.toLowerCase() === "routemitra" ? (
            <>© {year} RouteMitra</>
          ) : (
            <>
              RouteMitra is a product of {LEGAL_ENTITY_NAME}. © {year}{" "}
              {LEGAL_ENTITY_NAME}.{LEGAL_CIN ? <> CIN: {LEGAL_CIN}.</> : null}
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
