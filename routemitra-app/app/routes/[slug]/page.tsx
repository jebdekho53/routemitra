// Static, SEO-friendly page per popular route: /routes/pune-to-bengaluru
// Pre-rendered at build time, revalidated hourly. Results come straight from
// the shared search pipeline (no client fetch) so crawlers see real content.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fromSlug, popularRouteSlugs } from "@/lib/routes";
import { sampleSearch } from "@/lib/search";
import { formatDuration, formatPrice } from "@/lib/format";
import SearchForm from "@/components/SearchForm";
import ResultCard from "@/components/ResultCard";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import HotelCta from "@/components/HotelCta";

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return popularRouteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const route = fromSlug(slug);
  if (!route) return { title: { absolute: "Route not found — RouteMitra" } };
  const { from, to } = route;
  const title = `${from} to ${to} — Bus, Train & Flight compare`;
  const description = `Bus, train and flight options from ${from} to ${to} in one place — compare price and time to pick the cheapest or the fastest.`;
  return {
    title,
    description,
    alternates: { canonical: `/routes/${slug}` },
    openGraph: { title, description, url: `/routes/${slug}` },
  };
}

export default async function RoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const route = fromSlug(slug);
  if (!route) notFound();

  const { from, to } = route;
  const result = sampleSearch(from, to);
  const options = [...result.options].sort((a, b) => a.price - b.price);

  const cheapest = options[0];
  const fastest = [...options].sort(
    (a, b) => a.duration_min - b.duration_min,
  )[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the cheapest way from ${from} to ${to}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: cheapest
            ? `The cheapest is by ${cheapest.mode} — ${cheapest.operator}, around ${formatPrice(cheapest.price)}, ${formatDuration(cheapest.duration_min)}.`
            : "No data is available for this route yet.",
        },
      },
      {
        "@type": "Question",
        name: `What is the fastest way from ${from} to ${to}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: fastest
            ? `The fastest is by ${fastest.mode} — ${fastest.operator}, ${formatDuration(fastest.duration_min)}.`
            : "No data is available for this route yet.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Masthead
        title={`${from} → ${to}`}
        tagline={
          <>
            {from} to {to} — compare <b>bus, train and flight</b> in one place.
          </>
        }
      />

      <main className="wrap">
        <SearchForm initialFrom={from} initialTo={to} />

        <p className="route-intro">
          {cheapest ? (
            <>
              Cheapest: <b>{formatPrice(cheapest.price)}</b> (
              {cheapest.mode}) · Fastest:{" "}
              <b>{formatDuration(fastest.duration_min)}</b> ({fastest.mode})
            </>
          ) : (
            "No options are available for this route yet."
          )}
        </p>

        <p className="route-note">
          Planning the whole trip?{" "}
          <Link href={`/travel/${slug}`}>
            See the {from} → {to} door-to-door guide
          </Link>{" "}
          — cost and time including the cab at each end.
        </p>

        {options.length > 0 && (
          <section className="results">
            <div className="cards">
              {options.map((opt, i) => (
                <ResultCard
                  key={`${opt.mode}-${opt.operator}-${i}`}
                  option={opt}
                  from={from}
                  to={to}
                />
              ))}
            </div>
          </section>
        )}

        <p className="route-note">
          Some fares may be indicative — for the live price, use &quot;Book
          now&quot; to go to the respective platform.
        </p>

        <HotelCta city={to} />

        <nav className="popular">
          <h2>More routes</h2>
          <div className="popular-grid">
            {popularRouteSlugs()
              .filter((s) => s !== slug)
              .slice(0, 8)
              .map((s) => {
                const r = fromSlug(s)!;
                return (
                  <Link key={s} href={`/routes/${s}`}>
                    {r.from} → {r.to}
                  </Link>
                );
              })}
          </div>
        </nav>

        <Link href="/" className="back-link">
          ← Nayi search
        </Link>
      </main>

      <SiteFooter />
    </>
  );
}
