window.G = window.G || {};
G.Art = G.Art || {};

(function () {
  const R = (...cells) => cells.join('');

  const PROJECTILE_PALETTE = {
    F: '#4fc3f7',
    W: '#ffffff',
  };

  const PROJECTILE_FRAME = [
    R('.', '.', 'F', 'F', '.', '.'),
    R('.', 'F', 'W', 'W', 'F', '.'),
    R('F', 'W', 'W', 'W', 'W', 'F'),
    R('F', 'W', 'W', 'W', 'W', 'F'),
    R('.', 'F', 'W', 'W', 'F', '.'),
    R('.', '.', 'F', 'F', '.', '.'),
  ];

  G.Art.Projectile = {
    width: 6,
    height: 6,
    palette: PROJECTILE_PALETTE,
    frame: PROJECTILE_FRAME,
  };

  G.Art.PlatformTileColors = {
    top: '#4caf50',
    body: '#6b4423',
    shade: '#4a2f18',
  };
})();
