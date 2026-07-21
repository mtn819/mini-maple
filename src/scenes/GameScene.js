window.G = window.G || {};

(function () {
  class GameScene extends Phaser.Scene {
    constructor() {
      super('GameScene');
    }

    create(data) {
      const level = G.Level1;

      this.physics.world.setBounds(0, 0, level.width, level.height);
      this.cameras.main.setBounds(0, 0, level.width, level.height);
      this.add.rectangle(0, 0, level.width, level.height, 0x1b1032).setOrigin(0, 0).setScrollFactor(0.2);

      this.platforms = this.physics.add.staticGroup();
      level.platforms.forEach((p) => {
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const tile = this.platforms.create(cx, cy, 'platform');
        tile.setDisplaySize(p.width, p.height);
        tile.refreshBody();
      });

      const PlayerClass = { warrior: G.Warrior, mage: G.Mage }[data.playerClass] || G.Warrior;
      this.player = new PlayerClass(this, level.playerSpawn.x, level.playerSpawn.y);
      this.inputController = new G.InputController(this);

      this.enemiesGroup = this.physics.add.group();
      this.enemies = level.enemies.map((spec) => {
        const EnemyClass = { slime: G.Slime, mushroom: G.Mushroom }[spec.type];
        const enemy = new EnemyClass(this, spec.x, spec.y);
        this.enemiesGroup.add(enemy);
        enemy.on('died', (xpReward) => this.player.gainXP(xpReward));
        return enemy;
      });

      this.projectilesGroup = this.physics.add.group();

      this.physics.add.collider(this.player, this.platforms);
      this.physics.add.collider(this.enemiesGroup, this.platforms);
      this.physics.add.collider(this.projectilesGroup, this.platforms, (projectile) => projectile.destroy());

      this.physics.add.overlap(this.player, this.enemiesGroup, (player, enemy) => this.onPlayerEnemyContact(enemy));

      if (this.player.meleeHitbox) {
        this.physics.add.overlap(this.player.meleeHitbox, this.enemiesGroup, (hitbox, enemy) => this.onMeleeHit(enemy));
      }

      this.physics.add.overlap(this.projectilesGroup, this.enemiesGroup, (projectile, enemy) =>
        this.onProjectileHit(projectile, enemy)
      );

      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

      this.scene.launch('HUDScene', { player: this.player });

      this.player.on('died', () => this.handlePlayerDeath());
    }

    onPlayerEnemyContact(enemy) {
      const player = this.player;
      const time = this.time.now;
      if (enemy.state === G.Enemy.STATE.DEAD || player.hp <= 0 || time < player.invulnerableUntil) return;

      player.takeDamage(enemy.contactDamage, time);

      const knockDir = player.x < enemy.x ? -1 : 1;
      player.setVelocity(knockDir * 220, -200);
    }

    onMeleeHit(enemy) {
      const player = this.player;
      if (enemy.state === G.Enemy.STATE.DEAD || player.hitEnemiesThisSwing.has(enemy)) return;

      player.hitEnemiesThisSwing.add(enemy);
      enemy.takeDamage(player.attackDamage);
    }

    onProjectileHit(projectile, enemy) {
      if (enemy.state === G.Enemy.STATE.DEAD) return;

      enemy.takeDamage(projectile.damage);
      projectile.destroy();
    }

    handlePlayerDeath() {
      this.player.setVelocity(0, 0);
      this.time.delayedCall(1000, () => {
        this.scene.stop('HUDScene');
        this.scene.start('ClassSelectScene');
      });
    }

    update(time) {
      if (this.player && this.player.hp > 0) {
        this.player.update(time, this.inputController);
      }
      this.enemies.forEach((enemy) => {
        if (enemy.active) enemy.update(time, this.player);
      });
    }
  }

  G.GameScene = GameScene;
})();
