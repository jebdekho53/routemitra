import { extrasForDestination } from "@/lib/ancillary";

// "Sort out the rest of the trip" block — insurance, transfers, activities,
// car rental, eSIM, lounge, forex. Server component, no client JS. Renders
// nothing until at least one NEXT_PUBLIC_AFF_* env var is set, so it's
// invisible until you actually have a program to send traffic to.
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
    <aside className="trip-extras" aria-label="Trip extras">
      <h2 className="trip-extras-h">Sort out the rest of the trip</h2>
      <ul className="trip-extras-list">
        {extras.map((x) => (
          <li key={x.key}>
            <a
              href={x.href}
              target="_blank"
              rel={
                x.paid
                  ? "noopener nofollow sponsored"
                  : "noopener nofollow"
              }
            >
              <span className="te-label">{x.label} →</span>
              {x.blurb ? <span className="te-blurb">{x.blurb}</span> : null}
            </a>
          </li>
        ))}
      </ul>
      <p className="trip-extras-fine">
        Some links are affiliate links — RouteMitra may earn a commission at no
        extra cost to you. It doesn&apos;t affect what you pay or how results
        are ranked.
      </p>
    </aside>
  );
}
