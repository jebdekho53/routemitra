import type { RouteOption } from "@/types/route";
import { formatDuration, formatPrice } from "@/lib/format";

const MODE_LABEL: Record<RouteOption["mode"], string> = {
  bus: "Bus",
  train: "Train",
  flight: "Flight",
};

export default function ResultCard({ option }: { option: RouteOption }) {
  return (
    <div className={`card ${option.mode}`}>
      <div className="bar" />
      <div className="mode-label">{MODE_LABEL[option.mode]}</div>
      <div className="card-body">
        <div className="operator">{option.operator}</div>
        <div className="meta">
          <span className="price">{formatPrice(option.price)}</span>
          <span>{formatDuration(option.duration_min)}</span>
          <span>
            {option.departure} → {option.arrival}
          </span>
        </div>
      </div>
      <a
        className="book-btn"
        href={option.link}
        target="_blank"
        rel="noopener"
      >
        Book karein →
      </a>
    </div>
  );
}
