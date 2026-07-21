import { describe, it, expect } from 'vitest';

// These tests don't exercise new logic — they run the real, already-tested
// PixelArt.validateFrame against every actual hand-authored sprite in
// src/art/*.js, and independently check every non-"." pixel character used
// has a palette entry. This is a regression net against authoring mistakes
// (a row typed with the wrong length, a palette key that was renamed in one
// place but not another) that would otherwise only surface as a thrown error
// or a broken sprite the first time the game boots in a real browser.
await import('../../src/core/PixelArt.js');
await import('../../src/art/playerFrames.js');
await import('../../src/art/enemyFrames.js');
await import('../../src/art/worldFrames.js');

const { validateFrame } = window.G.PixelArt;
const { Art } = window.G;

// Collects every non-'.' character in `rows` that has no entry in `palette`.
function findUnpalettedChars(rows, palette) {
  const missing = new Set();
  for (const line of rows) {
    for (const ch of line) {
      if (ch !== '.' && !(ch in palette)) missing.add(ch);
    }
  }
  return [...missing];
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// Runs the standard set of checks (dimensions + palette coverage) against
// every frame of every animation for one animated entity (Warrior, Mage,
// Slime, Mushroom — all share the { width, height, palette, frames } shape).
function describeAnimatedEntity(entityKey, art) {
  describe(entityKey, () => {
    it('declares at least one animation', () => {
      expect(Object.keys(art.frames).length).toBeGreaterThan(0);
    });

    Object.keys(art.frames).forEach((animName) => {
      describe(`${animName} animation`, () => {
        const frames = art.frames[animName];

        it('has at least one frame', () => {
          expect(frames.length).toBeGreaterThan(0);
        });

        frames.forEach((rows, frameIndex) => {
          it(`frame ${frameIndex} matches the declared ${art.width}x${art.height} dimensions`, () => {
            expect(() => validateFrame(rows, art.width, art.height, entityKey, animName, frameIndex)).not.toThrow();
          });

          it(`frame ${frameIndex} uses only characters present in the palette`, () => {
            expect(findUnpalettedChars(rows, art.palette)).toEqual([]);
          });
        });
      });
    });
  });
}

describeAnimatedEntity('warrior', Art.Warrior);
describeAnimatedEntity('mage', Art.Mage);
describeAnimatedEntity('slime', Art.Slime);
describeAnimatedEntity('mushroom', Art.Mushroom);

describe('projectile (static texture, not an animation)', () => {
  it('its single frame matches the declared dimensions', () => {
    expect(() => validateFrame(Art.Projectile.frame, Art.Projectile.width, Art.Projectile.height, 'projectile', 'static', 0)).not.toThrow();
  });

  it('uses only characters present in its palette', () => {
    expect(findUnpalettedChars(Art.Projectile.frame, Art.Projectile.palette)).toEqual([]);
  });
});

describe('platform tile colors (procedural texture, no frame data)', () => {
  it('defines body, top, and shade as valid hex colors', () => {
    expect(Art.PlatformTileColors.body).toMatch(HEX_COLOR);
    expect(Art.PlatformTileColors.top).toMatch(HEX_COLOR);
    expect(Art.PlatformTileColors.shade).toMatch(HEX_COLOR);
  });
});

describe('cross-entity shape consistency', () => {
  it('every animated entity\'s every frame row has a consistent length equal to its declared width', () => {
    // Redundant with the per-frame checks above by design — this is a single
    // assertion that fails loudly and names the entity if a future edit adds
    // a new entity to this list without an animation loop wired up above.
    [
      ['warrior', Art.Warrior],
      ['mage', Art.Mage],
      ['slime', Art.Slime],
      ['mushroom', Art.Mushroom],
    ].forEach(([entityKey, art]) => {
      Object.entries(art.frames).forEach(([animName, frames]) => {
        frames.forEach((rows) => {
          rows.forEach((line) => {
            expect(line.length, `${entityKey}/${animName}`).toBe(art.width);
          });
        });
      });
    });
  });
});
