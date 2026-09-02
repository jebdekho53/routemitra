// SEO content: "How to get from X to Y" — door-to-door route guides.
// Pre-rendered at build, revalidated daily. Real content (options + hub-aware
// cab estimates) so crawlers see substance, not a stub.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import HotelCta from "@/components/HotelCta";
import TripExtras from "@/components/TripExtras";
import { formatDuration, formatPrice } from "@/lib/format";
import { bookingLink } from "@/lib/links";
import {
  guideSlugs,
  guideFromSlug,
  guideData,
  relatedGuideSlugs,
  type GuideOption,
} from "@/lib/guides";

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return guideSlugs().map((slug) => ({ slug }));
}

const MODE_LABEL = { bus: "Bus", train: "Train", flight: "Flight" } as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const route = guideFromSlug(slug);
  if (!route) return { title: { absolute: "Guide not found — RouteMitra" } };
  const { from, to } = route;
  const title = `How to get from ${from} to ${to} — door to door`;
  const description = `The realistic door-to-door cost and time from ${from} to ${to} by bus, train and flight — including the local cab legs at each end.`;
  return {
    title,
    description,
    alternates: { canonical: `/travel/${slug}` },
    openGraph: { title, description, url: `/travel/${slug}` },
  };
}

function d2dTotalCell(g: GuideOption) {
  if (g.totalPrice == null || g.totalMin == null) return "—";
  return `${formatPrice(g.totalPrice)} · ${formatDuration(g.totalMin)}`;
}

export default async function TravelGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const route = guideFromSlug(slug);
  if (!route) notFound();

  const { from, to } = route;
  const data = guideData(from, to);
  if (!data) notFound();

  const { distanceKm, options, cheapest, fastest, bestDoorToDoor, byMode } = data;
  const related = relatedGuideSlugs(from, to);

  const faqs: { q: string; a: string }[] = [
    {
      q: `What is the cheapest way to get from ${from} to ${to}?`,
      a: cheapest
        ? `The cheapest ticket is by ${cheapest.option.mode} — ${cheapest.option.operator} at about ${formatPrice(cheapest.option.price)}, taking ${formatDuration(cheapest.option.duration_min)} station-to-station.${bestDoorToDoor ? ` Counting the cab at each end, the cheapest door-to-door option works out to roughly ${formatPrice(bestDoorToDoor.totalPrice!)} by ${bestDoorToDoor.option.mode}.` : ""}`
        : "No fare data is available for this route yet.",
    },
    {
      q: `How long does it take to travel from ${from} to ${to}?`,
      a: fastest
        ? `The fastest option is by ${fastest.option.mode} at ${formatDuration(fastest.option.duration_min)} station-to-station${fastest.totalMin ? `, or about ${formatDuration(fastest.totalMin)} door to door once you add local travel and boarding time` : ""}. Slower options like a bus or a regular train can take much longer.`
        : "No timing data is available for this route yet.",
    },
    {
      q: `Is it better to fly or take the train from ${from} to ${to}?`,
      a: byMode.flight.length && byMode.train.length
        ? `A flight saves time in the air, but the airport is usually far from the city, so the door-to-door gap is smaller than the ticket suggests. The fastest flight here is about ${formatDuration(byMode.flight[0].totalMin ?? byMode.flight[0].option.duration_min)} door to door versus roughly ${formatDuration(byMode.train[0].totalMin ?? byMode.train[0].option.duration_min)} by the best train. If the train is an overnight one you also save a hotel night.`
        : `On this route ${byMode.flight.length ? "flights" : "trains"} dominate — compare the exact options on the live search.`,
    },
    {
      q: `Which station or airport should I use in ${from} and ${to}?`,
      a: [byMode.train[0]?.fromLeg, byMode.train[0]?.toLeg]
        .filter(Boolean)
        .map((l) => l!.hubName)
        .join(" and ") ||
        `See the door-to-door breakdown above for the hub used by each mode.`,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Masthead
        title={`${from} to ${to}`}
        tagline="The real door-to-door cost and time — including the cab at each end."
      />

      <main className="wrap" id="main">
        <div className="prose">
          <p>
            {distanceKm ? <>It&rsquo;s about <b>{distanceKm} km</b> from {from} to {to}. </> : null}
            You can do this route by{" "}
            {(["bus", "train", "flight"] as const)
              .filter((m) => byMode[m].length)
              .join(", ")}
            . The ticket price is only part of the story — the station or
            airport is rarely next to your door, so below we add a typical cab
            leg at each end to show what the trip actually costs and takes.
          </p>

          {(cheapest || fastest || bestDoorToDoor) && (
            <div className="guide-answer">
              {cheapest && (
                <div>
                  <span className="guide-answer-k">Cheapest ticket</span>
                  <span className="guide-answer-v">
                    {formatPrice(cheapest.option.price)}{" "}
                    <small>· {cheapest.option.mode}</small>
                  </span>
                </div>
              )}
              {fastest && (
                <div>
                  <span className="guide-answer-k">Fastest</span>
                  <span className="guide-answer-v">
                    {formatDuration(fastest.option.duration_min)}{" "}
                    <small>· {fastest.option.mode}</small>
                  </span>
                </div>
              )}
              {bestDoorToDoor && (
                <div>
                  <span className="guide-answer-k">Cheapest door-to-door</span>
                  <span className="guide-answer-v">
                    {formatPrice(bestDoorToDoor.totalPrice!)}{" "}
                    <small>· {bestDoorToDoor.option.mode}</small>
                  </span>
                </div>
              )}
            </div>
          )}

          <p className="prose-note">
            Want your exact numbers?{" "}
            <Link
              href={`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`}
            >
              Run the live comparison
            </Link>{" "}
            — or use{" "}
            <Link href="/">door-to-door mode</Link> on the homepage to enter your
            actual addresses.
          </p>
        </div>

        <h2 className="guide-h2">All options, {from} → {to}</h2>
        <div className="table-wrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>Operator</th>
                <th>Ticket</th>
                <th>Station-to-station</th>
                <th>Door-to-door*</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {options.map((g, i) => (
                <tr key={i}>
                  <td>{MODE_LABEL[g.option.mode]}</td>
                  <td>{g.option.operator}</td>
                  <td>{formatPrice(g.option.price)}</td>
                  <td>{formatDuration(g.option.duration_min)}</td>
                  <td>{d2dTotalCell(g)}</td>
                  <td>
                    <a
                      href={bookingLink(
                        g.option.mode,
                        from,
                        to,
                        g.option.link,
                        null,
                      )}
                      target="_blank"
                      rel="noopener nofollow"
                    >
                      Book
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="guide-fine">
          * Door-to-door adds a typical cab from the city centre to the hub at
          each end, plus boarding / check-in time. Fares are estimates — confirm
          the live price on the booking site.
        </p>

        <HotelCta city={to} />
        <TripExtras city={to} from={from} />

        <h2 className="guide-h2">Door-to-door, mode by mode</h2>
        {(["train", "bus", "flight"] as const)
          .filter((m) => byMode[m].length)
          .map((m) => {
            const g = byMode[m][0];
            return (
              <section key={m} className="guide-mode">
                <h3>By {MODE_LABEL[m].toLowerCase()}</h3>
                {g.fromLeg && g.toLeg ? (
                  <ol className="guide-legs">
                    <li>
                      Cab in {from} → <b>{g.fromLeg.hubName}</b>
                      {g.fromLeg.central
                        ? " — central, a short hop"
                        : ` — about ${g.fromLeg.distanceKm} km`}{" "}
                      · ~{formatPrice(g.fromLeg.price)} ·{" "}
                      {formatDuration(g.fromLeg.durationMin)}
                    </li>
                    <li>
                      {m === "flight" ? "Check-in / security" : "Boarding buffer"}{" "}
                      · {formatDuration(g.bufferMin)}
                    </li>
                    <li>
                      {g.option.operator} · {formatPrice(g.option.price)} ·{" "}
                      {formatDuration(g.option.duration_min)}
                    </li>
                    <li>
                      Cab in {to}: <b>{g.toLeg.hubName}</b> → your address
                      {g.toLeg.central ? " — central" : ` — about ${g.toLeg.distanceKm} km`}{" "}
                      · ~{formatPrice(g.toLeg.price)} ·{" "}
                      {formatDuration(g.toLeg.durationMin)}
                    </li>
                  </ol>
                ) : null}
                <p className="guide-mode-total">
                  Typical total: <b>{d2dTotalCell(g)}</b>
                  {byMode[m].length > 1 && (
                    <> · {byMode[m].length} {m} options on the live search</>
                  )}
                </p>
              </section>
            );
          })}

        <div className="faq">
          <section className="faq-cat">
            <h2 className="guide-h2">FAQ — {from} to {to}</h2>
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>
        </div>

        <nav className="popular">
          <h2 className="guide-h2">Other guides</h2>
          <div className="popular-grid">
            {related.map((s) => {
              const r = guideFromSlug(s)!;
              return (
                <Link key={s} href={`/travel/${s}`}>
                  {r.from} → {r.to}
                </Link>
              );
            })}
            <Link href={`/routes/${slug}`}>
              {from} → {to}: live prices
            </Link>
          </div>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
