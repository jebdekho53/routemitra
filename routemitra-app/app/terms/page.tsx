import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <Masthead title="Terms of Service" />
      <main className="wrap">
        <div className="prose">
          <p className="prose-note">Draft — final version Phase 14 mein.</p>
          <ul>
            <li>
              RouteMitra ek search aur comparison tool hai. Hum tickets nahi
              bechte; booking third-party platforms par hoti hai.
            </li>
            <li>
              Fares aur availability providers se aate hain aur badal sakte hain.
              <b> indicative</b> label wale numbers estimate hain.
            </li>
            <li>
              Booking, payment, refund aur cancellation us platform ki policy se
              tay hote hain jahan tum book karte ho.
            </li>
            <li>
              Service &quot;as is&quot; provide ki jaati hai; hum kisi indirect
              nuksaan ke liye liable nahi hain.
            </li>
            <li>
              Kuch outbound links affiliate ho sakte hain — dekho{" "}
              <a href="/privacy">Privacy</a> aur footer disclosure.
            </li>
          </ul>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
