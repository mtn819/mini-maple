// A minimal fake of the tiny slice of Phaser 3's global API that
// InputController.js touches directly (Phaser.Input.Keyboard.KeyCodes and
// .JustDown). Not a general Phaser mock — nothing else in this project's
// tested code touches Phaser globals directly, so nothing else is stubbed.
export function installPhaserStub() {
  window.Phaser = {
    Input: {
      Keyboard: {
        KeyCodes: { A: 'A', D: 'D', W: 'W', SPACE: 'SPACE', X: 'X', J: 'J' },
        // Mirrors real Phaser semantics: true the first time it's checked
        // after a key's `justDown` flag is set, then false again until the
        // flag is set once more — i.e. edge-triggered, consumed on read.
        JustDown(key) {
          if (key && key.justDown) {
            key.justDown = false;
            return true;
          }
          return false;
        },
      },
    },
  };
}

export function makeFakeKey(overrides = {}) {
  return { isDown: false, justDown: false, ...overrides };
}
