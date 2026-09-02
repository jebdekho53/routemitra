import { extrasForDestination } from "@/lib/ancillary";

// "Round out your trip" — the ancillary block on guide / route / search pages.
// Card grid with an icon per stream. Server component, no client JS. Renders
// nothing until at least one NEXT_PUBLIC_AFF_* env var is set.
export default function TripExtras({
  city,
  from,
  date,
}: {
  city: string;
  from?: string;
  date?: string | null;
}) {
  const extras = extrasForDestination(city, from, date);
  if (extras.length === 0) return null;

  return (
    <aside className="trip-extras" aria-label={`Trip extras for ${city}`}>
      <div className="trip-extras-head">
        <span className="trip-extras-kicker">Before you go</span>
        <h2 className="trip-extras-h">Round out your trip to {city}</h2>
      </div>

      <ul className="trip-extras-grid">
        {extras.map((x) => (
          <li key={x.key}>
            <a
              className="te-card"
              href={x.href}
              target="_blank"
              rel={x.paid ? "noopener nofollow sponsored" : "noopener nofollow"}
            >
              <span className="te-icon" aria-hidden="true">
                {x.icon}
              </span>
              <span className="te-body">
                <span className="te-label">{x.label}</span>
                {x.blurb ? <span className="te-blurb">{x.blurb}</span> : null}
              </span>
              <span className="te-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="trip-extras-fine">
        Some of these are affiliate links — RouteMitra may earn a commission at
        no extra cost to you. It never changes what you pay or how results are
        ranked.
      </p>
    </aside>
  );
}
