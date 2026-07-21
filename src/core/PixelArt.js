window.G = window.G || {};

// Converts hand-authored pixel-grid data (arrays of same-length strings, one
// character per pixel, indexing into a per-sprite palette) into Phaser
// textures/spritesheets, entirely in-memory via canvas. No external image
// files are ever loaded.
//
// drawFrame/validateFrame/computeFrameLayout are pure (no canvas/Phaser
// dependency) and unit tested directly. buildAnimatedSpriteSheet's own
// canvas-drawing body, buildStaticTexture, and buildTileTexture are marked
// `/* v8 ignore */`: jsdom's HTMLCanvasElement.getContext('2d') returns null
// without the optional native `canvas` package (which needs a compiler
// toolchain not available in this project's test environment), so those
// bodies cannot execute under the test runner at all — they're verified by
// manual playtest instead (see CLAUDE.md's "Running / testing changes").
G.PixelArt = (function () {
  function drawFrame(ctx, rows, palette, destX, destY, entityKey, animName, frameIndex) {
    for (let row = 0; row < rows.length; row++) {
      const line = rows[row];
      for (let col = 0; col < line.length; col++) {
        const ch = line[col];
        if (ch === '.') continue;

        const color = palette[ch];
        if (!color) {
          throw new Error(
            `PixelArt: unknown palette key "${ch}" in ${entityKey}/${animName} frame ${frameIndex}, row ${row}`
          );
        }

        ctx.fillStyle = color;
        ctx.fillRect(destX + col, destY + row, 1, 1);
      }
    }
  }

  function validateFrame(rows, expectedWidth, expectedHeight, entityKey, animName, frameIndex) {
    if (rows.length !== expectedHeight) {
      throw new Error(
        `PixelArt: ${entityKey}/${animName} frame ${frameIndex} has ${rows.length} rows, expected ${expectedHeight}`
      );
    }
    rows.forEach((line, row) => {
      if (line.length !== expectedWidth) {
        throw new Error(
          `PixelArt: ${entityKey}/${animName} frame ${frameIndex} row ${row} has length ${line.length}, expected ${expectedWidth}`
        );
      }
    });
  }

  // framesByAnim: { idle: [rows[], rows[]], walk: [...], attack: [...] }
  // Returns { flat, ranges }: `flat` is every frame across all anims in a
  // single array (in Object.keys(framesByAnim) insertion order — idle, then
  // walk, then attack, matching how the caller iterates); `ranges` maps each
  // anim name to its {start,end} slice of `flat`, e.g.
  // { idle: {start:0,end:1}, walk: {start:2,end:4} }. An anim with zero
  // frames produces an inverted range ({start:N, end:N-1}) — an unusual but
  // real, deliberately-unguarded contract detail. Throws (via validateFrame)
  // the moment any frame's dimensions don't match, before any canvas work
  // happens.
  function computeFrameLayout(framesByAnim, frameWidth, frameHeight, entityKey) {
    const flat = [];
    const ranges = {};

    Object.keys(framesByAnim).forEach((animName) => {
      const start = flat.length;
      framesByAnim[animName].forEach((rows, i) => {
        validateFrame(rows, frameWidth, frameHeight, entityKey, animName, i);
        flat.push(rows);
      });
      ranges[animName] = { start, end: flat.length - 1 };
    });

    return { flat, ranges };
  }

  // Returns the frame-index range per animation name computed by
  // computeFrameLayout, after rasterizing every frame onto a real canvas and
  // registering it as a Phaser spritesheet texture. The whole function is
  // v8-ignored, not just its canvas-touching body: computeFrameLayout (the
  // pure part) is tested directly and exhaustively elsewhere, so this
  // function is never invoked on its own in tests, which would otherwise
  // leave it flagged as an "uncovered function" despite its one meaningful
  // line of logic being fully covered via computeFrameLayout's own tests.
  /* v8 ignore start */
  function buildAnimatedSpriteSheet(scene, key, framesByAnim, frameWidth, frameHeight, palette) {
    const { flat, ranges } = computeFrameLayout(framesByAnim, frameWidth, frameHeight, key);

    const canvas = document.createElement('canvas');
    canvas.width = frameWidth * flat.length;
    canvas.height = frameHeight;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    flat.forEach((rows, index) => {
      drawFrame(ctx, rows, palette, index * frameWidth, 0, key, 'combined', index);
    });

    scene.textures.addSpriteSheet(key, canvas, { frameWidth, frameHeight });

    return ranges;
  }
  /* v8 ignore stop */

  /* v8 ignore start */
  function buildStaticTexture(scene, key, rows, palette, width, height) {
    validateFrame(rows, width, height, key, 'static', 0);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    drawFrame(ctx, rows, palette, 0, 0, key, 'static', 0);
    scene.textures.addCanvas(key, canvas);
  }
  /* v8 ignore stop */

  /* v8 ignore start */
  // A small deterministic dirt/grass tile, generated procedurally rather than
  // hand-authored pixel-by-pixel since it's a repeating background tile, not
  // a character/creature sprite.
  function buildTileTexture(scene, key, width, height, colors) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = colors.body;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = colors.top;
    ctx.fillRect(0, 0, width, 3);

    ctx.fillStyle = colors.shade;
    for (let y = 3; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if ((x * 7 + y * 13) % 11 === 0) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    scene.textures.addCanvas(key, canvas);
  }
  /* v8 ignore stop */

  return {
    drawFrame,
    validateFrame,
    computeFrameLayout,
    buildAnimatedSpriteSheet,
    buildStaticTexture,
    buildTileTexture,
  };
})();
