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
  const description = `${from} se ${to} jaane ke bus, train aur flight options ek jagah — price aur time compare karke sabse sasta ya sabse tez chuno.`;
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
        name: `${from} se ${to} ka sabse sasta option kya hai?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: cheapest
            ? `Sabse sasta ${cheapest.mode} hai — ${cheapest.operator}, ${formatPrice(cheapest.price)} ke aas-paas, ${formatDuration(cheapest.duration_min)}.`
            : "Abhi is route ke liye data available nahi hai.",
        },
      },
      {
        "@type": "Question",
        name: `${from} se ${to} sabse jaldi kaise pahunchein?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: fastest
            ? `Sabse tez ${fastest.mode} hai — ${fastest.operator}, ${formatDuration(fastest.duration_min)}.`
            : "Abhi is route ke liye data available nahi hai.",
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
            {from} se {to} — <b>bus, train aur flight</b> ek jagah compare karo.
          </>
        }
      />

      <main className="wrap">
        <SearchForm initialFrom={from} initialTo={to} />

        <p className="route-intro">
          {cheapest ? (
            <>
              Sabse sasta: <b>{formatPrice(cheapest.price)}</b> (
              {cheapest.mode}) · Sabse tez:{" "}
              <b>{formatDuration(fastest.duration_min)}</b> ({fastest.mode})
            </>
          ) : (
            "Is route ke liye abhi options available nahi hain."
          )}
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
          Kuch fares indicative ho sakte hain — live price ke liye &quot;Book
          karein&quot; se respective platform par jao.
        </p>

        <nav className="popular">
          <h2>Aur routes</h2>
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
