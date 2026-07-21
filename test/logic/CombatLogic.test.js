import { describe, it, expect } from 'vitest';

await import('../../src/logic/CombatLogic.js');
const { scaleByDirection } = window.G.CombatLogic;

describe('CombatLogic.scaleByDirection', () => {
  it('scales a positive (rightward) direction to a positive result', () => {
    // Warrior's melee hitbox offset: facing right (1) * 18px reach.
    expect(scaleByDirection(1, 18)).toBe(18);
  });

  it('scales a negative (leftward) direction to a negative result', () => {
    // Mage's projectile spawn offset: facing left (-1) * 16px reach.
    expect(scaleByDirection(-1, 16)).toBe(-16);
  });

  it('scales a projectile launch velocity the same way (direction * speed)', () => {
    expect(scaleByDirection(-1, 300)).toBe(-300);
    expect(scaleByDirection(1, 300)).toBe(300);
  });

  it('a magnitude of 0 always yields (numerically) 0, regardless of direction', () => {
    // -1 * 0 is JS's negative zero, not positive zero — `toBe` uses
    // Object.is, which tells them apart, so it's asserted explicitly here.
    // It's a harmless quirk: -0 compares equal to 0 with `===` and behaves
    // identically as a Phaser velocity.
    expect(scaleByDirection(1, 0)).toBe(0);
    expect(scaleByDirection(-1, 0)).toBe(-0);
    expect(scaleByDirection(-1, 0) === 0).toBe(true);
  });

  it('a direction of 0 always yields 0, regardless of magnitude', () => {
    expect(scaleByDirection(0, 999)).toBe(0);
  });
});
