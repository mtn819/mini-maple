window.G = window.G || {};

// Pure decision logic extracted out of entities/Player.js so it can be unit
// tested without a Phaser scene/sprite. No function here reads or mutates a
// Phaser object — Player.js is responsible for applying these results to its
// sprite/body state.
G.PlayerLogic = (function () {
  // Left takes priority over right when both are held, matching the original
  // if/else-if order in Player.update(). When neither is held, facing/flipX
  // pass `currentFacing` through unchanged (the original code simply doesn't
  // touch them in that branch).
  function resolveMovement({ left, right, moveSpeed, currentFacing }) {
    if (left) {
      return { vx: -moveSpeed, facing: -1, flipX: true };
    }
    if (right) {
      return { vx: moveSpeed, facing: 1, flipX: false };
    }
    return { vx: 0, facing: currentFacing, flipX: currentFacing === -1 };
  }

  // Strict '>': an attack fired exactly at lastAttackTime + cooldown is not
  // yet ready. This check runs unconditionally in Player.update(), even while
  // isAttacking is already true, so a mid-swing attack can retrigger once the
  // cooldown elapses — that's existing behavior, preserved here as-is.
  function isAttackReady(time, lastAttackTime, cooldown) {
    return time > lastAttackTime + cooldown;
  }

  // Mirrors Player.takeDamage(). `applied: false` means the caller should
  // skip the hpchanged/died events and hit-flash entirely, exactly like the
  // original's early `return`.
  function applyDamage({ hp, invulnerableUntil, time, amount, hurtInvulnMs }) {
    if (hp <= 0 || time < invulnerableUntil) {
      return { hp, invulnerableUntil, died: false, applied: false };
    }

    const newHp = Math.max(0, hp - amount);

    return {
      hp: newHp,
      invulnerableUntil: time + hurtInvulnMs,
      died: newHp <= 0,
      applied: true,
    };
  }

  // null means "don't change the current animation" (mirrors the original's
  // early return while attacking or airborne). Boundary: exactly |vx| === 5
  // counts as idle, not walk (strict '>').
  function nextAnimation({ isAttacking, onGround, vx }) {
    if (isAttacking || !onGround) return null;
    return Math.abs(vx) > 5 ? 'walk' : 'idle';
  }

  return { resolveMovement, isAttackReady, applyDamage, nextAnimation };
})();
