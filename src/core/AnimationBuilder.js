window.G = window.G || {};

G.AnimationBuilder = (function () {
  // Pure default-resolution. The `!== undefined` checks matter: an explicit
  // 0 for either frameRate or repeat must survive, not fall back to the
  // default. This is load-bearing for Warrior/Mage's attack animation, which
  // sets `repeat: 0` (play once) — `!==undefined` is what stops that 0 from
  // being replaced by the default `repeat: -1` (loop forever).
  function resolveAnimConfig(animConfig) {
    animConfig = animConfig || {};
    return {
      frameRate: animConfig.frameRate !== undefined ? animConfig.frameRate : 6,
      repeat: animConfig.repeat !== undefined ? animConfig.repeat : -1,
    };
  }

  // ranges: { idle: {start,end}, walk: {start,end}, ... } as returned by
  // PixelArt.buildAnimatedSpriteSheet/computeFrameLayout. config: per-anim
  // {frameRate, repeat} overrides.
  function registerAnimations(scene, entityKey, ranges, config) {
    config = config || {};
    Object.keys(ranges).forEach((animName) => {
      const range = ranges[animName];
      const { frameRate, repeat } = resolveAnimConfig(config[animName]);
      scene.anims.create({
        key: `${entityKey}-${animName}`,
        frames: scene.anims.generateFrameNumbers(entityKey, { start: range.start, end: range.end }),
        frameRate,
        repeat,
      });
    });
  }

  return { resolveAnimConfig, registerAnimations };
})();
