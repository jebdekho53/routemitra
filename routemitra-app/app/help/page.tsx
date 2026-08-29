import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import { SUPPORT_EMAIL, GRIEVANCE_OFFICER_EMAIL } from "@/lib/site";

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
            ticket, refund sab wahin hota hai. Detail:{" "}
            <a href="/terms">Terms of Service</a>.
          </p>

          <h2>Fare galat dikh raha hai</h2>
          <p>
            <b>indicative</b> badge wale fare estimate hote hain (live API abhi
            connect nahi). Final price hamesha booking page par confirm karo.
          </p>

          <h2>Apna data dekhna / delete karna hai</h2>
          <p>
            Login ho to <a href="/account">Account</a> page se apna data dekh
            sakte ho, update kar sakte ho, ya account delete kar sakte ho. Poora
            detail: <a href="/privacy">Privacy Policy</a>.
          </p>

          <h2>Grievance / complaint</h2>
          <p>
            Data ya privacy se related complaint pehle humare Grievance
            Officer ko bhejo:{" "}
            <a href={`mailto:${GRIEVANCE_OFFICER_EMAIL}`}>{GRIEVANCE_OFFICER_EMAIL}</a>
            . Poora process <a href="/privacy#grievance">Privacy Policy §8</a>{" "}
            mein hai.
          </p>

          <h2>Contact</h2>
          <p>
            Feedback ya koi bhi problem:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
