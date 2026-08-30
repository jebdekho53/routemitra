import Link from "next/link";
import type { Metadata } from "next";
import SearchForm from "@/components/SearchForm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { listSampleRoutes, sampleRouteSummary } from "@/lib/sample-data";
import { toSlug } from "@/lib/routes";
import { formatPrice, formatDuration } from "@/lib/format";

export const revalidate = 3600;

export const metadata: Metadata = {
  description:
    "Ek city se dusri city — bus, train aur flight ek jagah compare karo. Sabse sasta ya sabse tez chuno, phir seedha booking platform par jao.",
};

// Landing route cards are teasers — sample data only, so this page renders
// instantly and never calls a live provider (Duffel / Travelpayouts / IRCTC).
function heroRoutes() {
  return listSampleRoutes()
    .slice(0, 6)
    .map(({ from, to }) => {
      const s = sampleRouteSummary(from, to);
      return {
        from,
        to,
        slug: toSlug(from, to),
        cheapest: s?.cheapest ?? null,
        fastest: s?.fastest ?? null,
      };
    });
}

export default function Home() {
  const routes = heroRoutes();

  return (
    <>
      <SiteHeader />

      <section className="hero">
        <div className="wrap">
          <h1>
            Ek jagah. <span className="hero-modes">Bus</span>,{" "}
            <span className="hero-modes">train</span>,{" "}
            <span className="hero-modes">flight</span>.
          </h1>
          <p className="hero-sub">
            Do city ke beech saare options ek saath compare karo — sabse sasta ya
            sabse tez chuno, phir seedha booking platform par jao.
          </p>

          <SearchForm />

          <p className="hero-note">
            Chaho to <b>ghar-se-ghar</b> fare bhi — local cab legs jod kar poora
            total. Login karke price alert laga sakte ho.
          </p>
        </div>
      </section>

      <main className="wrap" id="main">
        <section className="home-routes">
          <div className="home-routes-head">
            <h2>Popular routes</h2>
            <span className="muted">Tap karke seedha results par jao</span>
          </div>
          <div className="route-cards">
            {routes.map(({ from, to, slug, cheapest, fastest }) => (
              <Link key={slug} href={`/routes/${slug}`} className="route-card">
                <span className="route-card-name">
                  {from} <span aria-hidden>→</span> {to}
                </span>
                <span className="route-card-stats">
                  {cheapest ? (
                    <>
                      <b>{formatPrice(cheapest.price)}</b> se ·{" "}
                      {fastest ? formatDuration(fastest.duration_min) : "—"} sabse
                      tez
                    </>
                  ) : (
                    "options dekho"
                  )}
                </span>
                <span className="route-card-dots" aria-hidden>
                  <i className="d-bus" />
                  <i className="d-train" />
                  <i className="d-flight" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-how">
          <h2>Kaise kaam karta hai</h2>
          <ol className="how-steps">
            <li>
              <span className="how-n">1</span>
              <b>Search karo</b>
              <span className="muted">Kahan se, kahan tak.</span>
            </li>
            <li>
              <span className="how-n">2</span>
              <b>Compare karo</b>
              <span className="muted">
                Bus, train, flight — price aur time saath-saath.
              </span>
            </li>
            <li>
              <span className="how-n">3</span>
              <b>Book karo</b>
              <span className="muted">
                Seedha RedBus / IRCTC / airline par — hum sirf bhejte hain.
              </span>
            </li>
          </ol>
        </section>

        <section className="home-features">
          <div>
            <b>Teeno modes, ek search</b>
            <span className="muted">
              Alag-alag apps kholne ki zaroorat nahi.
            </span>
          </div>
          <div>
            <b>Ghar-se-ghar fare</b>
            <span className="muted">
              Cab + intercity + cab — poora trip ka total.
            </span>
          </div>
          <div>
            <b>Price alerts</b>
            <span className="muted">
              Route watch karo, fare gire to email aayega.
            </span>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
