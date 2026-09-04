import type { RouteOption } from "@/types/route";
import { formatDuration, formatPrice } from "@/lib/format";
import BookButton from "@/components/BookButton";
import ModeIcon from "@/components/ModeIcon";

const MODE_LABEL: Record<RouteOption["mode"], string> = {
  bus: "Bus",
  train: "Train",
  flight: "Flight",
};

const TAG_CLASS: Record<string, string> = {
  Cheapest: "tag-cheap",
  Fastest: "tag-fast",
  "Best value": "tag-value",
};

export default function ResultCard({
  option,
  from,
  to,
  tags = [],
}: {
  option: RouteOption;
  from: string;
  to: string;
  tags?: string[];
}) {
  const d2d = option.door_to_door;
  const stopsLabel =
    option.stops == null
      ? null
      : option.stops === 0
        ? "non-stop"
        : `${option.stops} stop${option.stops > 1 ? "s" : ""}`;

  return (
    <article className={`rc ${option.mode}${d2d ? " has-d2d" : ""}`}>
      <div className="rc-main">
        <div className="rc-op">
          <span className={`rc-logo rc-logo-${option.mode}`}>
            {option.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={option.logo} alt="" width={28} height={28} loading="lazy" />
            ) : (
              <ModeIcon mode={option.mode} />
            )}
          </span>
          <div className="rc-op-text">
            <span className="rc-mode">{MODE_LABEL[option.mode]}</span>
            <span className="rc-operator">
              {option.operator}
              {option.indicative && (
                <span
                  className="badge"
                  title="Live provider API not connected yet — this fare is an estimate. Confirm the final price on the booking page."
                >
                  indicative
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="rc-timeline">
          <time className="rc-t">{option.departure}</time>
          <div className="rc-line">
            <span className="rc-dur">{formatDuration(option.duration_min)}</span>
            <span className="rc-track">
              <i />
              <i />
              <span className="rc-track-mode">
                <ModeIcon mode={option.mode} />
              </span>
            </span>
            {stopsLabel && <span className="rc-stops">{stopsLabel}</span>}
          </div>
          <time className="rc-t">{option.arrival}</time>
        </div>

        <div className="rc-fare">
          <span className="rc-price">{formatPrice(option.price)}</span>
          {tags.length > 0 && (
            <span className="rc-tags">
              {tags.map((t) => (
                <span key={t} className={`rc-tag ${TAG_CLASS[t] ?? ""}`}>
                  {t}
                </span>
              ))}
            </span>
          )}
          <BookButton option={option} from={from} to={to} />
        </div>
      </div>

      {option.note && <p className="rc-note">⚠ {option.note}</p>}

      {d2d && (
        <div className="d2d">
          <div className="d2d-total">
            🏠 Door to door: <b>{formatPrice(d2d.total_price)}</b> ·{" "}
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
            <li>Wait / boarding buffer · {formatDuration(d2d.buffer_min)}</li>
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
    </article>
  );
}

function shorten(label: string): string {
  return label.split(",").slice(0, 2).join(",").trim();
}
