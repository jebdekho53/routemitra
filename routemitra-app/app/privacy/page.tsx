import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import {
  LEGAL_ENTITY_NAME,
  LEGAL_ENTITY_STATUS,
  LEGAL_ADDRESS,
  LEGAL_CIN,
  GRIEVANCE_OFFICER_NAME,
  GRIEVANCE_OFFICER_EMAIL,
  SUPPORT_EMAIL,
} from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

// Written for India's Digital Personal Data Protection Act, 2023 (DPDP Act) —
// itemised categories/purposes, consent mechanics, data-principal rights,
// a named grievance officer, retention, and cross-border-transfer disclosure.
// "Data Fiduciary" under DPDP does not require a registered company; the
// identity fields below are env-driven (see lib/site.ts) so nothing here is
// invented — they render an honest pre-incorporation notice until filled in.
export default function PrivacyPage() {
  return (
    <>
      <Masthead title="Privacy Policy" />
      <main className="wrap">
        <div className="prose">
          <p className="prose-updated">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

          <h2>1. Who we are</h2>
          {LEGAL_ENTITY_STATUS === "registered" ? (
            <p>
              This policy is issued by <b>{LEGAL_ENTITY_NAME}</b>
              {LEGAL_ADDRESS ? <>, {LEGAL_ADDRESS}</> : null}
              {LEGAL_CIN ? <> (CIN: {LEGAL_CIN})</> : null} (the &quot;Data
              Fiduciary&quot; under India&apos;s Digital Personal Data
              Protection Act, 2023 — &quot;DPDP Act&quot;) for the RouteMitra
              website and service.
            </p>
          ) : (
            <p>
              RouteMitra is currently an individual-run project (pre-
              incorporation) — there is no registered company yet. Under the
              DPDP Act, an individual can be a &quot;Data Fiduciary&quot; too,
              so this policy applies regardless. Once RouteMitra is
              incorporated, this section will be updated with the registered
              entity name and address. Until then, reach us at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
            </p>
          )}

          <h2>2. What we collect, and why</h2>
          <div className="table-wrap">
            <table className="legal-table">
              <thead>
                <tr><th>Data</th><th>Purpose</th></tr>
              </thead>
              <tbody>
                <tr><td>Search inputs (from / to / date, and door-to-door addresses if you use that)</td><td>To fetch and display bus/train/flight results and door-to-door fare estimates. Addresses are geocoded (OpenStreetMap Nominatim, or Google if configured) and not stored beyond what&apos;s needed to answer that search.</td></tr>
                <tr><td>Click events (which option / operator you click)</td><td>Product analytics, and — in aggregate, never tied to your identity when you&apos;re not logged in — to show operators real traffic when we negotiate API access.</td></tr>
                <tr><td>Account data: name, email, password (hashed, never stored in plain text)</td><td>To create and secure your account, log you in, and let you manage saved searches and price alerts.</td></tr>
                <tr><td>Saved searches, route watches, favourites</td><td>Shown back to you on your dashboard; watches are checked periodically to email you if a fare drops.</td></tr>
                <tr><td>IP address (short-lived)</td><td>Abuse and rate-limit protection on login/signup/search endpoints — not stored long-term or linked to your profile.</td></tr>
                <tr><td>Essential login cookie</td><td>Keeps you signed in. See §5 — this is the only cookie RouteMitra sets itself.</td></tr>
              </tbody>
            </table>
          </div>

          <h2>3. Consent</h2>
          <p>
            Creating an account requires your explicit consent to this
            policy, given via a checkbox at signup. Consent is free, specific
            to the purposes above, and as easy to withdraw as it was to give
            — withdraw it any time by deleting your account (§7) or emailing
            us. Withdrawing consent doesn&apos;t affect processing already
            done, and some data (e.g. what the law requires us to keep) may
            be retained even after withdrawal.
          </p>
          <p>
            Search and door-to-door lookups don&apos;t need an account and
            don&apos;t need separate consent beyond this policy — we process
            only what&apos;s necessary to return your results.
          </p>

          <h2>4. Sharing &amp; processors</h2>
          <p>
            We don&apos;t sell personal data. We share it only where the
            product needs to:
          </p>
          <ul>
            <li><b>The platform you book on</b> — clicking &quot;Book now&quot; sends you to RedBus, IRCTC/a rail partner, an airline or OTA. What happens on their site is covered by their own privacy policy, not ours.</li>
            <li><b>Infrastructure we run on</b> — hosting (Vercel), cache/rate-limiting (Upstash Redis), database (Neon/Supabase Postgres), transactional email (Resend), bot-protection (Cloudflare Turnstile), error monitoring (Sentry, once enabled), privacy-first analytics (Plausible — see §5). These process data on our behalf under their own security terms, not for their own purposes.</li>
          </ul>
          <p>
            Some of these providers may process or store data outside India.
            We only use providers with their own security commitments, and
            we don&apos;t share more data with them than the service needs.
          </p>

          <h2 id="cookies">5. Cookies</h2>
          <p>
            RouteMitra sets exactly one cookie itself: an essential,
            httpOnly session cookie so you stay logged in — this is
            necessary for the account feature to work at all, so it&apos;s
            not something you can opt out of while staying logged in.{" "}
            <b>Plausible analytics is cookieless</b> by design, so it needs
            no cookie and no consent. If that changes (e.g. we add
            cookie-based analytics or ads in future), we&apos;ll show a real
            accept / necessary-only choice before setting anything new —
            see the banner on your first visit.
          </p>

          <h2>6. How long we keep it</h2>
          <ul>
            <li>Account data — while your account is active, deleted within 30 days of you deleting your account (§7), except where we must keep something longer by law.</li>
            <li>Search logs / click events — kept in identifiable form briefly for debugging, then aggregated; aggregated analytics has no personal data.</li>
            <li>Saved searches / watches / favourites — until you remove them or delete your account.</li>
          </ul>

          <h2>7. Your rights</h2>
          <p>As a Data Principal under the DPDP Act, you can:</p>
          <ul>
            <li><b>Access</b> — see what account data we hold. Most of it is already visible on your <a href="/account">Account</a> and <a href="/dashboard">Dashboard</a> pages.</li>
            <li><b>Correct</b> — fix inaccurate details from your Account page, or by emailing us.</li>
            <li><b>Erase</b> — delete your account and associated data from Account → Delete account, or by emailing us.</li>
            <li><b>Nominate</b> — name someone to exercise these rights on your behalf if you die or are incapacitated. Email us to record a nominee.</li>
            <li><b>Grievance redressal</b> — raise a concern with our Grievance Officer (§8) before escalating to the Data Protection Board of India.</li>
          </ul>
          <p>We aim to respond to any rights request within 30 days.</p>

          <h2 id="grievance">8. Grievance Officer</h2>
          <p>
            In line with the DPDP Act, 2023 and the Information Technology
            (Intermediary Guidelines and Digital Media Ethics Code) Rules,
            2021, you can reach our Grievance Officer for any complaint about
            your data, this policy, or content on RouteMitra:
          </p>
          <p>
            <b>{GRIEVANCE_OFFICER_NAME}</b>
            {LEGAL_ENTITY_STATUS === "registered" ? (
              <>
                <br />
                {LEGAL_ENTITY_NAME}
              </>
            ) : null}
            <br />
            Email:{" "}
            <a
              href={`mailto:${
                GRIEVANCE_OFFICER_EMAIL !== SUPPORT_EMAIL
                  ? GRIEVANCE_OFFICER_EMAIL
                  : SUPPORT_EMAIL
              }`}
            >
              {GRIEVANCE_OFFICER_EMAIL !== SUPPORT_EMAIL
                ? GRIEVANCE_OFFICER_EMAIL
                : SUPPORT_EMAIL}
            </a>
            {LEGAL_ADDRESS ? (
              <>
                <br />
                {LEGAL_ADDRESS}
              </>
            ) : null}
            {LEGAL_CIN ? (
              <>
                <br />
                CIN: {LEGAL_CIN}
              </>
            ) : null}
          </p>
          <p>
            We acknowledge every complaint within <b>24 hours</b> and aim to
            resolve it within <b>15 days</b>. If you&apos;re not satisfied with
            the outcome, you can escalate to the Data Protection Board of India
            (for data matters).
          </p>

          <h2>9. Children</h2>
          <p>
            RouteMitra isn&apos;t directed at children. We don&apos;t
            knowingly collect data from anyone under 18; if you believe a
            child has created an account, email us and we&apos;ll remove it.
          </p>

          <h2>10. Changes to this policy</h2>
          <p>
            If this policy changes materially, we&apos;ll update the date at
            the top and, for logged-in users, note it on your next visit.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions about this policy or your data:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>, or the{" "}
            <a href="/help">Help</a> page.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
