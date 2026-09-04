"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import ModeIcon from "@/components/ModeIcon";
import type { Mode } from "@/types/route";

// "Cart"-style resume bar. When someone taps "Book now" we stash the option
// in localStorage; if they bounce off the operator's site and come back, this
// bar offers a one-tap way back to it. Local-only, expires after 3 hours.

const KEY = "routemitra_pending_booking_v1";
const MAX_AGE_MS = 3 * 60 * 60 * 1000;

interface Pending {
  from: string;
  to: string;
  mode: string;
  operator: string;
  price: number;
  link: string;
  ts: number;
}

const KNOWN_MODES = new Set(["bus", "train", "flight"]);

export default function ResumeBooking() {
  const [pending, setPending] = useState<Pending | null>(null);

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        setPending(null);
        return;
      }
      const p = JSON.parse(raw) as Pending;
      if (!p?.link || typeof p.ts !== "number" || Date.now() - p.ts > MAX_AGE_MS) {
        localStorage.removeItem(KEY);
        setPending(null);
        return;
      }
      setPending(p);
    } catch {
      setPending(null);
    }
  }, []);

  useEffect(() => {
    // reading localStorage on mount — the "subscribe to an external store"
    // case effects exist for, not state derived from props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // re-check when: a Book click just stashed one (same tab), the tab regains
    // focus (user came back from the operator's site), or another tab changed it
    const onChange = () => load();
    window.addEventListener("routemitra:pending-booking", onChange);
    window.addEventListener("focus", onChange);
    document.addEventListener("visibilitychange", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("routemitra:pending-booking", onChange);
      window.removeEventListener("focus", onChange);
      document.removeEventListener("visibilitychange", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [load]);

  if (!pending) return null;

  function clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
    setPending(null);
  }

  return (
    <div className="resume-bar" role="region" aria-label="Resume your booking">
      <div className="wrap resume-bar-inner">
        <div className="resume-text">
          <span className="resume-eyebrow">Continue your booking</span>
          <span className="resume-detail">
            {KNOWN_MODES.has(pending.mode) && (
              <ModeIcon mode={pending.mode as Mode} className="resume-mode-icon" />
            )}
            <b>{pending.operator}</b> · {pending.from} → {pending.to} ·{" "}
            <b>{formatPrice(pending.price)}</b>
          </span>
        </div>
        <div className="resume-actions">
          <a
            className="resume-open"
            href={pending.link}
            target="_blank"
            rel="noopener"
            onClick={() => {
              // refresh the timestamp so it stays around for another window
              try {
                localStorage.setItem(
                  KEY,
                  JSON.stringify({ ...pending, ts: Date.now() }),
                );
              } catch {
                // ignore
              }
            }}
          >
            Open again ↗
          </a>
          <button
            type="button"
            className="resume-dismiss"
            onClick={clear}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
