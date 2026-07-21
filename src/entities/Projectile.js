window.G = window.G || {};

(function () {
  class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, direction, speed, damage) {
      super(scene, x, y, 'projectile');
      scene.add.existing(this);
      scene.physics.add.existing(this);

      this.setScale(G.Constants.SPRITE_SCALE);
      this.damage = damage;
      this.body.setAllowGravity(false);
      this.setVelocityX(G.CombatLogic.scaleByDirection(direction, speed));

      scene.time.delayedCall(800, () => {
        if (this.active) this.destroy();
      });
    }
  }

  G.Projectile = Projectile;
})();
