import { describe, it, expect, vi } from 'vitest';

await import('../../src/core/AnimationBuilder.js');
const { resolveAnimConfig, registerAnimations } = window.G.AnimationBuilder;

describe('AnimationBuilder.resolveAnimConfig', () => {
  it('defaults to frameRate 6 and repeat -1 (loop forever) for undefined input', () => {
    expect(resolveAnimConfig(undefined)).toEqual({ frameRate: 6, repeat: -1 });
  });

  it('defaults the same way for an empty object', () => {
    expect(resolveAnimConfig({})).toEqual({ frameRate: 6, repeat: -1 });
  });

  it('preserves an explicit repeat: 0 (play-once) instead of falling back to the default', () => {
    // This is the real Warrior/Mage attack-animation config in BootScene.js —
    // if this regressed to `||` instead of `!== undefined`, attacks would
    // loop forever instead of playing once.
    expect(resolveAnimConfig({ repeat: 0 })).toEqual({ frameRate: 6, repeat: 0 });
  });

  it('preserves an explicit frameRate: 0 the same way, even though no real data uses it', () => {
    expect(resolveAnimConfig({ frameRate: 0 })).toEqual({ frameRate: 0, repeat: -1 });
  });

  it('passes through a full explicit override untouched', () => {
    expect(resolveAnimConfig({ frameRate: 10, repeat: 3 })).toEqual({ frameRate: 10, repeat: 3 });
  });
});

describe('AnimationBuilder.registerAnimations', () => {
  function makeFakeScene() {
    return {
      anims: {
        create: vi.fn(),
        generateFrameNumbers: vi.fn((key, { start, end }) => ({ key, start, end })),
      },
    };
  }

  it('registers one animation per range, keyed as "<entityKey>-<animName>"', () => {
    const scene = makeFakeScene();
    const ranges = { idle: { start: 0, end: 1 }, walk: { start: 2, end: 4 } };

    registerAnimations(scene, 'slime', ranges, undefined);

    expect(scene.anims.create).toHaveBeenCalledTimes(2);
    expect(scene.anims.create).toHaveBeenCalledWith({
      key: 'slime-idle',
      frames: { key: 'slime', start: 0, end: 1 },
      frameRate: 6,
      repeat: -1,
    });
    expect(scene.anims.create).toHaveBeenCalledWith({
      key: 'slime-walk',
      frames: { key: 'slime', start: 2, end: 4 },
      frameRate: 6,
      repeat: -1,
    });
  });

  it('requests frames from generateFrameNumbers using the entityKey and that range\'s start/end', () => {
    const scene = makeFakeScene();
    registerAnimations(scene, 'mage', { attack: { start: 5, end: 5 } }, undefined);

    expect(scene.anims.generateFrameNumbers).toHaveBeenCalledWith('mage', { start: 5, end: 5 });
  });

  it('applies a per-animation config override without affecting other animations', () => {
    const scene = makeFakeScene();
    const ranges = { idle: { start: 0, end: 1 }, attack: { start: 2, end: 3 } };
    const config = { attack: { frameRate: 10, repeat: 0 } };

    registerAnimations(scene, 'warrior', ranges, config);

    expect(scene.anims.create).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'warrior-idle', frameRate: 6, repeat: -1 })
    );
    expect(scene.anims.create).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'warrior-attack', frameRate: 10, repeat: 0 })
    );
  });

  it('treats a missing `config` argument the same as an empty one — every range still gets registered', () => {
    const scene = makeFakeScene();
    registerAnimations(scene, 'mushroom', { idle: { start: 0, end: 0 } });
    expect(scene.anims.create).toHaveBeenCalledTimes(1);
  });

  it('does nothing (no create calls) when ranges is empty', () => {
    const scene = makeFakeScene();
    registerAnimations(scene, 'projectile', {}, undefined);
    expect(scene.anims.create).not.toHaveBeenCalled();
  });
});
