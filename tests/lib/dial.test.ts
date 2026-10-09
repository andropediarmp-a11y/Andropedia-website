import { describe, expect, it } from "vitest";
import { advance, FINGER_STOP, holeAngle, pointerAngle, polar, reachedStop, requiredRotation, returnSeconds, shortestDelta } from "@/lib/dial";

describe("dial geometry", () => {
  it("each hole is exactly its required turn away from the finger stop", () => {
    for (let i = 0; i < 7; i++) expect((holeAngle(i) + requiredRotation(i)) % 360).toBeCloseTo(FINGER_STOP, 6);
  });
  it("hole 1 needs the smallest turn and the last hole the biggest", () => {
    const turns = [0, 1, 2, 3, 4, 5, 6].map(requiredRotation);
    expect(turns).toEqual([...turns].sort((a, b) => a - b));
    expect(turns[0]).toBe(28);
    expect(turns[6]).toBe(160);
  });
  it("every hole, and its whole pull to the stop, stays in the visible lower half", () => {
    for (let i = 0; i < 7; i++) {
      expect(holeAngle(i)).toBeGreaterThan(90); // right of 3 o'clock is the hidden half
      expect(holeAngle(i) + requiredRotation(i)).toBeLessThanOrEqual(270);
    }
  });
  it("reads 1 to 7 from left to right along the bottom", () => {
    const xs = [0, 1, 2, 3, 4, 5, 6].map((i) => polar(0, 0, 100, holeAngle(i)).x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
  });
  it("polar and pointerAngle agree with each other", () => {
    for (const a of [0, 45, 90, 135, 180, 225, 270, 315]) {
      const p = polar(0, 0, 10, a);
      expect(pointerAngle(p.x, p.y)).toBeCloseTo(a, 6);
    }
    expect(pointerAngle(0, -5)).toBe(0); // straight up
    expect(Math.round(pointerAngle(5, 0))).toBe(90); // straight right
  });
});

describe("dragging", () => {
  it("takes the short way round across 12 o'clock", () => {
    expect(shortestDelta(350, 10)).toBe(20);
    expect(shortestDelta(10, 350)).toBe(-20);
    expect(shortestDelta(90, 90)).toBe(0);
  });
  it("only turns clockwise from rest and stops at the finger stop", () => {
    expect(advance(0, -30, 200)).toBe(0); // can't go backwards past rest
    expect(advance(100, 30, 200)).toBe(130);
    expect(advance(190, 50, 200)).toBe(200); // blocked by the stop
    expect(advance(200, -20, 200)).toBe(180); // can come back
  });
  it("counts as reached only at the stop", () => {
    expect(reachedStop(200, 200)).toBe(true);
    expect(reachedStop(197, 200)).toBe(true);
    expect(reachedStop(150, 200)).toBe(false);
  });
  it("spins back at a believable speed", () => {
    expect(returnSeconds(10)).toBe(0.3);
    expect(returnSeconds(360)).toBeCloseTo(1.1, 6);
    expect(returnSeconds(255)).toBeGreaterThan(returnSeconds(45));
  });
});
