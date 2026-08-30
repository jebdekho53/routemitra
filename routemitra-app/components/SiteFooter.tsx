import Link from "next/link";
import { LEGAL_ENTITY_NAME } from "@/lib/site";

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
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <p>
          RouteMitra sirf search aur compare karta hai — actual booking
          respective platform (RedBus, IRCTC, airline/OTA) par hoti hai, unhi ki
          refund/cancellation policy lagti hai. Jahan fare estimate hai wahan{" "}
          <b>indicative</b> badge dikhega. Hum kuch bookings par commission kama
          sakte hain.
        </p>
        <p className="footer-copy">
          © {year} {LEGAL_ENTITY_NAME}
          {LEGAL_ENTITY_NAME.toLowerCase() !== "routemitra" && (
            <> · RouteMitra is a product of {LEGAL_ENTITY_NAME}</>
          )}
        </p>
      </div>
    </footer>
  );
}
