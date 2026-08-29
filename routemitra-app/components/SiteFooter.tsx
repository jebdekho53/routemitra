import Link from "next/link";

// Shared site footer. Phase 14 will add the real legal pages; the links are
// here now so the structure is stable.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <nav className="footer-links">
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
          © {new Date().getFullYear()} RouteMitra
        </p>
      </div>
    </footer>
  );
}
