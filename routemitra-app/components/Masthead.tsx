import Link from "next/link";
import Brandmark from "@/components/Brandmark";
import UserMenu from "@/components/UserMenu";

// Shared site header. Keep every page's masthead here so they never drift
// (they used to each carry their own "Demo build" copy).
export default function Masthead({
  title = "RouteMitra",
  tagline,
  as = "h1",
}: {
  title?: string;
  tagline?: React.ReactNode;
  as?: "h1" | "h2";
}) {
  const Heading = as;
  return (
    <header className="masthead">
      <div className="wrap">
        <div className="masthead-top">
          <Link href="/" className="brand" aria-label="RouteMitra home">
            <Brandmark size={26} />
            <span className="eyebrow">Bus · Train · Flight · one search</span>
          </Link>
          <UserMenu />
        </div>
        <Heading>{title}</Heading>
        {tagline && <p className="tagline">{tagline}</p>}
      </div>
    </header>
  );
}
