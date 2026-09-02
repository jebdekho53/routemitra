import { travelGear } from "@/lib/ancillary";

// "Packing list" strip — Amazon Associates search chips. Server component,
// no client JS. Renders nothing until NEXT_PUBLIC_AMAZON_ASSOC_TAG is set.
export default function TravelGear() {
  const items = travelGear();
  if (items.length === 0) return null;

  return (
    <aside className="travel-gear" aria-label="Packing list">
      <h2 className="travel-gear-h">Packing list</h2>
      <div className="travel-gear-chips">
        {items.map((x) => (
          <a
            key={x.key}
            className="gear-chip"
            href={x.href}
            target="_blank"
            rel="noopener nofollow sponsored"
          >
            {x.label}
          </a>
        ))}
      </div>
      <p className="travel-gear-fine">
        Amazon links — RouteMitra earns a small commission on qualifying
        purchases, at no cost to you.
      </p>
    </aside>
  );
}
