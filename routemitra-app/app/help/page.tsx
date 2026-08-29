import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Help & Contact" };

export default function HelpPage() {
  return (
    <>
      <Masthead title="Help & Contact" />
      <main className="wrap">
        <div className="prose">
          <h2>Booking kaise hoti hai?</h2>
          <p>
            RouteMitra sirf options dikhata hai. &quot;Book karein&quot; dabane
            par tum us operator/OTA ke page par chale jaate ho — payment,
            ticket, refund sab wahin hota hai.
          </p>
          <h2>Fare galat dikh raha hai</h2>
          <p>
            <b>indicative</b> badge wale fare estimate hote hain (live API abhi
            connect nahi). Final price hamesha booking page par confirm karo.
          </p>
          <h2>Contact</h2>
          <p>
            Feedback ya problem:{" "}
            <a href="mailto:hello@routemitra.example">hello@routemitra.example</a>
            {"  "}(real support email domain milne ke baad update hoga).
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
