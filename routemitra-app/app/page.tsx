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
    "Compare buses, trains and flights between two cities in one place. Pick the cheapest or the fastest, then book on the operator's own site.",
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
            One place. <span className="hero-modes">Bus</span>,{" "}
            <span className="hero-modes">train</span>,{" "}
            <span className="hero-modes">flight</span>.
          </h1>
          <p className="hero-sub">
            Compare every option between two cities side by side — choose the
            cheapest or the fastest, then head straight to the booking platform.
          </p>

          <SearchForm />

          <p className="hero-note">
            Prefer a <b>door-to-door</b> total? We add the local cab legs so you
            see the full trip. Sign in to set a price alert.
          </p>
        </div>
      </section>

      <main className="wrap" id="main">
        <section className="home-routes">
          <div className="home-routes-head">
            <h2>Popular routes</h2>
            <span className="muted">Tap to jump straight to results</span>
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
                      from <b>{formatPrice(cheapest.price)}</b> ·{" "}
                      {fastest ? formatDuration(fastest.duration_min) : "—"}{" "}
                      fastest
                    </>
                  ) : (
                    "see options"
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
          <h2>How it works</h2>
          <ol className="how-steps">
            <li>
              <span className="how-n">1</span>
              <b>Search</b>
              <span className="muted">From where, to where.</span>
            </li>
            <li>
              <span className="how-n">2</span>
              <b>Compare</b>
              <span className="muted">
                Bus, train, flight — price and time side by side.
              </span>
            </li>
            <li>
              <span className="how-n">3</span>
              <b>Book</b>
              <span className="muted">
                Straight on RedBus / IRCTC / the airline — we only send you
                there.
              </span>
            </li>
          </ol>
        </section>

        <section className="home-features">
          <div>
            <b>Three modes, one search</b>
            <span className="muted">No need to open a different app each time.</span>
          </div>
          <div>
            <b>Door-to-door fare</b>
            <span className="muted">
              Cab + intercity + cab — the total for the whole trip.
            </span>
          </div>
          <div>
            <b>Price alerts</b>
            <span className="muted">
              Watch a route and get an email when the fare drops.
            </span>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
