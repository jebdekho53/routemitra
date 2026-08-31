import { hotelSearchLink, fromNightly } from "@/lib/hotels";
import { formatPrice } from "@/lib/format";

// "Where to stay" affiliate block. Server component — no client JS.
export default function HotelCta({
  city,
  checkIn,
}: {
  city: string;
  checkIn?: string | null;
}) {
  const from = fromNightly(city);
  return (
    <aside className="hotel-cta">
      <div className="hotel-cta-text">
        <b>Where to stay in {city}?</b>
        <span className="muted">
          Compare hotels, guesthouses and stays
          {from ? <> — usually from about {formatPrice(from)}/night</> : null}.
        </span>
      </div>
      <a
        className="book-btn"
        href={hotelSearchLink(city, { checkIn })}
        target="_blank"
        rel="noopener nofollow sponsored"
      >
        See hotels in {city} →
      </a>
    </aside>
  );
}
