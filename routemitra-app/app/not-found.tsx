import Link from "next/link";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import { popularRouteSlugs, fromSlug } from "@/lib/routes";

export default function NotFound() {
  return (
    <>
      <Masthead title="Page not found" />
      <main className="wrap">
        <section className="state-card">
          <p className="state-code">404</p>
          <p>
            The page you’re looking for isn’t here. Were you trying to
            search a route?
          </p>
          <div className="popular-grid" style={{ marginTop: 16 }}>
            {popularRouteSlugs()
              .slice(0, 6)
              .map((slug) => {
                const r = fromSlug(slug)!;
                return (
                  <Link key={slug} href={`/routes/${slug}`}>
                    {r.from} → {r.to}
                  </Link>
                );
              })}
          </div>
          <Link href="/" className="back-link">
            ← Home
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
