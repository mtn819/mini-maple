import { describe, it, expect } from 'vitest';
import { installPhaserStub, makeFakeKey } from '../support/phaserStub.js';

installPhaserStub();
await import('../../src/systems/InputController.js');
const { InputController } = window.G;

// Builds a fake Phaser `scene` whose input.keyboard surface InputController
// reads from, plus direct references to the fake key objects so each test
// can flip .isDown/.justDown to simulate a keypress.
function makeFakeScene() {
  const cursors = { left: makeFakeKey(), right: makeFakeKey(), up: makeFakeKey() };
  const keys = {
    a: makeFakeKey(),
    d: makeFakeKey(),
    w: makeFakeKey(),
    space: makeFakeKey(),
    x: makeFakeKey(),
    j: makeFakeKey(),
  };
  const scene = {
    input: { keyboard: { createCursorKeys: () => cursors, addKeys: () => keys } },
  };
  return { scene, cursors, keys };
}

describe('InputController.isLeftDown', () => {
  it('is true when the left arrow is held', () => {
    const { scene, cursors } = makeFakeScene();
    const input = new InputController(scene);
    cursors.left.isDown = true;
    expect(input.isLeftDown()).toBe(true);
  });

  it('is true when "A" is held, even if the left arrow is not (either source counts)', () => {
    const { scene, keys } = makeFakeScene();
    const input = new InputController(scene);
    keys.a.isDown = true;
    expect(input.isLeftDown()).toBe(true);
  });

  it('is false when neither the left arrow nor "A" is held', () => {
    const { scene } = makeFakeScene();
    expect(new InputController(scene).isLeftDown()).toBe(false);
  });
});

describe('InputController.isRightDown', () => {
  it('is true when the right arrow is held', () => {
    const { scene, cursors } = makeFakeScene();
    const input = new InputController(scene);
    cursors.right.isDown = true;
    expect(input.isRightDown()).toBe(true);
  });

  it('is true when "D" is held, even if the right arrow is not', () => {
    const { scene, keys } = makeFakeScene();
    const input = new InputController(scene);
    keys.d.isDown = true;
    expect(input.isRightDown()).toBe(true);
  });

  it('is false when neither the right arrow nor "D" is held', () => {
    const { scene } = makeFakeScene();
    expect(new InputController(scene).isRightDown()).toBe(false);
  });
});

describe('InputController.isJumpJustDown', () => {
  it('is true the instant the up arrow becomes just-down', () => {
    const { scene, cursors } = makeFakeScene();
    const input = new InputController(scene);
    cursors.up.justDown = true;
    expect(input.isJumpJustDown()).toBe(true);
  });

  it('is true for "W" just-down, independently of the up arrow', () => {
    const { scene, keys } = makeFakeScene();
    const input = new InputController(scene);
    keys.w.justDown = true;
    expect(input.isJumpJustDown()).toBe(true);
  });

  it('is true for Space just-down, independently of the other two jump sources', () => {
    const { scene, keys } = makeFakeScene();
    const input = new InputController(scene);
    keys.space.justDown = true;
    expect(input.isJumpJustDown()).toBe(true);
  });

  it('only fires once per press — edge-triggered, not level-triggered', () => {
    const { scene, cursors } = makeFakeScene();
    const input = new InputController(scene);
    cursors.up.justDown = true;

    expect(input.isJumpJustDown()).toBe(true);
    expect(input.isJumpJustDown()).toBe(false); // still "held" conceptually, but not JUST down anymore
  });

  it('is false when no jump source has just gone down', () => {
    const { scene } = makeFakeScene();
    expect(new InputController(scene).isJumpJustDown()).toBe(false);
  });
});

describe('InputController.isAttackJustDown', () => {
  it('is true for "X" just-down', () => {
    const { scene, keys } = makeFakeScene();
    const input = new InputController(scene);
    keys.x.justDown = true;
    expect(input.isAttackJustDown()).toBe(true);
  });

  it('is true for "J" just-down, independently of "X"', () => {
    const { scene, keys } = makeFakeScene();
    const input = new InputController(scene);
    keys.j.justDown = true;
    expect(input.isAttackJustDown()).toBe(true);
  });

  it('is false when neither attack key has just gone down', () => {
    const { scene } = makeFakeScene();
    expect(new InputController(scene).isAttackJustDown()).toBe(false);
  });
});
