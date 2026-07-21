window.G = window.G || {};

// Pure bar-width math extracted out of scenes/HUDScene.js. Deliberately does
// NOT call Phaser.Math.Clamp — using a Phaser-independent inline clamp
// instead is the whole point of this module (testable without Phaser
// present). This also fixes a latent bug in the original: dividing by a
// max/xpNeeded of 0 or less produced NaN/Infinity, which Phaser.Math.Clamp
// passes straight through as NaN, silently rendering a NaN-width bar. Never
// triggered by current game data (maxHp and xpToNextLevel() are always > 0),
// but guarded here defensively.
G.HUDLogic = (function () {
  function computeBarWidth(value, max, barWidth) {
    if (max <= 0) return 0;

    const ratio = value / max;
    const clamped = Math.min(Math.max(ratio, 0), 1);
    return barWidth * clamped;
  }

  return { computeBarWidth };
})();
