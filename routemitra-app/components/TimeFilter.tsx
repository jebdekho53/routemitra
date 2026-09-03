"use client";

import { TIME_BUCKETS } from "@/lib/time-buckets";

// Two rows of 6-hour chips: when the trip leaves, and when it arrives.
// Multi-select — an empty set for a row means "any time". Counts are for
// the currently mode-filtered set; a chip with 0 is disabled.
export default function TimeFilter({
  dep,
  arr,
  depCounts,
  arrCounts,
  onToggleDep,
  onToggleArr,
  onClear,
}: {
  dep: Set<number>;
  arr: Set<number>;
  depCounts: Record<number, number>;
  arrCounts: Record<number, number>;
  onToggleDep: (id: number) => void;
  onToggleArr: (id: number) => void;
  onClear: () => void;
}) {
  const anyActive = dep.size > 0 || arr.size > 0;

  const row = (
    label: string,
    active: Set<number>,
    counts: Record<number, number>,
    onToggle: (id: number) => void,
  ) => (
    <div className="tf-row">
      <span className="tf-label">{label}</span>
      <div className="tf-chips" role="group" aria-label={`${label} time`}>
        {TIME_BUCKETS.map((b) => {
          const n = counts[b.id] ?? 0;
          const on = active.has(b.id);
          return (
            <button
              key={b.id}
              type="button"
              aria-pressed={on}
              disabled={n === 0 && !on}
              title={`${b.word} · ${b.label}`}
              className={`tf-chip${on ? " active" : ""}`}
              onClick={() => onToggle(b.id)}
            >
              <span aria-hidden="true">{b.icon}</span> {b.label}
              <span className="tf-n">{n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="time-filter">
      {row("Leaves", dep, depCounts, onToggleDep)}
      {row("Arrives", arr, arrCounts, onToggleArr)}
      {anyActive && (
        <button type="button" className="tf-clear" onClick={onClear}>
          Clear times
        </button>
      )}
    </div>
  );
}
