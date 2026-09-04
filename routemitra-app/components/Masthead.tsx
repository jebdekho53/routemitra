import SiteHeader from "@/components/SiteHeader";
import DestinationArt from "@/components/DestinationArt";
import type { Mood } from "@/lib/destination-mood";

// Shared page header: the sticky app bar + a title block. Keeping this in one
// place is why the "Demo build" copy could never drift back in.
// `mood` (route/travel guide pages) swaps the plain title strip for a
// gradient + destination silhouette banner — beach/heritage/metro, chosen by
// lib/destination-mood.ts. Original line art, no photos, so no licensing risk.
export default function Masthead({
  title = "RouteMitra",
  tagline,
  as = "h1",
  mood,
}: {
  title?: string;
  tagline?: React.ReactNode;
  as?: "h1" | "h2";
  mood?: Mood;
}) {
  const Heading = as;
  return (
    <>
      <SiteHeader />
      <div className={`masthead${mood ? ` masthead-${mood}` : ""}`}>
        {mood && <DestinationArt mood={mood} />}
        <div className="wrap">
          <Heading>{title}</Heading>
          {tagline && <p className="tagline">{tagline}</p>}
        </div>
      </div>
    </>
  );
}
