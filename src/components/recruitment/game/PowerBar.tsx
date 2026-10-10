"use client";

/** Fills as the answer approaches its minimum length. Purely a visual nudge; the server rule is unchanged. */
export function PowerBar({ length, min }: { length: number; min: number }) {
  const ratio = Math.min(length / min, 1);
  const full = length >= min;
  return (
    <div className="pb-power" role="progressbar" aria-label="Answer power" aria-valuemin={0} aria-valuemax={min} aria-valuenow={Math.min(length, min)}>
      <div className="tr">
        <i style={{ transform: `scaleX(${ratio})` }} />
      </div>
      <span aria-hidden="true">{full ? "Full power" : `${length}/${min}`}</span>
    </div>
  );
}
