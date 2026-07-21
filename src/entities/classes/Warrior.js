window.G = window.G || {};

(function () {
  class Warrior extends G.Player {
    constructor(scene, x, y) {
      super(scene, x, y, 'warrior', {
        moveSpeed: 160,
        jumpVelocity: -330,
        maxHp: 120,
        attackDamage: 18,
        attackCooldown: 450,
      });

      this.hitEnemiesThisSwing = new Set();

      this.meleeHitbox = scene.add.zone(x, y, 20, 24);
      scene.physics.add.existing(this.meleeHitbox);
      this.meleeHitbox.body.setAllowGravity(false);
      this.meleeHitbox.body.enable = false;
    }

    performAttack() {
      this.isAttacking = true;
      this.setVelocityX(0);
      this.hitEnemiesThisSwing.clear();
      this.anims.play(`${this.textureKey}-attack`, true);

      this.positionHitbox();
      this.meleeHitbox.body.enable = true;

      this.once(`animationcomplete-${this.textureKey}-attack`, () => {
        this.isAttacking = false;
        this.meleeHitbox.body.enable = false;
      });
    }

    positionHitbox() {
      const offset = G.CombatLogic.scaleByDirection(this.facing, 18);
      this.meleeHitbox.setPosition(this.x + offset, this.y);
    }

    preUpdate(time, delta) {
      super.preUpdate(time, delta);
      if (this.isAttacking && this.meleeHitbox.body.enable) {
        this.positionHitbox();
      }
    }
  }

  G.Warrior = Warrior;
})();
