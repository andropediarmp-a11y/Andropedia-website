import { describe, expect, it } from "vitest";
import { scrollTopForStep, stepForProgress } from "@/lib/scroll-steps";

describe("stepForProgress", () => {
  it("splits the travel into equal steps", () => {
    expect([0, 0.24, 0.25, 0.49, 0.5, 0.74, 0.75, 0.99].map((p) => stepForProgress(p, 4))).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
  });
  it("holds the last step at the very end", () => {
    expect(stepForProgress(1, 4)).toBe(3);
    expect(stepForProgress(1, 6)).toBe(5);
  });
  it("clamps out-of-range and broken values", () => {
    expect(stepForProgress(-3, 6)).toBe(0);
    expect(stepForProgress(7, 6)).toBe(5);
    expect(stepForProgress(NaN, 6)).toBe(0);
  });
  it("is always 0 for one step or an invalid count", () => {
    expect(stepForProgress(0.9, 1)).toBe(0);
    expect(stepForProgress(0.9, 0)).toBe(0);
    expect(stepForProgress(0.9, NaN)).toBe(0);
  });
});

describe("scrollTopForStep", () => {
  it("lands in the middle of each step's share of the pinned travel", () => {
    // wrapper 3000px tall, 1000px viewport: 2000px of travel, 4 steps of 500px each
    expect(scrollTopForStep(0, 4, 800, 3000, 1000)).toBe(800 + 250);
    expect(scrollTopForStep(3, 4, 800, 3000, 1000)).toBe(800 + 1750);
  });
  it("jumping to a step's middle activates exactly that step", () => {
    for (let i = 0; i < 6; i++) {
      const top = scrollTopForStep(i, 6, 0, 3300, 800);
      expect(stepForProgress(top / (3300 - 800), 6)).toBe(i);
    }
  });
  it("never goes backwards when the wrapper is shorter than the viewport", () => {
    expect(scrollTopForStep(2, 6, 500, 400, 800)).toBe(500);
  });
});

import { wheelKeyframes } from "@/lib/scroll-steps";

describe("wheelKeyframes", () => {
  const { input, output } = wheelKeyframes(5);
  it("covers the whole scroll range with strictly increasing inputs", () => {
    expect(input[0]).toBe(0);
    expect(input[input.length - 1]).toBe(1);
    for (let i = 1; i < input.length; i++) expect(input[i]).toBeGreaterThan(input[i - 1]);
  });
  it("rests at one notch per step, turning counter-clockwise", () => {
    expect(output).toEqual([0, 0, -72, -72, -144, -144, -216, -216, -288, -288]);
  });
  it("is at rest in the middle of every step", () => {
    for (let i = 0; i < 5; i++) {
      const mid = (i + 0.5) / 5;
      const k = input.findIndex((v, j) => v <= mid && (input[j + 1] ?? 2) >= mid);
      expect(output[k]).toBe(i === 0 ? 0 : -72 * i);
      expect(stepForProgress(mid, 5)).toBe(i);
    }
  });
});
