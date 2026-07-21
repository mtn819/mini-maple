window.G = window.G || {};

// Pure math shared by anything that positions or launches something relative
// to a facing direction: Warrior's melee hitbox offset, Mage's projectile
// spawn offset, and Projectile's launch velocity.
G.CombatLogic = (function () {
  // direction/facing is expected to be -1 or 1, but this makes no assumption
  // about that — it's a plain scale, so magnitude 0 or direction 0 both just
  // yield 0, and any other numeric direction scales proportionally.
  function scaleByDirection(direction, magnitude) {
    return direction * magnitude;
  }

  return { scaleByDirection };
})();
