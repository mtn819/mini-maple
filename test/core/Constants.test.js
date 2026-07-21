import { describe, it, expect } from 'vitest';

await import('../../src/core/Constants.js');
const { Constants } = window.G;

// Constants.js is flat tuning data with no branching logic — this is a
// sanity net against an accidental typo (e.g. a stray string, NaN, or
// negative gravity) rather than exhaustive edge-case coverage.
describe('Constants', () => {
  it('GRAVITY_Y is a positive finite number (downward pull, not zero or inverted)', () => {
    expect(Number.isFinite(Constants.GRAVITY_Y)).toBe(true);
    expect(Constants.GRAVITY_Y).toBeGreaterThan(0);
  });

  it('SPRITE_SCALE is a positive finite number (0 or negative would make sprites invisible/mirrored)', () => {
    expect(Number.isFinite(Constants.SPRITE_SCALE)).toBe(true);
    expect(Constants.SPRITE_SCALE).toBeGreaterThan(0);
  });

  it('HURT_INVULN_MS is a non-negative finite number', () => {
    expect(Number.isFinite(Constants.HURT_INVULN_MS)).toBe(true);
    expect(Constants.HURT_INVULN_MS).toBeGreaterThanOrEqual(0);
  });
});
