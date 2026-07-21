import { describe, it, expect } from 'vitest';

await import('../../src/logic/HUDLogic.js');
const { computeBarWidth } = window.G.HUDLogic;

describe('HUDLogic.computeBarWidth', () => {
  it('returns a proportional width for a partial value', () => {
    expect(computeBarWidth(50, 100, 200)).toBe(100); // half of 200
  });

  it('returns the full barWidth when value === max', () => {
    expect(computeBarWidth(100, 100, 200)).toBe(200);
  });

  it('returns 0 when value is 0', () => {
    expect(computeBarWidth(0, 100, 200)).toBe(0);
  });

  it('clamps to the full barWidth when value exceeds max (e.g. a theoretical over-heal)', () => {
    expect(computeBarWidth(150, 100, 200)).toBe(200);
  });

  it('clamps to 0 when value is negative', () => {
    expect(computeBarWidth(-10, 100, 200)).toBe(0);
  });

  it('returns 0 (instead of NaN/Infinity) when max is 0', () => {
    // Fixes a latent bug: the original `Phaser.Math.Clamp(value/max, 0, 1)`
    // would compute 0/0 = NaN here, and NaN survives Phaser's clamp
    // unchanged, silently rendering a NaN-width bar. Never triggered by real
    // game data (maxHp and xpToNextLevel() are always > 0) but guarded
    // defensively.
    expect(computeBarWidth(0, 0, 200)).toBe(0);
    expect(computeBarWidth(50, 0, 200)).toBe(0);
  });

  it('returns 0 when max is negative', () => {
    expect(computeBarWidth(10, -5, 200)).toBe(0);
  });

  it('scales correctly for a non-200 barWidth, e.g. the 8px-tall XP bar fill', () => {
    expect(computeBarWidth(20, 40, 8)).toBe(4);
  });
});
