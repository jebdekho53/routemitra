import Link from "next/link";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import { popularRouteSlugs, fromSlug } from "@/lib/routes";

export default function NotFound() {
  return (
    <>
      <Masthead title="Page nahi mila" />
      <main className="wrap">
        <section className="state-card">
          <p className="state-code">404</p>
          <p>
            Jo page tum dhoond rahe ho wo yahan nahi hai. Shayad route search
            karna chahte the?
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
