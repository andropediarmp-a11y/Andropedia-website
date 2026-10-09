// Geometry for the rotary-dial menu. Angles are in degrees, measured clockwise from 12 o'clock.
//
// On a real rotary phone you put a finger in a hole, turn the dial clockwise until the hole reaches the finger
// stop, then let go and the dial spins back. The menu shows only the lower half of the dial, hanging from the top
// edge of the screen: the finger stop is at the left end, and the holes sit counter-clockwise of it, so along the
// bottom they read 1 to 6 from left to right. Every hole stays in the visible half for its whole pull. The first
// hole needs the smallest turn, the last the biggest.

/** Where the finger stop is: the left end of the visible half (270 would be exactly 9 o'clock). */
export const FINGER_STOP = 258;
/** How far hole 1 has to turn to reach the stop, and how much more each next hole needs. */
export const FIRST_HOLE_TURN = 28;
export const HOLE_STEP = 26;

const wrap = (deg: number) => ((deg % 360) + 360) % 360;

/** Degrees a hole (0-based) must be turned clockwise to touch the finger stop. */
export const requiredRotation = (index: number) => FIRST_HOLE_TURN + HOLE_STEP * index;

/** Where a hole sits when the dial is at rest. */
export const holeAngle = (index: number) => wrap(FINGER_STOP - requiredRotation(index));

/** Point on a circle of radius `r` around (cx, cy) at `angle`. */
export const polar = (cx: number, cy: number, r: number, angle: number) => {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
};

/** Angle of a pointer at (dx, dy) from the dial centre, clockwise from 12 o'clock, 0..360. */
export const pointerAngle = (dx: number, dy: number) => wrap((Math.atan2(dx, -dy) * 180) / Math.PI);

/** Signed shortest turn from one angle to another, in (-180, 180]. Lets a drag cross 12 o'clock cleanly. */
export const shortestDelta = (from: number, to: number) => ((((to - from) % 360) + 540) % 360) - 180;

/** Adds a drag step to the current turn. The dial only turns clockwise from rest, and the finger stop blocks it. */
export const advance = (turn: number, delta: number, required: number) => Math.min(required, Math.max(0, turn + delta));

/** True once the hole is at (or within `tolerance` degrees of) the finger stop. */
export const reachedStop = (turn: number, required: number, tolerance = 4) => turn >= required - tolerance;

/** How long the dial takes to spin back from `turn` degrees: about as long as a real one, never abrupt. */
export const returnSeconds = (turn: number) => Math.max(0.3, (turn / 360) * 1.1);
