import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import { SUPPORT_EMAIL, GRIEVANCE_OFFICER_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "RouteMitra kaise kaam karta hai — search, fare accuracy, ghar-se-ghar, booking, refund, price alerts aur account/data ke sawaal.",
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
    title: "Shuru kaise karein",
    items: [
      {
        q: "RouteMitra karta kya hai?",
        a: "Ek city se dusri city ke liye bus, train aur flight — teeno options ek hi jagah, price aur time ke saath. Tum compare karke sabse sasta ya sabse tez chun sakte ho, phir booking ke liye seedhe us platform (RedBus, IRCTC, airline/OTA) par chale jaate ho.",
      },
      {
        q: "Kya RouteMitra par hi booking hoti hai?",
        a: "Nahi. RouteMitra sirf search aur compare karta hai. 'Book karein' dabane par tum us operator/OTA ke page par pahunch jaate ho — payment, ticket aur refund sab wahin hota hai, unhi ki policy lagti hai.",
      },
      {
        q: "Account banana zaroori hai?",
        a: "Nahi. Search bina login ke chalta hai. Account sirf tab chahiye jab tum routes save karna, price alert lagana ya apni history dekhna chahte ho.",
      },
    ],
  },
  {
    title: "Search aur results",
    items: [
      {
        q: "Results kis hisaab se sort hote hain?",
        a: "Default 'sabse sasta' hai. Upar diye tabs se 'sabse tez' par switch kar sakte ho. Mode filter (Bus / Train / Flight) se ek hi type ke options dekh sakte ho.",
      },
      {
        q: "'Cheapest', 'Fastest', 'Best value' tags ka matlab?",
        a: "Cheapest = us list ka sabse kam fare. Fastest = sabse kam total time. Best value = price aur time ka behtareen balance (dono ka normalised score).",
      },
      {
        q: "Meri city nahi mil rahi",
        a: "Abhi bade aur mid-size Indian sheher cover hain. Jo route chahiye wo Contact page par bata do — hum add karte rehte hain.",
      },
    ],
  },
  {
    title: "Fare accuracy",
    items: [
      {
        q: "'indicative' badge ka matlab kya hai?",
        a: "Indicative = wo fare ek best-effort estimate hai, live quote nahi. Jahan real-time provider API abhi connect nahi hui wahan hum typical fare se estimate lagate hain. Final price hamesha booking page par confirm karo.",
      },
      {
        q: "Fare booking page par alag dikh raha hai",
        a: "Estimate aur live availability/pricing mein farq aa sakta hai — demand, date, seat class, dynamic pricing. RouteMitra ka number reference ke liye hai; asli price wahi hai jo booking platform dikhata hai.",
      },
      {
        q: "Galat fare report kaise karein?",
        a: "Us result ke saath route aur dikha hua price note karke Contact page se 'Fare galat' category mein bhej do. Isse hum estimates theek karte hain.",
      },
    ],
  },
  {
    title: "Ghar-se-ghar (door-to-door)",
    items: [
      {
        q: "Ghar-se-ghar mode kya karta hai?",
        a: "Sirf station/airport ka fare nahi — tumhare ghar se station tak ki cab, intercity leg, aur pahunchne wale sheher mein station se address tak ki cab — teeno milakar poore trip ka total time aur kharcha.",
      },
      {
        q: "Cab ke daam kaise nikalte hain?",
        a: "Address se nearest hub khud chun liya jaata hai (free OpenStreetMap geocoding), phir distance-based estimate lagta hai. Ye bhi indicative hai — actual cab fare app par alag ho sakta hai.",
      },
    ],
  },
  {
    title: "Price alerts",
    items: [
      {
        q: "Price alert kaise lagta hai?",
        a: "Login karke kisi route ko 'watch' karo. Hum time-time par us route ka sabse kam fare check karte hain; girne par tumhare registered email par notification aata hai.",
      },
      {
        q: "Alert band kaise karein?",
        a: "Dashboard par jaake us watched route ko hata do — turant band ho jaayega.",
      },
    ],
  },
  {
    title: "Account aur data",
    items: [
      {
        q: "Apna data kaise dekhun / delete karun?",
        a: "Login ho to Account page se profile, saved searches aur watches dekh/update kar sakte ho, ya poora account delete kar sakte ho. Account delete karne par saara juda hua data bhi delete ho jaata hai.",
      },
      {
        q: "Password bhool gaya",
        a: "Login page par 'Password bhool gaye?' link se reset link mangwao. Link 1 ghante mein expire hota hai.",
      },
      {
        q: "Kya tum tracking cookies use karte ho?",
        a: "Nahi. Sirf ek essential login cookie hai. Analytics cookieless hai. Detail Privacy Policy §5 mein.",
      },
    ],
  },
  {
    title: "Booking, payment aur refund",
    items: [
      {
        q: "Payment fail ho gaya / ticket nahi mila",
        a: "Ye issue booking platform (RedBus / IRCTC / airline / OTA) ka hai — unke support se sampark karo, kyunki transaction aur ticket unke paas hai. RouteMitra ke paas tumhari booking ya payment ka koi record nahi hota.",
      },
      {
        q: "Refund / cancellation kaise hoga?",
        a: "Jis platform se ticket liya usi ki refund/cancellation policy lagti hai. RouteMitra beech mein nahi aata.",
      },
      {
        q: "Kya RouteMitra commission leta hai?",
        a: "Kuch bookings par affiliate commission mil sakta hai — isse product free rehta hai. Isse tumhare fare par koi farq nahi padta aur results ranking par asar nahi daala jaata.",
      },
    ],
  },
];

const CONTACT_QA: QA[] = [
  {
    q: "Kisi aur cheez mein help chahiye",
    a: `Contact page se message bhejo ya ${SUPPORT_EMAIL} par email karo. Data/privacy complaint pehle Grievance Officer ko: ${GRIEVANCE_OFFICER_EMAIL}.`,
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
        tagline="Zyadatar sawaalon ka jawab yahin — nahi mila to Contact page hai."
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
            <h2>Aur kuch?</h2>
            <p className="prose-note">
              Yahan jawab nahi mila? <a href="/contact">Contact &amp; Support</a>{" "}
              page se seedha message bhejo — help, bug, ya fare galat hone ki
              shikayat. Data / privacy complaint ke liye Grievance Officer:{" "}
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
