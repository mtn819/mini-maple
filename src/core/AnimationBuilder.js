window.G = window.G || {};

G.AnimationBuilder = {
  // ranges: { idle: {start,end}, walk: {start,end}, ... } as returned by
  // PixelArt.buildAnimatedSpriteSheet. config: per-anim {frameRate, repeat} overrides.
  registerAnimations(scene, entityKey, ranges, config) {
    config = config || {};
    Object.keys(ranges).forEach((animName) => {
      const range = ranges[animName];
      const animConfig = config[animName] || {};
      scene.anims.create({
        key: `${entityKey}-${animName}`,
        frames: scene.anims.generateFrameNumbers(entityKey, { start: range.start, end: range.end }),
        frameRate: animConfig.frameRate !== undefined ? animConfig.frameRate : 6,
        repeat: animConfig.repeat !== undefined ? animConfig.repeat : -1,
      });
    });
  },
};
