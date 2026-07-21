window.G = window.G || {};

(function () {
  const STATE = {
    PATROL: 'PATROL',
    CHASE: 'CHASE',
    DEAD: 'DEAD',
  };

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

      if (this.state === STATE.PATROL && distance < this.aggroRange && player.hp > 0) {
        this.state = STATE.CHASE;
      } else if (this.state === STATE.CHASE && (distance > this.aggroRange * 1.5 || player.hp <= 0)) {
        this.state = STATE.PATROL;
      }

      if (this.state === STATE.CHASE) {
        const dir = player.x < this.x ? -1 : 1;
        this.setVelocityX(dir * this.moveSpeed);
        this.setFlipX(dir < 0);
      } else {
        if (this.x <= this.patrolMinX) this.patrolDir = 1;
        if (this.x >= this.patrolMaxX) this.patrolDir = -1;
        this.setVelocityX(this.patrolDir * this.moveSpeed * 0.6);
        this.setFlipX(this.patrolDir < 0);
      }

      const moving = Math.abs(this.body.velocity.x) > 5;
      this.anims.play(`${this.textureKey}-${moving ? 'walk' : 'idle'}`, true);
    }

    takeDamage(amount) {
      if (this.state === STATE.DEAD) return;

      this.hp = Math.max(0, this.hp - amount);

      this.setTintFill(0xffffff);
      this.scene.time.delayedCall(80, () => {
        if (this.active) this.clearTint();
      });

      if (this.hp <= 0) {
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
