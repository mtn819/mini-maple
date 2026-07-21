window.G = window.G || {};

(function () {
  const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: G.Constants.GRAVITY_Y },
        debug: false,
      },
    },
    scene: [G.BootScene, G.ClassSelectScene, G.GameScene, G.HUDScene],
  };

  new Phaser.Game(config);
})();
