/**
 * The Andropedia mark, redrawn as a vector: the "A" with its swoosh, the cloud arc and the three circuit nodes.
 * It takes its colour from `currentColor`, so set a text colour on it (e.g. `text-[#4566f0]`).
 */
export function AndropediaMark({ className = "", glow = true, style }: { className?: string; glow?: boolean; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="180 90 760 710"
      fill="none"
      className={className}
      style={{ ...(glow ? { filter: "drop-shadow(0 0 18px rgba(0,102,255,0.75)) drop-shadow(0 0 45px rgba(0,102,255,0.4))" } : {}), ...style }}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="currentColor">
        {/* the A (with its hole) and the small arrowhead under it */}
        <path fillRule="evenodd" d="M517 300 L645 541 L803 500 L268 780 Z M517 455 L580 558 L438 607 Z" />
        <path d="M687 622 L757 775 L590 690 Z" />
        {/* circuit stub to the middle node */}
        <rect x="638" y="308" width="200" height="32" />
      </g>

      <g stroke="currentColor" strokeLinejoin="round">
        {/* cloud arc that ends in the first node's stub */}
        <path d="M312 574 C 214 546 200 420 252 352 C 290 306 342 296 384 304 C 376 196 450 124 534 124 C 612 124 664 170 690 230 H 766 L 836 166" strokeWidth="42" />
        {/* stub to the third node */}
        <path d="M683 415 H788 L838 463" strokeWidth="32" strokeLinejoin="miter" />
        {/* the three nodes */}
        <circle cx="848" cy="148" r="26" strokeWidth="20" />
        <circle cx="875" cy="324" r="27.5" strokeWidth="21" />
        <circle cx="858" cy="500" r="27.5" strokeWidth="21" />
      </g>

      {/* thin halos and highlights */}
      <g stroke="currentColor" strokeOpacity="0.45" strokeWidth="3">
        <circle cx="848" cy="148" r="46" />
        <circle cx="875" cy="324" r="60" />
      </g>
      <g stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeOpacity="0.9">
        <path d="M744 324 H757" />
        <path d="M747 416 H759" />
        <path d="M230 492 L255 534" />
      </g>
    </svg>
  );
}
