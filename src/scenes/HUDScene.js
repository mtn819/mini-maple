window.G = window.G || {};

(function () {
  const BAR_WIDTH = 200;

  class HUDScene extends Phaser.Scene {
    constructor() {
      super('HUDScene');
    }

    create(data) {
      this.player = data.player;

      this.add.text(16, 12, 'HP', { fontFamily: 'monospace', fontSize: '12px', color: '#ffffff' });
      this.add.rectangle(50, 18, BAR_WIDTH, 14, 0x333333).setOrigin(0, 0.5);
      this.hpBarFill = this.add.rectangle(50, 18, BAR_WIDTH, 14, 0xe53935).setOrigin(0, 0.5);

      this.add.text(16, 34, 'XP', { fontFamily: 'monospace', fontSize: '12px', color: '#ffffff' });
      this.add.rectangle(50, 40, BAR_WIDTH, 8, 0x333333).setOrigin(0, 0.5);
      this.xpBarFill = this.add.rectangle(50, 40, 0, 8, 0x42a5f5).setOrigin(0, 0.5);

      this.levelText = this.add.text(16, 54, 'Lv. 1', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
      });

      this.levelUpText = this.add
        .text(this.scale.width / 2, 100, '', {
          fontFamily: 'monospace',
          fontSize: '24px',
          color: '#ffe082',
        })
        .setOrigin(0.5)
        .setAlpha(0);

      this.refreshHp(this.player.hp, this.player.maxHp);
      this.refreshXp(this.player.xp, G.Leveling.xpToNextLevel(this.player.level));
      this.levelText.setText(`Lv. ${this.player.level}`);

      this.player.on('hpchanged', (hp, maxHp) => this.refreshHp(hp, maxHp));
      this.player.on('xpchanged', (xp, xpNeeded) => this.refreshXp(xp, xpNeeded));
      this.player.on('levelup', (level) => this.onLevelUp(level));
    }

    refreshHp(hp, maxHp) {
      this.hpBarFill.width = BAR_WIDTH * Phaser.Math.Clamp(hp / maxHp, 0, 1);
    }

    refreshXp(xp, xpNeeded) {
      this.xpBarFill.width = BAR_WIDTH * Phaser.Math.Clamp(xp / xpNeeded, 0, 1);
    }

    onLevelUp(level) {
      this.levelText.setText(`Lv. ${level}`);
      this.levelUpText.setText('Level Up!').setAlpha(1);
      this.tweens.add({
        targets: this.levelUpText,
        alpha: 0,
        duration: 1200,
        delay: 400,
      });
    }
  }

  G.HUDScene = HUDScene;
})();
