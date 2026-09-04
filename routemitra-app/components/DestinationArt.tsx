import type { Mood } from "@/lib/destination-mood";

// One original silhouette per destination "mood" — no photography, so no
// licensing risk, and it stays on-brand (line art, theme-aware colors).
export default function DestinationArt({ mood }: { mood: Mood }) {
  if (mood === "beach") {
    return (
      <svg className="dest-art" viewBox="0 0 500 180" fill="none" aria-hidden="true">
        <path d="M0 140 Q60 110 120 140 T240 140 T360 140 T500 140 V180 H0 Z" fill="var(--dest-fg)" opacity="0.9" />
        <path d="M0 155 Q70 130 140 155 T280 155 T420 155 T500 155 V180 H0 Z" fill="var(--dest-fg)" opacity="0.6" />
        <circle cx="430" cy="45" r="26" fill="var(--dest-sun)" opacity="0.85" />
        <g transform="translate(90 95)" opacity="0.9">
          <path d="M0 60 L4 0" stroke="var(--dest-fg)" strokeWidth="3" strokeLinecap="round" />
          <path d="M2 8 C 30 4, 42 20, 46 34 C 24 34, 6 24, 2 8 Z" fill="var(--dest-fg)" />
          <path d="M2 8 C -20 10, -34 26, -38 40 C -14 38, 0 26, 2 8 Z" fill="var(--dest-fg)" />
          <path d="M4 4 C 26 -6, 40 4, 44 16 C 22 20, 8 16, 4 4 Z" fill="var(--dest-fg)" />
        </g>
      </svg>
    );
  }

  if (mood === "heritage") {
    return (
      <svg className="dest-art" viewBox="0 0 500 180" fill="none" aria-hidden="true">
        <circle cx="410" cy="55" r="30" fill="var(--dest-sun)" opacity="0.5" />
        <g fill="var(--dest-fg)" opacity="0.92">
          <path d="M60 180V90h20V60l20-20 20 20v30h20v90Z" />
          <path d="M90 60a10 10 0 0 1 20 0Z" />
          <path d="M180 180V70h16V50l14-16 14 16v20h16v110Z" />
          <path d="M280 180V100h140v80Z" />
          <path d="M300 100c0-22 18-40 40-40s40 18 40 40Z" />
          <rect x="310" y="130" width="20" height="50" />
          <rect x="390" y="130" width="20" height="50" />
        </g>
        <path d="M0 180V150h500v30Z" fill="var(--dest-fg)" opacity="0.55" />
      </svg>
    );
  }

  // metro
  return (
    <svg className="dest-art" viewBox="0 0 500 180" fill="none" aria-hidden="true">
      <g fill="var(--dest-fg)" opacity="0.92">
        <rect x="40" y="90" width="34" height="90" />
        <rect x="84" y="60" width="30" height="120" />
        <rect x="124" y="110" width="26" height="70" />
        <rect x="160" y="40" width="28" height="140" />
        <rect x="198" y="80" width="24" height="100" />
        <rect x="232" y="20" width="32" height="160" />
        <rect x="274" y="70" width="26" height="110" />
        <rect x="310" y="95" width="30" height="85" />
        <rect x="350" y="55" width="26" height="125" />
        <rect x="386" y="100" width="24" height="80" />
        <rect x="420" y="75" width="30" height="105" />
      </g>
      <g fill="var(--dest-sun)" opacity="0.65">
        <rect x="168" y="52" width="5" height="6" />
        <rect x="178" y="52" width="5" height="6" />
        <rect x="168" y="66" width="5" height="6" />
        <rect x="240" y="35" width="5" height="6" />
        <rect x="252" y="35" width="5" height="6" />
        <rect x="240" y="49" width="5" height="6" />
        <rect x="358" y="70" width="5" height="6" />
        <rect x="358" y="84" width="5" height="6" />
      </g>
    </svg>
  );
}
