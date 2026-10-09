/**
 * Which of `count` equal steps is active at a scroll `progress` from 0 (start of the pinned stage) to 1 (end).
 * Out-of-range or non-numeric progress is clamped, so a restored scroll position always lands on a valid step.
 */
export function stepForProgress(progress: number, count: number): number {
  if (!Number.isFinite(count) || count <= 1) return 0;
  const p = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  return Math.min(count - 1, Math.floor(p * count));
}

/** The scroll position (page Y) in the middle of step `index`, for jumping to a step. */
export function scrollTopForStep(index: number, count: number, wrapperTop: number, wrapperHeight: number, viewportHeight: number): number {
  const travel = Math.max(0, wrapperHeight - viewportHeight);
  return wrapperTop + ((index + 0.5) / count) * travel;
}

/**
 * Keyframes for a wheel that turns one notch per step and then rests, so each step has a calm moment where the
 * wheel is still and its card can be read. `input` is scroll progress (0..1) and `output` the wheel angle in
 * degrees. The wheel turns counter-clockwise: step i rests at -(360 / count) * i. A step changes (see
 * stepForProgress) exactly halfway through each turn.
 */
export function wheelKeyframes(count: number, hold = 0.045): { input: number[]; output: number[] } {
  const seg = 1 / count;
  const notch = 360 / count;
  const input: number[] = [];
  const output: number[] = [];
  for (let i = 0; i < count; i++) {
    input.push(i === 0 ? 0 : i * seg + hold, i === count - 1 ? 1 : (i + 1) * seg - hold);
    const angle = i === 0 ? 0 : -notch * i; // avoid -0
    output.push(angle, angle);
  }
  return { input, output };
}
