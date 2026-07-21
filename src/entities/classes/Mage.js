window.G = window.G || {};

(function () {
  class Mage extends G.Player {
    constructor(scene, x, y) {
      super(scene, x, y, 'mage', {
        moveSpeed: 150,
        jumpVelocity: -320,
        maxHp: 80,
        attackDamage: 12,
        attackCooldown: 550,
      });

      this.projectileSpeed = 300;
    }

    performAttack() {
      this.isAttacking = true;
      this.setVelocityX(0);
      this.anims.play(`${this.textureKey}-attack`, true);

      const offset = 16 * this.facing;
      const projectile = new G.Projectile(
        this.scene,
        this.x + offset,
        this.y,
        this.facing,
        this.projectileSpeed,
        this.attackDamage
      );
      this.scene.projectilesGroup.add(projectile);

      this.once(`animationcomplete-${this.textureKey}-attack`, () => {
        this.isAttacking = false;
      });
    }
  }

  G.Mage = Mage;
})();
