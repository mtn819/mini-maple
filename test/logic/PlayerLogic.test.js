import { describe, it, expect } from 'vitest';

// Side-effect import: populates window.G.PlayerLogic, same as a <script> tag.
await import('../../src/logic/PlayerLogic.js');
const { resolveMovement, isAttackReady, applyDamage, nextAnimation } = window.G.PlayerLogic;

describe('PlayerLogic.resolveMovement', () => {
  it('moves left when only left is held', () => {
    expect(resolveMovement({ left: true, right: false, moveSpeed: 160, currentFacing: 1 })).toEqual({
      vx: -160,
      facing: -1,
      flipX: true,
    });
  });

  it('moves right when only right is held', () => {
    expect(resolveMovement({ left: false, right: true, moveSpeed: 160, currentFacing: -1 })).toEqual({
      vx: 160,
      facing: 1,
      flipX: false,
    });
  });

  it('left wins the tie-break when both left and right are held', () => {
    // Player.update() uses `if (isLeftDown()) ... else if (isRightDown())`,
    // so left is checked first and wins outright — this is not a symmetric
    // "cancel out to zero" tie-break.
    expect(resolveMovement({ left: true, right: true, moveSpeed: 160, currentFacing: 1 })).toEqual({
      vx: -160,
      facing: -1,
      flipX: true,
    });
  });

  it('stops and preserves current facing/flipX when neither direction is held', () => {
    // The original code's `else` branch only zeroes velocity — it never
    // touches facing/flipX, so an idle player keeps whichever way they were
    // last facing.
    expect(resolveMovement({ left: false, right: false, moveSpeed: 160, currentFacing: 1 })).toEqual({
      vx: 0,
      facing: 1,
      flipX: false,
    });
    expect(resolveMovement({ left: false, right: false, moveSpeed: 160, currentFacing: -1 })).toEqual({
      vx: 0,
      facing: -1,
      flipX: true,
    });
  });

  it('scales velocity magnitude by the supplied moveSpeed', () => {
    expect(resolveMovement({ left: true, right: false, moveSpeed: 0, currentFacing: 1 }).vx).toBe(-0);
    expect(resolveMovement({ left: false, right: true, moveSpeed: 999, currentFacing: 1 }).vx).toBe(999);
  });
});

describe('PlayerLogic.isAttackReady', () => {
  it('is not ready before the cooldown has elapsed', () => {
    expect(isAttackReady(1000, 800, 450)).toBe(false); // 1000 < 800+450
  });

  it('is not ready exactly at the cooldown boundary (strict ">")', () => {
    expect(isAttackReady(1250, 800, 450)).toBe(false); // 1250 === 800+450
  });

  it('is ready the instant after the cooldown boundary', () => {
    expect(isAttackReady(1251, 800, 450)).toBe(true);
  });

  it('is ready on the very first attack, when lastAttackTime is -Infinity', () => {
    expect(isAttackReady(0, -Infinity, 450)).toBe(true);
  });
});

describe('PlayerLogic.applyDamage', () => {
  const base = { hp: 100, invulnerableUntil: 0, time: 1000, amount: 20, hurtInvulnMs: 500 };

  it('subtracts damage and opens a new invulnerability window', () => {
    expect(applyDamage(base)).toEqual({
      hp: 80,
      invulnerableUntil: 1500, // time (1000) + hurtInvulnMs (500)
      died: false,
      applied: true,
    });
  });

  it('clamps hp at 0 instead of going negative, and reports died: true', () => {
    expect(applyDamage({ ...base, hp: 10, amount: 999 })).toEqual({
      hp: 0,
      invulnerableUntil: 1500,
      died: true,
      applied: true,
    });
  });

  it('is a no-op once hp has already reached 0', () => {
    expect(applyDamage({ ...base, hp: 0 })).toEqual({
      hp: 0,
      invulnerableUntil: base.invulnerableUntil,
      died: false,
      applied: false,
    });
  });

  it('is blocked while time is strictly before invulnerableUntil', () => {
    expect(applyDamage({ ...base, invulnerableUntil: 1001 })).toEqual({
      hp: base.hp,
      invulnerableUntil: 1001,
      died: false,
      applied: false,
    });
  });

  it('applies damage exactly when time === invulnerableUntil', () => {
    // Contrast with isAttackReady, whose boundary is the opposite way: that
    // one is NOT ready at time === lastAttackTime + cooldown. Here, damage
    // DOES land at time === invulnerableUntil, because the guard is a strict
    // '<', not '<='.
    const result = applyDamage({ ...base, invulnerableUntil: 1000 });
    expect(result.applied).toBe(true);
    expect(result.hp).toBe(80);
  });
});

describe('PlayerLogic.nextAnimation', () => {
  it('returns null (no change) while attacking, regardless of ground/velocity', () => {
    expect(nextAnimation({ isAttacking: true, onGround: true, vx: 200 })).toBeNull();
  });

  it('returns null (no change) while airborne', () => {
    expect(nextAnimation({ isAttacking: false, onGround: false, vx: 0 })).toBeNull();
  });

  it('returns "idle" when grounded and not attacking with negligible velocity', () => {
    expect(nextAnimation({ isAttacking: false, onGround: true, vx: 0 })).toBe('idle');
  });

  it('treats exactly |vx| === 5 as idle, not walk (strict ">")', () => {
    expect(nextAnimation({ isAttacking: false, onGround: true, vx: 5 })).toBe('idle');
    expect(nextAnimation({ isAttacking: false, onGround: true, vx: -5 })).toBe('idle');
  });

  it('returns "walk" the instant |vx| exceeds 5, in either direction', () => {
    expect(nextAnimation({ isAttacking: false, onGround: true, vx: 5.01 })).toBe('walk');
    expect(nextAnimation({ isAttacking: false, onGround: true, vx: -160 })).toBe('walk');
  });
});
