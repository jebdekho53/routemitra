import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import ContactForm from "./ContactForm";
import {
  SUPPORT_EMAIL,
  GRIEVANCE_OFFICER_NAME,
  GRIEVANCE_OFFICER_EMAIL,
  LEGAL_ENTITY_NAME,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Support",
  description:
    "RouteMitra se baat karo — help, bug report, fare galat hone ki shikayat, ya feature idea.",
};

export default function ContactPage() {
  const entity =
    LEGAL_ENTITY_NAME.toLowerCase() === "routemitra"
      ? "RouteMitra"
      : LEGAL_ENTITY_NAME;

  return (
    <>
      <Masthead
        title="Contact & Support"
        tagline="Koi bhi problem, sawaal ya idea — yahin likho."
      />
      <main className="wrap" id="main">
        <div className="contact-grid">
          <section>
            <ContactForm />
          </section>

          <aside className="contact-channels">
            <h2>Direct channels</h2>

            <div className="cc-item">
              <span className="cc-label">Support email</span>
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              <p className="muted">
                Aam taur par 2–3 working days mein reply. Abhi ek chhoti team
                hai — patience ke liye shukriya.
              </p>
            </div>

            <div className="cc-item">
              <span className="cc-label">Grievance Officer (DPDP)</span>
              <span>{GRIEVANCE_OFFICER_NAME}</span>
              <a href={`mailto:${GRIEVANCE_OFFICER_EMAIL}`}>
                {GRIEVANCE_OFFICER_EMAIL}
              </a>
              <p className="muted">
                Data / privacy se judi complaint ke liye. Process:{" "}
                <a href="/privacy#grievance">Privacy Policy §8</a>.
              </p>
            </div>

            <div className="cc-item">
              <span className="cc-label">Pehle ye dekho</span>
              <a href="/help">Help center &amp; FAQ</a>
              <p className="muted">
                Booking, refund, fare accuracy, account/data — zyadatar sawaalon
                ka jawab yahin hai.
              </p>
            </div>

            <div className="cc-item">
              <span className="cc-label">Operator</span>
              <span>{entity}</span>
              <p className="muted">
                RouteMitra sirf search &amp; compare karta hai — booking, payment
                aur refund respective platform (RedBus / IRCTC / airline / OTA)
                par hote hain.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
