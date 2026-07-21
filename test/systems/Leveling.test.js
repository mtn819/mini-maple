import { describe, it, expect, vi } from 'vitest';

// Leveling.js was already Phaser-independent before this test suite existed —
// it only needs a plain object shaped like a Player (level/xp/maxHp/hp/
// attackDamage + an `emit` method), not a real Phaser sprite.
await import('../../src/systems/Leveling.js');
const { xpToNextLevel, applyLevelUp, gainXP } = window.G.Leveling;

function makeFakePlayer(overrides = {}) {
  return { level: 1, xp: 0, maxHp: 100, hp: 100, attackDamage: 10, emit: vi.fn(), ...overrides };
}

describe('Leveling.xpToNextLevel', () => {
  it('requires 40 XP to leave level 1', () => {
    expect(xpToNextLevel(1)).toBe(40);
  });

  it('requires 20 more XP per level above 1 (linear ramp)', () => {
    expect(xpToNextLevel(2)).toBe(60);
    expect(xpToNextLevel(5)).toBe(120);
  });
});

describe('Leveling.applyLevelUp', () => {
  it('increments level, grants +15 max HP, fully heals, and grants +2 attack damage', () => {
    const player = makeFakePlayer({ level: 3, maxHp: 100, hp: 40, attackDamage: 14 });
    applyLevelUp(player);

    expect(player.level).toBe(4);
    expect(player.maxHp).toBe(115);
    expect(player.hp).toBe(115); // full heal to the new max, not +15 from old hp
    expect(player.attackDamage).toBe(16);
  });
});

describe('Leveling.gainXP', () => {
  it('accumulates XP below the threshold without leveling up', () => {
    const player = makeFakePlayer({ level: 1, xp: 0 });
    gainXP(player, 39); // xpToNextLevel(1) === 40

    expect(player.level).toBe(1);
    expect(player.xp).toBe(39);
    expect(player.emit).not.toHaveBeenCalledWith('levelup', expect.anything());
    expect(player.emit).toHaveBeenCalledWith('xpchanged', 39, 40);
    expect(player.emit).toHaveBeenCalledTimes(1); // xpchanged only
  });

  it('levels up exactly when accumulated XP reaches the threshold (">=" boundary)', () => {
    const player = makeFakePlayer({ level: 1, xp: 0 });
    gainXP(player, 40); // exactly xpToNextLevel(1)

    expect(player.level).toBe(2);
    expect(player.xp).toBe(0); // 40 - 40 leftover
    expect(player.emit).toHaveBeenCalledWith('levelup', 2);
  });

  it('does not level up one XP short of the threshold', () => {
    const player = makeFakePlayer({ level: 1, xp: 0 });
    gainXP(player, 39);
    expect(player.level).toBe(1);
  });

  it('can level up multiple times from a single large XP gain, firing levelup/hpchanged once per level', () => {
    const player = makeFakePlayer({ level: 1, xp: 0, maxHp: 100, hp: 100, attackDamage: 10 });

    // level 1->2 costs 40 (leaves 65), level 2->3 costs 60 (leaves 5),
    // level 3 needs 80 for the next level so the loop then stops.
    gainXP(player, 105);

    expect(player.level).toBe(3);
    expect(player.xp).toBe(5);

    const levelupCalls = player.emit.mock.calls.filter(([event]) => event === 'levelup');
    const hpchangedCalls = player.emit.mock.calls.filter(([event]) => event === 'hpchanged');
    expect(levelupCalls).toEqual([
      ['levelup', 2],
      ['levelup', 3],
    ]);
    expect(hpchangedCalls).toHaveLength(2);
  });

  it('emits xpchanged exactly once at the end, regardless of how many levels were gained', () => {
    const player = makeFakePlayer({ level: 1, xp: 0 });
    gainXP(player, 105);

    const xpchangedCalls = player.emit.mock.calls.filter(([event]) => event === 'xpchanged');
    expect(xpchangedCalls).toEqual([['xpchanged', 5, xpToNextLevel(3)]]);
  });

  it('a zero XP gain still emits xpchanged (with the unchanged xp) but never levels up', () => {
    const player = makeFakePlayer({ level: 1, xp: 10 });
    gainXP(player, 0);

    expect(player.level).toBe(1);
    expect(player.xp).toBe(10);
    expect(player.emit).toHaveBeenCalledWith('xpchanged', 10, 40);
    expect(player.emit).toHaveBeenCalledTimes(1);
  });

  it('a negative XP gain reduces xp and still only emits xpchanged (documented existing behavior)', () => {
    // The real game never calls gainXP with a negative amount, but the
    // function itself has no guard against it — this documents what
    // actually happens rather than assuming a clamp that isn't there.
    const player = makeFakePlayer({ level: 1, xp: 10 });
    gainXP(player, -5);

    expect(player.xp).toBe(5);
    expect(player.level).toBe(1);
    expect(player.emit).toHaveBeenCalledTimes(1);
  });
});
