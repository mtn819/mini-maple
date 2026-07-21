window.G = window.G || {};

(function () {
  class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey, stats) {
      super(scene, x, y, textureKey);
      scene.add.existing(this);
      scene.physics.add.existing(this);

      this.setScale(G.Constants.SPRITE_SCALE);
      this.setCollideWorldBounds(true);
      this.body.setSize(this.width * 0.7, this.height * 0.9, true);

      this.textureKey = textureKey;
      this.moveSpeed = stats.moveSpeed;
      this.jumpVelocity = stats.jumpVelocity;
      this.maxHp = stats.maxHp;
      this.hp = stats.maxHp;
      this.attackDamage = stats.attackDamage;
      this.attackCooldown = stats.attackCooldown;

      this.level = 1;
      this.xp = 0;
      this.facing = 1;
      this.lastAttackTime = -Infinity;
      this.invulnerableUntil = 0;
      this.isAttacking = false;

      this.anims.play(`${textureKey}-idle`, true);
    }

    update(time, input) {
      if (this.hp <= 0) return;

      const onGround = this.body.blocked.down || this.body.touching.down;

      if (!this.isAttacking) {
        if (input.isLeftDown()) {
          this.setVelocityX(-this.moveSpeed);
          this.facing = -1;
          this.setFlipX(true);
        } else if (input.isRightDown()) {
          this.setVelocityX(this.moveSpeed);
          this.facing = 1;
          this.setFlipX(false);
        } else {
          this.setVelocityX(0);
        }

        if (input.isJumpJustDown() && onGround) {
          this.setVelocityY(this.jumpVelocity);
        }
      }

      if (input.isAttackJustDown() && time > this.lastAttackTime + this.attackCooldown) {
        this.lastAttackTime = time;
        this.performAttack(time);
      }

      this.updateAnimation(onGround);
    }

    updateAnimation(onGround) {
      if (this.isAttacking || !onGround) return;

      if (Math.abs(this.body.velocity.x) > 5) {
        this.anims.play(`${this.textureKey}-walk`, true);
      } else {
        this.anims.play(`${this.textureKey}-idle`, true);
      }
    }

    // Overridden by Warrior/Mage.
    performAttack(time) {}

    takeDamage(amount, time) {
      if (this.hp <= 0 || time < this.invulnerableUntil) return;

      this.hp = Math.max(0, this.hp - amount);
      this.invulnerableUntil = time + G.Constants.HURT_INVULN_MS;
      this.emit('hpchanged', this.hp, this.maxHp);

      this.setTintFill(0xff5555);
      this.scene.time.delayedCall(120, () => {
        if (this.active) this.clearTint();
      });

      if (this.hp <= 0) {
        this.emit('died');
      }
    }

    gainXP(amount) {
      G.Leveling.gainXP(this, amount);
    }
  }

  G.Player = Player;
})();
