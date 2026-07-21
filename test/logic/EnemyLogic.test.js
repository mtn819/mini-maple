import { describe, it, expect } from 'vitest';

await import('../../src/logic/EnemyLogic.js');
const { STATE, nextState, computeChaseDirection, resolvePatrolDir, nextAnimation, applyDamage } =
  window.G.EnemyLogic;

describe('EnemyLogic.nextState', () => {
  it('DEAD is terminal: stays DEAD regardless of distance/aggro/playerHp', () => {
    expect(nextState({ state: STATE.DEAD, distance: 0, aggroRange: 100, playerHp: 100 })).toBe(STATE.DEAD);
  });

  it('PATROL -> CHASE when the player is within aggroRange and alive', () => {
    expect(nextState({ state: STATE.PATROL, distance: 50, aggroRange: 100, playerHp: 10 })).toBe(STATE.CHASE);
  });

  it('PATROL does NOT start a chase exactly at the aggroRange boundary (strict "<")', () => {
    expect(nextState({ state: STATE.PATROL, distance: 100, aggroRange: 100, playerHp: 10 })).toBe(STATE.PATROL);
  });

  it('PATROL ignores a nearby but already-dead player', () => {
    expect(nextState({ state: STATE.PATROL, distance: 10, aggroRange: 100, playerHp: 0 })).toBe(STATE.PATROL);
  });

  it('CHASE -> PATROL once the player escapes past 1.5x aggroRange', () => {
    expect(nextState({ state: STATE.CHASE, distance: 151, aggroRange: 100, playerHp: 10 })).toBe(STATE.PATROL);
  });

  it('CHASE does NOT disengage exactly at the 1.5x boundary (strict ">")', () => {
    expect(nextState({ state: STATE.CHASE, distance: 150, aggroRange: 100, playerHp: 10 })).toBe(STATE.CHASE);
  });

  it('CHASE stays engaged throughout the hysteresis band between aggroRange and 1.5x aggroRange', () => {
    // A distance of 120 would NOT trigger PATROL -> CHASE (it's not < 100),
    // but an already-chasing enemy does not give up until past 150.
    expect(nextState({ state: STATE.CHASE, distance: 120, aggroRange: 100, playerHp: 10 })).toBe(STATE.CHASE);
  });

  it('CHASE -> PATROL immediately when the player dies, regardless of distance', () => {
    expect(nextState({ state: STATE.CHASE, distance: 1, aggroRange: 100, playerHp: 0 })).toBe(STATE.PATROL);
  });
});

describe('EnemyLogic.computeChaseDirection', () => {
  it('chases left (-1) when the player is to the left', () => {
    expect(computeChaseDirection(50, 100)).toBe(-1);
  });

  it('chases right (1) when the player is to the right', () => {
    expect(computeChaseDirection(150, 100)).toBe(1);
  });

  it('resolves an exact tie (player.x === enemy.x) to right (1), not 0', () => {
    expect(computeChaseDirection(100, 100)).toBe(1);
  });
});

describe('EnemyLogic.resolvePatrolDir', () => {
  it('flips to +1 (rightward) once x reaches the min bound', () => {
    expect(resolvePatrolDir({ x: 40, patrolMinX: 40, patrolMaxX: 160, patrolDir: -1 })).toBe(1);
  });

  it('flips to -1 (leftward) once x reaches the max bound', () => {
    expect(resolvePatrolDir({ x: 160, patrolMinX: 40, patrolMaxX: 160, patrolDir: 1 })).toBe(-1);
  });

  it('keeps the current direction while strictly between the bounds', () => {
    expect(resolvePatrolDir({ x: 100, patrolMinX: 40, patrolMaxX: 160, patrolDir: 1 })).toBe(1);
    expect(resolvePatrolDir({ x: 100, patrolMinX: 40, patrolMaxX: 160, patrolDir: -1 })).toBe(-1);
  });

  it('in the degenerate case where bounds are inverted, the max-bound check wins (runs last)', () => {
    // Both `x <= patrolMinX` and `x >= patrolMaxX` can be true at once only
    // if patrolMinX >= patrolMaxX. The two checks are independent ifs, not
    // an if/else, so whichever runs second overwrites the first — that's
    // existing behavior from Enemy.js, documented here rather than changed.
    expect(resolvePatrolDir({ x: 50, patrolMinX: 100, patrolMaxX: 0, patrolDir: 1 })).toBe(-1);
  });
});

describe('EnemyLogic.nextAnimation', () => {
  it('is "idle" at zero velocity', () => {
    expect(nextAnimation(0)).toBe('idle');
  });

  it('treats exactly |vx| === 5 as idle, not walk (strict ">")', () => {
    expect(nextAnimation(5)).toBe('idle');
    expect(nextAnimation(-5)).toBe('idle');
  });

  it('is "walk" the instant |vx| exceeds 5, in either direction', () => {
    expect(nextAnimation(5.01)).toBe('walk');
    expect(nextAnimation(-40)).toBe('walk');
  });

  it('has no isAttacking/onGround gating, unlike PlayerLogic.nextAnimation — always returns a string', () => {
    expect(nextAnimation(0)).not.toBeNull();
  });
});

describe('EnemyLogic.applyDamage', () => {
  it('subtracts damage and reports died: false while hp remains positive', () => {
    expect(applyDamage({ hp: 20, amount: 8 })).toEqual({ hp: 12, died: false });
  });

  it('clamps hp at 0 (never negative) when damage exceeds remaining hp', () => {
    expect(applyDamage({ hp: 5, amount: 999 })).toEqual({ hp: 0, died: true });
  });

  it('reports died: true exactly when hp reaches 0, not before', () => {
    expect(applyDamage({ hp: 8, amount: 8 })).toEqual({ hp: 0, died: true });
    expect(applyDamage({ hp: 8, amount: 7 })).toEqual({ hp: 1, died: false });
  });
});
