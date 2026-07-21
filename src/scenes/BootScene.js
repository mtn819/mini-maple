window.G = window.G || {};

(function () {
  class BootScene extends Phaser.Scene {
    constructor() {
      super('BootScene');
    }

    create() {
      const PA = G.PixelArt;
      const AB = G.AnimationBuilder;

      const buildCharacter = (key, art, animConfig) => {
        const ranges = PA.buildAnimatedSpriteSheet(this, key, art.frames, art.width, art.height, art.palette);
        AB.registerAnimations(this, key, ranges, animConfig);
      };

      buildCharacter('warrior', G.Art.Warrior, {
        idle: { frameRate: 2, repeat: -1 },
        walk: { frameRate: 6, repeat: -1 },
        attack: { frameRate: 10, repeat: 0 },
      });

      buildCharacter('mage', G.Art.Mage, {
        idle: { frameRate: 2, repeat: -1 },
        walk: { frameRate: 6, repeat: -1 },
        attack: { frameRate: 10, repeat: 0 },
      });

      buildCharacter('slime', G.Art.Slime, {
        idle: { frameRate: 3, repeat: -1 },
        walk: { frameRate: 6, repeat: -1 },
      });

      buildCharacter('mushroom', G.Art.Mushroom, {
        idle: { frameRate: 3, repeat: -1 },
        walk: { frameRate: 6, repeat: -1 },
      });

      PA.buildStaticTexture(
        this,
        'projectile',
        G.Art.Projectile.frame,
        G.Art.Projectile.palette,
        G.Art.Projectile.width,
        G.Art.Projectile.height
      );

      PA.buildTileTexture(this, 'platform', 32, 32, G.Art.PlatformTileColors);

      this.scene.start('ClassSelectScene');
    }
  }

  G.BootScene = BootScene;
})();
