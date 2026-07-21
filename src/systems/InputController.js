window.G = window.G || {};

(function () {
  class InputController {
    constructor(scene) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.keys = scene.input.keyboard.addKeys({
        a: Phaser.Input.Keyboard.KeyCodes.A,
        d: Phaser.Input.Keyboard.KeyCodes.D,
        w: Phaser.Input.Keyboard.KeyCodes.W,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        x: Phaser.Input.Keyboard.KeyCodes.X,
        j: Phaser.Input.Keyboard.KeyCodes.J,
      });
    }

    isLeftDown() {
      return this.cursors.left.isDown || this.keys.a.isDown;
    }

    isRightDown() {
      return this.cursors.right.isDown || this.keys.d.isDown;
    }

    isJumpJustDown() {
      return (
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.keys.w) ||
        Phaser.Input.Keyboard.JustDown(this.keys.space)
      );
    }

    isAttackJustDown() {
      return (
        Phaser.Input.Keyboard.JustDown(this.keys.x) ||
        Phaser.Input.Keyboard.JustDown(this.keys.j)
      );
    }
  }

  G.InputController = InputController;
})();
