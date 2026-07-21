window.G = window.G || {};

(function () {
  class ClassSelectScene extends Phaser.Scene {
    constructor() {
      super('ClassSelectScene');
    }

    create() {
      const { width, height } = this.scale;

      this.add.rectangle(0, 0, width, height, 0x1b1032).setOrigin(0, 0);
      this.add
        .text(width / 2, 80, 'mini-maple', {
          fontFamily: 'monospace',
          fontSize: '32px',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      this.add
        .text(width / 2, 120, 'Choose Your Class', {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#bbbbbb',
        })
        .setOrigin(0.5);

      this.createOption(width / 2 - 150, height / 2, 'warrior', '1: Warrior (melee)');
      this.createOption(width / 2 + 150, height / 2, 'mage', '2: Mage (ranged)');

      this.add
        .text(width / 2, height - 60, 'Move: Arrows / A-D   Jump: Up / W / Space   Attack: X', {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#bbbbbb',
        })
        .setOrigin(0.5);

      this.input.keyboard.once('keydown-ONE', () => this.startGame('warrior'));
      this.input.keyboard.once('keydown-TWO', () => this.startGame('mage'));
    }

    createOption(x, y, textureKey, label) {
      const portrait = this.add
        .sprite(x, y, textureKey, 0)
        .setScale(6)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(x, y + 90, label, {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#ffffff',
        })
        .setOrigin(0.5);

      portrait.on('pointerdown', () => this.startGame(textureKey));
    }

    startGame(playerClass) {
      this.scene.start('GameScene', { playerClass });
    }
  }

  G.ClassSelectScene = ClassSelectScene;
})();
