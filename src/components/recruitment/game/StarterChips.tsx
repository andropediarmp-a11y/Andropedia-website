"use client";

/** Tappable sentence starters for a textarea. */
export function StarterChips({ starters, onPick, label }: { starters: string[]; onPick: (starter: string) => void; label: string }) {
  return (
    <div className="pb-chips" role="group" aria-label={label}>
      <span className="pb-chips-label">Stuck? Start with</span>
      {starters.map((s) => (
        <button key={s} type="button" onClick={() => onPick(s)} className="pb-chip">
          {s.trim()}…
        </button>
      ))}
    </div>
  );
}
