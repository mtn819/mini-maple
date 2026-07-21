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
        const move = G.PlayerLogic.resolveMovement({
          left: input.isLeftDown(),
          right: input.isRightDown(),
          moveSpeed: this.moveSpeed,
          currentFacing: this.facing,
        });
        this.setVelocityX(move.vx);
        this.facing = move.facing;
        this.setFlipX(move.flipX);

        if (input.isJumpJustDown() && onGround) {
          this.setVelocityY(this.jumpVelocity);
        }
      }

      if (input.isAttackJustDown() && G.PlayerLogic.isAttackReady(time, this.lastAttackTime, this.attackCooldown)) {
        this.lastAttackTime = time;
        this.performAttack(time);
      }

      this.updateAnimation(onGround);
    }

    updateAnimation(onGround) {
      const anim = G.PlayerLogic.nextAnimation({
        isAttacking: this.isAttacking,
        onGround,
        vx: this.body.velocity.x,
      });
      if (anim) this.anims.play(`${this.textureKey}-${anim}`, true);
    }

    // Overridden by Warrior/Mage.
    performAttack(time) {}

    takeDamage(amount, time) {
      const result = G.PlayerLogic.applyDamage({
        hp: this.hp,
        invulnerableUntil: this.invulnerableUntil,
        time,
        amount,
        hurtInvulnMs: G.Constants.HURT_INVULN_MS,
      });
      if (!result.applied) return;

      this.hp = result.hp;
      this.invulnerableUntil = result.invulnerableUntil;
      this.emit('hpchanged', this.hp, this.maxHp);

      this.setTintFill(0xff5555);
      this.scene.time.delayedCall(120, () => {
        if (this.active) this.clearTint();
      });

      if (result.died) {
        this.emit('died');
      }
    }

    gainXP(amount) {
      G.Leveling.gainXP(this, amount);
    }
  }

  G.Player = Player;
})();
