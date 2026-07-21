window.G = window.G || {};

// Pure decision logic extracted out of entities/Enemy.js. No function here
// touches a Phaser object; Enemy.js applies the results to its sprite/body.
G.EnemyLogic = (function () {
  // Enemy.js reads this instead of owning its own copy, so there is one
  // source of truth for the state name strings.
  const STATE = {
    PATROL: 'PATROL',
    CHASE: 'CHASE',
    DEAD: 'DEAD',
  };

  // DEAD is a terminal, no-op state here even though Enemy.update() already
  // short-circuits before ever calling this — kept so the function's own
  // contract is self-consistent if called directly.
  //
  // The two transitions are deliberately asymmetric: PATROL -> CHASE fires
  // the instant distance drops below aggroRange (and the player is alive);
  // CHASE -> PATROL only fires once distance grows past 1.5x aggroRange (or
  // the player dies). The gap between aggroRange and 1.5x aggroRange is a
  // hysteresis band — an already-chasing enemy stays CHASE there, but a
  // patrolling enemy at that same distance never starts a chase.
  function nextState({ state, distance, aggroRange, playerHp }) {
    if (state === STATE.DEAD) return STATE.DEAD;
    if (state === STATE.PATROL && distance < aggroRange && playerHp > 0) return STATE.CHASE;
    if (state === STATE.CHASE && (distance > aggroRange * 1.5 || playerHp <= 0)) return STATE.PATROL;
    return state;
  }

  // Ties (player exactly overlapping the enemy) resolve to facing right (1),
  // not 0 — there is no "don't move" case, the ternary's ':' branch always
  // wins a tie.
  function computeChaseDirection(playerX, enemyX) {
    return playerX < enemyX ? -1 : 1;
  }

  // Both bound checks run unconditionally (not else-if), matching the
  // original. In the ordinary case (patrolMinX < patrolMaxX) at most one of
  // them can be true on a given tick. In the degenerate case where the two
  // bounds are inverted or equal, x could satisfy both simultaneously, and
  // the second check (patrolMaxX) wins because it runs last — that ordering
  // is existing behavior, preserved rather than "fixed" here.
  function resolvePatrolDir({ x, patrolMinX, patrolMaxX, patrolDir }) {
    let dir = patrolDir;
    if (x <= patrolMinX) dir = 1;
    if (x >= patrolMaxX) dir = -1;
    return dir;
  }

  // No isAttacking/onGround gating here, unlike PlayerLogic.nextAnimation —
  // enemies always have exactly two animation states.
  function nextAnimation(vx) {
    return Math.abs(vx) > 5 ? 'walk' : 'idle';
  }

  function applyDamage({ hp, amount }) {
    const newHp = Math.max(0, hp - amount);
    return { hp: newHp, died: newHp <= 0 };
  }

  return { STATE, nextState, computeChaseDirection, resolvePatrolDir, nextAnimation, applyDamage };
})();
