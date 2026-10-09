// Confetti is cosmetic: it is loaded on demand and skipped when the visitor asks for less motion.

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export async function fireConfetti(kind: "small" | "big", colors: string[]) {
  if (reduced()) return;
  try {
    const { default: confetti } = await import("canvas-confetti");
    const base = { colors, disableForReducedMotion: true, zIndex: 80, ticks: kind === "big" ? 220 : 120 };
    if (kind === "small") {
      confetti({ ...base, particleCount: 36, spread: 60, startVelocity: 28, scalar: 0.8, origin: { x: 0.5, y: 0.35 } });
      return;
    }
    confetti({ ...base, particleCount: 120, spread: 80, startVelocity: 48, origin: { x: 0.5, y: 0.45 } });
    window.setTimeout(() => {
      confetti({ ...base, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
      confetti({ ...base, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
    }, 250);
  } catch {
    /* the chunk failed to load: no confetti, nothing else breaks */
  }
}
