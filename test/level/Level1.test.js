import { describe, it, expect } from 'vitest';

await import('../../src/level/Level1.js');
const { Level1 } = window.G;

// Level1.js is hand-authored data with no code path validating it at write
// time — GameScene.js's enemy-type -> constructor lookup has no fallback for
// an unknown type (unlike its playerClass lookup), so an unrecognized
// `type` here would throw `new undefined(...)` at runtime. These tests are
// the safety net that makes that gap unreachable in practice.
describe('Level1 world bounds', () => {
  it('declares a positive width and height', () => {
    expect(Level1.width).toBeGreaterThan(0);
    expect(Level1.height).toBeGreaterThan(0);
  });
});

describe('Level1.playerSpawn', () => {
  it('is a numeric point within the world bounds', () => {
    expect(Number.isFinite(Level1.playerSpawn.x)).toBe(true);
    expect(Number.isFinite(Level1.playerSpawn.y)).toBe(true);
    expect(Level1.playerSpawn.x).toBeGreaterThanOrEqual(0);
    expect(Level1.playerSpawn.x).toBeLessThanOrEqual(Level1.width);
    expect(Level1.playerSpawn.y).toBeGreaterThanOrEqual(0);
    expect(Level1.playerSpawn.y).toBeLessThanOrEqual(Level1.height);
  });
});

describe('Level1.platforms', () => {
  it('has at least one platform (the level is not empty)', () => {
    expect(Level1.platforms.length).toBeGreaterThan(0);
  });

  Level1.platforms.forEach((platform, i) => {
    it(`platform ${i} has positive numeric width/height`, () => {
      expect(Number.isFinite(platform.width)).toBe(true);
      expect(Number.isFinite(platform.height)).toBe(true);
      expect(platform.width).toBeGreaterThan(0);
      expect(platform.height).toBeGreaterThan(0);
    });

    it(`platform ${i} (a top-left {x,y,width,height} rect) lies entirely within the world bounds`, () => {
      expect(platform.x).toBeGreaterThanOrEqual(0);
      expect(platform.y).toBeGreaterThanOrEqual(0);
      expect(platform.x + platform.width).toBeLessThanOrEqual(Level1.width);
      expect(platform.y + platform.height).toBeLessThanOrEqual(Level1.height);
    });
  });
});

describe('Level1.enemies', () => {
  const KNOWN_TYPES = ['slime', 'mushroom'];

  it('has at least one enemy spawn', () => {
    expect(Level1.enemies.length).toBeGreaterThan(0);
  });

  Level1.enemies.forEach((enemy, i) => {
    it(`enemy ${i}'s type ("${enemy.type}") is a type GameScene actually knows how to construct`, () => {
      // GameScene.js maps { slime: G.Slime, mushroom: G.Mushroom }[spec.type]
      // with no fallback — an unknown type here would try to `new
      // undefined(...)` at runtime instead of failing a test.
      expect(KNOWN_TYPES).toContain(enemy.type);
    });

    it(`enemy ${i} spawns within the world bounds`, () => {
      expect(enemy.x).toBeGreaterThanOrEqual(0);
      expect(enemy.x).toBeLessThanOrEqual(Level1.width);
      expect(enemy.y).toBeGreaterThanOrEqual(0);
      expect(enemy.y).toBeLessThanOrEqual(Level1.height);
    });
  });
});
