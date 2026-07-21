window.G = window.G || {};

// Data only — platform/enemy rects are top-left {x, y, width, height};
// GameScene converts to center points when placing sprites.
G.Level1 = {
  width: 3000,
  height: 600,
  playerSpawn: { x: 100, y: 400 },
  platforms: [
    { x: 0, y: 520, width: 3000, height: 40 },
    { x: 500, y: 420, width: 200, height: 24 },
    { x: 900, y: 360, width: 180, height: 24 },
    { x: 1300, y: 440, width: 220, height: 24 },
    { x: 1700, y: 340, width: 200, height: 24 },
    { x: 2100, y: 420, width: 220, height: 24 },
    { x: 2500, y: 360, width: 200, height: 24 },
  ],
  enemies: [
    { type: 'slime', x: 400, y: 480 },
    { type: 'slime', x: 700, y: 480 },
    { type: 'mushroom', x: 950, y: 320 },
    { type: 'slime', x: 1350, y: 400 },
    { type: 'mushroom', x: 1750, y: 300 },
    { type: 'slime', x: 2150, y: 380 },
    { type: 'mushroom', x: 2550, y: 320 },
    { type: 'slime', x: 2800, y: 480 },
  ],
};
