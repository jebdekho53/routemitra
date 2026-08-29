import Link from "next/link";
import SearchForm from "@/components/SearchForm";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import { popularRouteSlugs, fromSlug } from "@/lib/routes";

export default function Home() {
  const routes = popularRouteSlugs();

  return (
    <>
      <Masthead
        tagline={
          <>
            Ek city se dusri city — <b>bus, train aur flight</b> teeno options ek
            hi jagah compare karo, sabse sasta ya sabse tez chuno.
          </>
        }
      />

      <main className="wrap">
        <SearchForm />

        <nav className="popular">
          <h2>Popular routes</h2>
          <div className="popular-grid">
            {routes.map((slug) => {
              const r = fromSlug(slug)!;
              return (
                <Link key={slug} href={`/routes/${slug}`}>
                  {r.from} → {r.to}
                </Link>
              );
            })}
          </div>
        </nav>
      </main>

      <SiteFooter />
    </>
  );
}
