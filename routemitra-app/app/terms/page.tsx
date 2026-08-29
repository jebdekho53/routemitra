import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import { LEGAL_ENTITY_NAME, LEGAL_ENTITY_STATUS, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <Masthead title="Terms of Service" />
      <main className="wrap">
        <div className="prose">
          <p className="prose-updated">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

          <h2>1. What RouteMitra is</h2>
          <p>
            RouteMitra is a <b>search and comparison tool</b> for bus, train
            and flight options between two places in India, plus an optional
            door-to-door fare estimate. RouteMitra does not sell tickets,
            does not process payments, and is not a travel agent — clicking
            &quot;Book karein&quot; hands you off to the operator or platform
            (RedBus, IRCTC / a rail partner, an airline, or an OTA) to
            complete the booking there.
          </p>

          <h2>2. Eligibility &amp; accounts</h2>
          <ul>
            <li>You should be 18 or older to create an account, or have a parent/guardian&apos;s consent.</li>
            <li>Keep your login credentials to yourself; you&apos;re responsible for activity under your account.</li>
            <li>Give us accurate signup information — it&apos;s what price-alert emails and account recovery rely on.</li>
            <li>We can suspend or remove an account used for abuse, fraud, or to break these terms.</li>
          </ul>

          <h2>3. Acceptable use</h2>
          <p>Don&apos;t use RouteMitra to:</p>
          <ul>
            <li>Scrape, bulk-extract, or resell our search results or aggregated data,</li>
            <li>Abuse the search API, price-alert cron, or rate-limited endpoints beyond normal personal use,</li>
            <li>Attempt to bypass security controls (rate-limits, CAPTCHA, authentication), or</li>
            <li>Use the service for anything unlawful.</li>
          </ul>

          <h2>4. Fares &amp; availability</h2>
          <p>
            Prices, timings and seat availability come from third-party
            providers (or, for a route/mode we haven&apos;t connected a live
            provider to yet, from representative sample data) and can change
            without notice. Anything shown with an <b>indicative</b> badge is
            an estimate, not a live quote — always confirm the final price on
            the booking platform before you pay. Door-to-door cab-fare
            estimates (Uber/Ola/Rapido legs) are approximate and not a quote
            from those platforms.
          </p>

          <h2>5. Booking, payment, refunds &amp; cancellations</h2>
          <p>
            All of this happens on the third-party platform you&apos;re
            redirected to, under <b>their</b> terms and policies — RouteMitra
            is not a party to that transaction and can&apos;t change, refund,
            or cancel a booking made elsewhere. Contact that platform
            directly for booking issues.
          </p>

          <h2>6. How we make money</h2>
          <p>
            Some outbound links to booking platforms are affiliate /
            referral links — RouteMitra may earn a commission or per-click
            fee when you use them, at no extra cost to you. This doesn&apos;t
            change what you pay the operator, and doesn&apos;t affect how
            results are ranked (default sort is by price or duration, not by
            commission).
          </p>

          <h2>7. Content &amp; intellectual property</h2>
          <p>
            The RouteMitra name, design and the way results are compiled
            belong to {LEGAL_ENTITY_STATUS === "registered" ? LEGAL_ENTITY_NAME : "RouteMitra"}. Fares, schedules and
            operator names/logos belong to their respective owners. You can
            use RouteMitra for personal trip planning; you can&apos;t copy,
            scrape or republish it as your own product.
          </p>

          <h2>8. Third-party links</h2>
          <p>
            We link to sites we don&apos;t control (booking platforms, cab
            apps). We&apos;re not responsible for their content, availability
            or how they handle your data — see their own policies.
          </p>

          <h2>9. No warranty &amp; limitation of liability</h2>
          <p>
            RouteMitra is provided &quot;as is&quot;. We try to keep search
            results accurate and the site available, but we don&apos;t
            guarantee fares, availability, or uninterrupted service. To the
            extent the law allows, we&apos;re not liable for indirect losses
            (like a missed connection) arising from using RouteMitra —
            though nothing here limits liability where the law says it
            can&apos;t be limited.
          </p>

          <h2>10. Termination</h2>
          <p>
            You can stop using RouteMitra and delete your account any time
            (Account → Delete account). We can suspend access for terms
            violations, described in §2.
          </p>

          <h2>11. Governing law</h2>
          <p>These terms are governed by the laws of India.</p>

          <h2>12. Changes</h2>
          <p>
            We may update these terms as the product changes; the date above
            reflects the latest version.
          </p>

          <h2>13. Contact</h2>
          <p>
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or the{" "}
            <a href="/help">Help</a> page. See also our{" "}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
