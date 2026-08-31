"use client";

import type { SortKey } from "@/types/route";

const TABS: { key: SortKey; label: string }[] = [
  { key: "price", label: "Cheapest" },
  { key: "duration_min", label: "Fastest" },
];

export default function SortTabs({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (key: SortKey) => void;
}) {
  return (
    <div className="sort-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`sort-tab${value === tab.key ? " active" : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
