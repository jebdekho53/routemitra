import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <Masthead title="Privacy Policy" />
      <main className="wrap">
        <div className="prose">
          <p className="prose-note">
            Draft — final legal wording Phase 14 mein DPDP Act 2023 ke hisaab se
            review hoga.
          </p>
          <h2>Kya data collect hota hai</h2>
          <ul>
            <li>Search queries (from / to / date / addresses) — results dikhane ke liye.</li>
            <li>Click events (kaunsa option click hua) — anonymous, product analytics ke liye.</li>
            <li>Account banane par: email aur naam (Phase 12 ke baad).</li>
          </ul>
          <h2>Kaise use hota hai</h2>
          <p>
            Sirf service chalane, improve karne aur (aggregate form mein) partner
            reporting ke liye. Hum personal data bechte nahi.
          </p>
          <h2>Delete</h2>
          <p>
            Account delete karne par tumhara data hata diya jaata hai. Request:{" "}
            <a href="/help">Help / Contact</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
