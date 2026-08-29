import type { RouteOption } from "@/types/route";
import { formatDuration, formatPrice } from "@/lib/format";
import BookButton from "@/components/BookButton";

const MODE_LABEL: Record<RouteOption["mode"], string> = {
  bus: "Bus",
  train: "Train",
  flight: "Flight",
};

export default function ResultCard({
  option,
  from,
  to,
}: {
  option: RouteOption;
  from: string;
  to: string;
}) {
  const d2d = option.door_to_door;

  return (
    <div className={`card ${option.mode}${d2d ? " has-d2d" : ""}`}>
      <div className="bar" />
      <div className="mode-label">{MODE_LABEL[option.mode]}</div>
      <div className="card-body">
        <div className="operator">
          {option.operator}
          {option.indicative && (
            <span className="badge" title="Estimated fare, not a live quote">
              indicative
            </span>
          )}
        </div>
        <div className="meta">
          <span className="price">{formatPrice(option.price)}</span>
          <span>{formatDuration(option.duration_min)}</span>
          <span>
            {option.departure} → {option.arrival}
          </span>
        </div>

        {d2d && (
          <div className="d2d">
            <div className="d2d-total">
              🏠 Ghar se ghar tak: <b>{formatPrice(d2d.total_price)}</b> ·{" "}
              <b>{formatDuration(d2d.total_duration_min)}</b>
              <span className="badge">est.</span>
            </div>
            <ol className="d2d-legs">
              {d2d.access && (
                <li>
                  Cab → {shorten(d2d.access.to)} · {d2d.access.distance_km} km ·{" "}
                  {formatPrice(d2d.access.price)} ·{" "}
                  {formatDuration(d2d.access.duration_min)}
                </li>
              )}
              <li>
                Wait / boarding buffer · {formatDuration(d2d.buffer_min)}
              </li>
              <li>
                {d2d.line_haul.label} · {formatPrice(d2d.line_haul.price)} ·{" "}
                {formatDuration(d2d.line_haul.duration_min)}
              </li>
              {d2d.egress && (
                <li>
                  Cab → {shorten(d2d.egress.to)} · {d2d.egress.distance_km} km ·{" "}
                  {formatPrice(d2d.egress.price)} ·{" "}
                  {formatDuration(d2d.egress.duration_min)}
                </li>
              )}
            </ol>
          </div>
        )}
      </div>
      <BookButton option={option} from={from} to={to} />
    </div>
  );
}

function shorten(label: string): string {
  return label.split(",").slice(0, 2).join(",").trim();
}
