import { describe, it, expect, vi } from 'vitest';

await import('../../src/core/PixelArt.js');
const { drawFrame, validateFrame, computeFrameLayout } = window.G.PixelArt;

// A minimal fake 2D canvas context: records every fillRect call along with
// whatever fillStyle was set immediately before it, without touching a real
// canvas (unavailable under jsdom in this environment — see PixelArt.js).
function makeFakeCtx() {
  const calls = [];
  const ctx = {
    fillStyle: null,
    fillRect: vi.fn((x, y, w, h) => calls.push({ fillStyle: ctx.fillStyle, x, y, w, h })),
  };
  return { ctx, calls };
}

describe('PixelArt.validateFrame', () => {
  it('does not throw for a frame matching the expected dimensions', () => {
    expect(() => validateFrame(['AB', 'CD'], 2, 2, 'slime', 'idle', 0)).not.toThrow();
  });

  it('throws when the row count does not match expectedHeight', () => {
    expect(() => validateFrame(['AB'], 2, 2, 'slime', 'idle', 0)).toThrow(
      'PixelArt: slime/idle frame 0 has 1 rows, expected 2'
    );
  });

  it('throws naming the specific offending row when a row length does not match expectedWidth', () => {
    expect(() => validateFrame(['AB', 'CDE'], 2, 2, 'slime', 'idle', 1)).toThrow(
      'PixelArt: slime/idle frame 1 row 1 has length 3, expected 2'
    );
  });

  it('checks every row, not just the first — a mismatch on a later row is still caught', () => {
    expect(() => validateFrame(['AB', 'CD', 'EFG'], 2, 3, 'mage', 'walk', 2)).toThrow(
      'PixelArt: mage/walk frame 2 row 2 has length 3, expected 2'
    );
  });
});

describe('PixelArt.drawFrame', () => {
  const palette = { A: '#111111', B: '#222222' };

  it('fills one rect per non-"." pixel, at destX/destY-offset coordinates', () => {
    const { ctx, calls } = makeFakeCtx();
    drawFrame(ctx, ['AB', '.A'], palette, 10, 20, 'slime', 'idle', 0);

    expect(calls).toEqual([
      { fillStyle: '#111111', x: 10, y: 20, w: 1, h: 1 }, // row 0, col 0 = 'A'
      { fillStyle: '#222222', x: 11, y: 20, w: 1, h: 1 }, // row 0, col 1 = 'B'
      { fillStyle: '#111111', x: 11, y: 21, w: 1, h: 1 }, // row 1, col 1 = 'A' ('.' at col 0 skipped)
    ]);
  });

  it('skips "." pixels entirely — no fillRect call at all for a fully transparent row', () => {
    const { ctx, calls } = makeFakeCtx();
    drawFrame(ctx, ['..', '..'], palette, 0, 0, 'slime', 'idle', 0);
    expect(calls).toHaveLength(0);
  });

  it('throws with entity/anim/frame/row context when a pixel character has no palette entry', () => {
    const { ctx } = makeFakeCtx();
    expect(() => drawFrame(ctx, ['AZ'], palette, 0, 0, 'mushroom', 'attack', 2)).toThrow(
      'PixelArt: unknown palette key "Z" in mushroom/attack frame 2, row 0'
    );
  });

  it('draws nothing before the offending pixel is reached, then throws (partial draw, not rolled back)', () => {
    const { ctx, calls } = makeFakeCtx();
    expect(() => drawFrame(ctx, ['AZ'], palette, 0, 0, 'mushroom', 'attack', 0)).toThrow();
    // The 'A' before the bad 'Z' was already drawn — drawFrame does not
    // buffer/rollback, it draws directly to ctx as it scans.
    expect(calls).toEqual([{ fillStyle: '#111111', x: 0, y: 0, w: 1, h: 1 }]);
  });
});

describe('PixelArt.computeFrameLayout', () => {
  const palette = { A: '#111111' };
  const frame = ['A'];

  it('returns empty flat/ranges for an empty framesByAnim', () => {
    expect(computeFrameLayout({}, 1, 1, 'slime')).toEqual({ flat: [], ranges: {} });
  });

  it('produces sequential, non-overlapping ranges across multiple animations, in key order', () => {
    const framesByAnim = {
      idle: [frame, frame],
      walk: [frame, frame, frame],
    };
    const { flat, ranges } = computeFrameLayout(framesByAnim, 1, 1, 'warrior');

    expect(flat).toHaveLength(5);
    expect(ranges).toEqual({
      idle: { start: 0, end: 1 },
      walk: { start: 2, end: 4 },
    });
  });

  it('produces an inverted {start,end} range for an animation with zero frames', () => {
    const { ranges } = computeFrameLayout({ idle: [frame], attack: [] }, 1, 1, 'mage');
    // Not a typical usable range, but a real, deliberately-unguarded
    // contract detail: end = start - 1 when there are no frames to place.
    expect(ranges.attack).toEqual({ start: 1, end: 0 });
  });

  it('propagates validateFrame\'s error, unmodified, the moment a malformed frame is reached', () => {
    const framesByAnim = { idle: [frame], walk: [['AA']] }; // 'AA' has width 2, expected 1
    expect(() => computeFrameLayout(framesByAnim, 1, 1, 'mage')).toThrow(
      'PixelArt: mage/walk frame 0 row 0 has length 2, expected 1'
    );
  });
});
