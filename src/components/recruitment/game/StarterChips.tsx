"use client";

/** Tappable sentence starters for a textarea. */
export function StarterChips({ starters, onPick, label }: { starters: string[]; onPick: (starter: string) => void; label: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">Stuck? Start with</span>
      {starters.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="chip-accent !px-3 !py-1 cursor-pointer transition-colors hover:border-[var(--a1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
        >
          {s.trim()}…
        </button>
      ))}
    </div>
  );
}
