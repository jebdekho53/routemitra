import SiteHeader from "@/components/SiteHeader";

// Shared page header: the sticky app bar + a title block. Keeping this in one
// place is why the "Demo build" copy could never drift back in.
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
    <>
      <SiteHeader />
      <div className="masthead">
        <div className="wrap">
          <Heading>{title}</Heading>
          {tagline && <p className="tagline">{tagline}</p>}
        </div>
      </div>
    </>
  );
}
