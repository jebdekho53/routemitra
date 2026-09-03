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
    "Get in touch with RouteMitra — help, a bug report, a wrong-fare complaint, or a feature idea.",
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
        tagline="Any problem, question or idea — write to us here."
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
                Usually a reply within 2–3 working days. It’s a small team
                right now — thanks for your patience.
              </p>
            </div>

            <div className="cc-item">
              <span className="cc-label">Grievance Officer</span>
              <span>{GRIEVANCE_OFFICER_NAME}</span>
              <a href={`mailto:${GRIEVANCE_OFFICER_EMAIL}`}>
                {GRIEVANCE_OFFICER_EMAIL}
              </a>
              <p className="muted">
                For data / privacy complaints (DPDP Act, 2023) and content /
                intermediary grievances (IT Rules, 2021). Acknowledged within
                24 hours, resolved within 15 days — full process in{" "}
                <a href="/privacy#grievance">Privacy Policy §8</a>.
              </p>
            </div>

            <div className="cc-item">
              <span className="cc-label">Check first</span>
              <a href="/help">Help center &amp; FAQ</a>
              <p className="muted">
                Booking, refunds, fare accuracy, account / data — most questions
                are answered here.
              </p>
            </div>

            <div className="cc-item">
              <span className="cc-label">Operator</span>
              <span>{entity}</span>
              <p className="muted">
                RouteMitra only searches and compares — booking, payment and
                refunds happen on the respective platform (RedBus / IRCTC /
                airline / OTA).
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
