window.G = window.G || {};

// Converts hand-authored pixel-grid data (arrays of same-length strings, one
// character per pixel, indexing into a per-sprite palette) into Phaser
// textures/spritesheets, entirely in-memory via canvas. No external image
// files are ever loaded.
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
  // Returns a frame-index range per animation name, e.g. { idle: {start:0,end:1}, walk: {...} }.
  function buildAnimatedSpriteSheet(scene, key, framesByAnim, frameWidth, frameHeight, palette) {
    const flat = [];
    const ranges = {};

    Object.keys(framesByAnim).forEach((animName) => {
      const start = flat.length;
      framesByAnim[animName].forEach((rows, i) => {
        validateFrame(rows, frameWidth, frameHeight, key, animName, i);
        flat.push(rows);
      });
      ranges[animName] = { start, end: flat.length - 1 };
    });

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

  return { drawFrame, validateFrame, buildAnimatedSpriteSheet, buildStaticTexture, buildTileTexture };
})();
