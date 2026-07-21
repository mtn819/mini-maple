window.G = window.G || {};
G.Art = G.Art || {};

(function () {
  const R = (...cells) => cells.join('');

  // ---------------------------------------------------------------------
  // Slime — 8 wide x 8 tall. Both "idle" and "walk" animations are built
  // from the same two squash/stretch frames (a slime doesn't really have a
  // distinct standing pose) at different frame rates.
  // ---------------------------------------------------------------------
  const SLIME_PALETTE = {
    G: '#4caf50',
    g: '#2e7d32',
    O: '#1a1a1a',
  };

  const SLIME_MOVE_1 = [
    R('.', '.', 'G', 'G', 'G', 'G', '.', '.'),
    R('.', 'G', 'G', 'G', 'G', 'G', 'G', '.'),
    R('G', 'G', 'O', 'G', 'G', 'O', 'G', 'G'),
    R('G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'),
    R('G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'),
    R('G', 'g', 'g', 'g', 'g', 'g', 'g', 'G'),
    R('.', 'g', 'g', 'g', 'g', 'g', 'g', '.'),
    R('.', '.', 'g', 'g', 'g', 'g', '.', '.'),
  ];

  const SLIME_MOVE_2 = [
    R('.', '.', '.', '.', '.', '.', '.', '.'),
    R('.', 'G', 'G', 'G', 'G', 'G', 'G', '.'),
    R('G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'),
    R('G', 'O', 'G', 'G', 'G', 'O', 'G', 'G'),
    R('G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'),
    R('G', 'g', 'g', 'g', 'g', 'g', 'g', 'G'),
    R('g', 'g', 'g', 'g', 'g', 'g', 'g', 'g'),
    R('.', 'g', 'g', 'g', 'g', 'g', 'g', '.'),
  ];

  G.Art.Slime = {
    width: 8,
    height: 8,
    palette: SLIME_PALETTE,
    frames: {
      idle: [SLIME_MOVE_1, SLIME_MOVE_2],
      walk: [SLIME_MOVE_1, SLIME_MOVE_2],
    },
  };

  // ---------------------------------------------------------------------
  // Mushroom — 8 wide x 9 tall.
  // ---------------------------------------------------------------------
  const MUSHROOM_PALETTE = {
    M: '#d9534f',
    m: '#a83232',
    S: '#ffffff',
    T: '#e0c097',
    O: '#1a1a1a',
  };

  const MUSHROOM_MOVE_1 = [
    R('.', '.', 'M', 'M', 'M', 'M', '.', '.'),
    R('.', 'M', 'M', 'S', 'M', 'S', 'M', '.'),
    R('M', 'M', 'M', 'M', 'M', 'M', 'M', 'M'),
    R('m', 'M', 'M', 'M', 'M', 'M', 'M', 'm'),
    R('.', 'T', 'O', 'T', 'T', 'O', 'T', '.'),
    R('.', 'T', 'T', 'T', 'T', 'T', 'T', '.'),
    R('.', 'T', 'T', 'T', 'T', 'T', 'T', '.'),
    R('.', 'T', 'T', '.', '.', 'T', 'T', '.'),
    R('.', '.', 'T', '.', '.', 'T', '.', '.'),
  ];

  const MUSHROOM_MOVE_2 = [
    R('.', '.', 'M', 'M', 'M', 'M', '.', '.'),
    R('.', 'M', 'M', 'S', 'M', 'S', 'M', '.'),
    R('M', 'M', 'M', 'M', 'M', 'M', 'M', 'M'),
    R('m', 'M', 'M', 'M', 'M', 'M', 'M', 'm'),
    R('.', 'T', 'O', 'T', 'T', 'O', 'T', '.'),
    R('.', 'T', 'T', 'T', 'T', 'T', 'T', '.'),
    R('.', 'T', 'T', 'T', 'T', 'T', 'T', '.'),
    R('T', 'T', '.', '.', '.', '.', 'T', 'T'),
    R('T', '.', '.', '.', '.', '.', '.', 'T'),
  ];

  G.Art.Mushroom = {
    width: 8,
    height: 9,
    palette: MUSHROOM_PALETTE,
    frames: {
      idle: [MUSHROOM_MOVE_1, MUSHROOM_MOVE_2],
      walk: [MUSHROOM_MOVE_1, MUSHROOM_MOVE_2],
    },
  };
})();
