import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import { SUPPORT_EMAIL, GRIEVANCE_OFFICER_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "How RouteMitra works — search, fare accuracy, door-to-door, booking, refunds, price alerts, and account / data questions.",
};

interface QA {
  q: string;
  a: string; // plain text (also used for JSON-LD)
}
interface Category {
  title: string;
  items: QA[];
}

const CATEGORIES: Category[] = [
  {
    title: "Getting started",
    items: [
      {
        q: "What does RouteMitra do?",
        a: "For a route between two cities it shows bus, train and flight options in one place, with price and time. You compare them, pick the cheapest or the fastest, then go straight to that platform (RedBus, IRCTC, an airline / OTA) to book.",
      },
      {
        q: "Does booking happen on RouteMitra?",
        a: "No. RouteMitra only searches and compares. Tapping “Book now” takes you to the operator / OTA page — payment, ticket and refunds all happen there, under their policy.",
      },
      {
        q: "Do I need an account?",
        a: "No. Search works without signing in. An account is only needed if you want to save routes, set a price alert, or see your history.",
      },
    ],
  },
  {
    title: "Search and results",
    items: [
      {
        q: "How are results sorted?",
        a: "The default is cheapest first. Use the tabs at the top to switch to fastest. The mode filter (Bus / Train / Flight) lets you see one type at a time.",
      },
      {
        q: "What do the “Cheapest”, “Fastest” and “Best value” tags mean?",
        a: "Cheapest = the lowest fare in that list. Fastest = the shortest total time. Best value = the best balance of price and time (a normalised score of both).",
      },
      {
        q: "I can't find my city",
        a: "Right now large and mid-size Indian cities are covered. Tell us the route you need on the Contact page — we keep adding them.",
      },
    ],
  },
  {
    title: "Fare accuracy",
    items: [
      {
        q: "What does the “indicative” badge mean?",
        a: "Indicative means the fare is a best-effort estimate, not a live quote. Where a real-time provider API isn't connected yet, we estimate from typical fares. Always confirm the final price on the booking page.",
      },
      {
        q: "The fare is different on the booking page",
        a: "An estimate and live availability / pricing can differ — demand, date, seat class, dynamic pricing. RouteMitra's number is a reference; the real price is whatever the booking platform shows.",
      },
      {
        q: "How do I report a wrong fare?",
        a: "Note the route and the price shown, then send it from the Contact page under the “Fare looks wrong” category. This is how we fix the estimates.",
      },
    ],
  },
  {
    title: "Door-to-door",
    items: [
      {
        q: "What does door-to-door mode do?",
        a: "Not just the station / airport fare — it adds the cab from your home to the station, the intercity leg, and the cab from the station to your address in the destination city, for a total time and cost for the whole trip.",
      },
      {
        q: "How are the cab prices worked out?",
        a: "The nearest hub is picked from your address (free OpenStreetMap geocoding), then a distance-based estimate is applied. This is also indicative — the actual cab fare in the app may differ.",
      },
    ],
  },
  {
    title: "Price alerts",
    items: [
      {
        q: "How do I set a price alert?",
        a: "Sign in and “watch” a route. We check the lowest fare for that route from time to time; when it drops, you get an email at your registered address.",
      },
      {
        q: "How do I turn an alert off?",
        a: "Go to your dashboard and remove the watched route — it stops immediately.",
      },
    ],
  },
  {
    title: "Account and data",
    items: [
      {
        q: "How do I view or delete my data?",
        a: "When signed in, the Account page lets you view and update your profile, saved searches and watches, or delete your account entirely. Deleting your account also deletes all related data.",
      },
      {
        q: "I forgot my password",
        a: "Use the “Forgot password?” link on the sign-in page to get a reset link. The link expires in 1 hour.",
      },
      {
        q: "Do you use tracking cookies?",
        a: "No. There is only one essential login cookie. Analytics is cookieless. Details are in Privacy Policy §5.",
      },
    ],
  },
  {
    title: "Booking, payment and refunds",
    items: [
      {
        q: "Payment failed / I didn't get a ticket",
        a: "That is an issue with the booking platform (RedBus / IRCTC / airline / OTA) — contact their support, since the transaction and ticket are with them. RouteMitra has no record of your booking or payment.",
      },
      {
        q: "How do refunds / cancellations work?",
        a: "The refund / cancellation policy of the platform you booked with applies. RouteMitra is not in the middle of it.",
      },
      {
        q: "Does RouteMitra take a commission?",
        a: "We may earn an affiliate commission on some bookings — that keeps the product free. It doesn't change your fare and doesn't affect the ranking of results.",
      },
    ],
  },
];

const CONTACT_QA: QA[] = [
  {
    q: "I need help with something else",
    a: `Send a message from the Contact page or email ${SUPPORT_EMAIL}. For a data / privacy complaint, contact the Grievance Officer first: ${GRIEVANCE_OFFICER_EMAIL}.`,
  },
];

const ALL_QA = [...CATEGORIES.flatMap((c) => c.items), ...CONTACT_QA];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ALL_QA.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function HelpPage() {
  return (
    <>
      <Masthead
        title="Help Center"
        tagline="Most questions are answered here — if not, there's the Contact page."
      />
      <main className="wrap" id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        <div className="faq">
          {CATEGORIES.map((cat) => (
            <section key={cat.title} className="faq-cat">
              <h2>{cat.title}</h2>
              {cat.items.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </section>
          ))}

          <section className="faq-cat">
            <h2>Anything else?</h2>
            <p className="prose-note">
              Didn’t find the answer here? Send a message from the{" "}
              <a href="/contact">Contact &amp; Support</a> page — help, a bug, or
              a wrong-fare complaint. For a data / privacy complaint, contact the
              Grievance Officer:{" "}
              <a href={`mailto:${GRIEVANCE_OFFICER_EMAIL}`}>
                {GRIEVANCE_OFFICER_EMAIL}
              </a>{" "}
              (<a href="/privacy#grievance">process</a>).
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
