import type { Mode } from "@/types/route";

// Original line-art icon set (no emoji, no external assets) so bus/train/
// flight read as one consistent visual system instead of platform emoji.
// Stroke-based, currentColor — callers set color via className/CSS.
export default function ModeIcon({
  mode,
  className,
}: {
  mode: Mode;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (mode === "bus") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="11.5" rx="2.5" />
        <path d="M3 11h18" />
        <path d="M7 11v5.5M17 11v5.5" />
        <circle cx="7.5" cy="19" r="1.4" />
        <circle cx="16.5" cy="19" r="1.4" />
        <path d="M5 16.5h-1a1 1 0 0 1-1-1V13M19 16.5h1a1 1 0 0 0 1-1V13" />
      </svg>
    );
  }

  if (mode === "train") {
    return (
      <svg {...common}>
        <rect x="5" y="3.5" width="14" height="13" rx="3.5" />
        <path d="M5 10.5h14" />
        <circle cx="9" cy="14" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="15" cy="14" r="0.6" fill="currentColor" stroke="none" />
        <path d="M8 20.5 6 17.5M16 20.5l2-3" />
        <path d="M9 3.5V1.8M15 3.5V1.8" />
      </svg>
    );
  }

  // flight
  return (
    <svg {...common}>
      <path d="M10.5 3 4 13.2l2 .7 2.6-2.3 1 4.9-1.7 1.6.6 1.6 2.7-1.7 2.7 1.7.6-1.6-1.7-1.6 1-4.9 2.6 2.3 2-.7L13.5 3a1.6 1.6 0 0 0-3 0Z" />
    </svg>
  );
}
