"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "routemitra_cookie_ack_v1";

// RouteMitra sets exactly one cookie itself (the login session, essential —
// see /privacy §5) and Plausible analytics is cookieless. So there's
// nothing non-essential to actually opt in/out of today; this banner exists
// to disclose that plainly and is future-proofed for when there is a real
// choice to make (e.g. cookie-based analytics or ads).
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      // One-off read of an external store (localStorage) on mount — this is
      // exactly the "subscribe to external state" case effects are for, not
      // state derived from props/other state, so it's fine to opt out here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!seen) setVisible(true);
    } catch {
      // localStorage unavailable (private mode etc.) — skip the banner
      // rather than nag on every load.
    }
  }, []);

  // reserve space so the fixed banner never permanently hides page content
  useEffect(() => {
    const el = document.documentElement;
    if (visible) el.classList.add("has-cookie-banner");
    else el.classList.remove("has-cookie-banner");
    return () => el.classList.remove("has-cookie-banner");
  }, [visible]);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="region" aria-label="Cookie notice">
      <div className="wrap cookie-banner-inner">
        <p>
          Sirf ek essential login cookie — koi tracking cookie nahi (analytics
          cookieless hai). <a href="/privacy#cookies">Detail</a>.
        </p>
        <button type="button" className="cookie-ack" onClick={dismiss}>
          Samajh gaya
        </button>
      </div>
    </div>
  );
}
