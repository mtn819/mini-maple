window.G = window.G || {};

(function () {
  const STATE = G.EnemyLogic.STATE;

  class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey, stats) {
      super(scene, x, y, textureKey);
      scene.add.existing(this);
      scene.physics.add.existing(this);

      this.setScale(G.Constants.SPRITE_SCALE);
      this.setCollideWorldBounds(true);

      this.textureKey = textureKey;
      this.maxHp = stats.maxHp;
      this.hp = stats.maxHp;
      this.contactDamage = stats.contactDamage;
      this.xpReward = stats.xpReward;
      this.moveSpeed = stats.moveSpeed;
      this.aggroRange = stats.aggroRange;

      const patrolDistance = stats.patrolDistance || 80;
      this.patrolMinX = x - patrolDistance;
      this.patrolMaxX = x + patrolDistance;
      this.patrolDir = 1;

      this.state = STATE.PATROL;

      this.anims.play(`${textureKey}-idle`, true);
    }

    // No pathfinding — pure distance/range checks against the player each tick.
    update(time, player) {
      if (this.state === STATE.DEAD) return;

      const distance = Math.abs(player.x - this.x);
      this.state = G.EnemyLogic.nextState({
        state: this.state,
        distance,
        aggroRange: this.aggroRange,
        playerHp: player.hp,
      });

      if (this.state === STATE.CHASE) {
        const dir = G.EnemyLogic.computeChaseDirection(player.x, this.x);
        this.setVelocityX(dir * this.moveSpeed);
        this.setFlipX(dir < 0);
      } else {
        this.patrolDir = G.EnemyLogic.resolvePatrolDir({
          x: this.x,
          patrolMinX: this.patrolMinX,
          patrolMaxX: this.patrolMaxX,
          patrolDir: this.patrolDir,
        });
        this.setVelocityX(this.patrolDir * this.moveSpeed * 0.6);
        this.setFlipX(this.patrolDir < 0);
      }

      const anim = G.EnemyLogic.nextAnimation(this.body.velocity.x);
      this.anims.play(`${this.textureKey}-${anim}`, true);
    }

    takeDamage(amount) {
      if (this.state === STATE.DEAD) return;

      const result = G.EnemyLogic.applyDamage({ hp: this.hp, amount });
      this.hp = result.hp;

      this.setTintFill(0xffffff);
      this.scene.time.delayedCall(80, () => {
        if (this.active) this.clearTint();
      });

      if (result.died) {
        this.die();
      }
    }

    die() {
      this.state = STATE.DEAD;
      this.setVelocity(0, 0);
      this.body.enable = false;
      this.emit('died', this.xpReward);

      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        scale: this.scale * 0.5,
        duration: 250,
        onComplete: () => this.destroy(),
      });
    }
  }

  Enemy.STATE = STATE;
  G.Enemy = Enemy;
})();
