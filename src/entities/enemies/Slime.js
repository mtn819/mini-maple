window.G = window.G || {};

(function () {
  class Slime extends G.Enemy {
    constructor(scene, x, y) {
      super(scene, x, y, 'slime', {
        maxHp: 20,
        contactDamage: 8,
        xpReward: 10,
        moveSpeed: 40,
        aggroRange: 140,
        patrolDistance: 60,
      });
    }
  }

  G.Slime = Slime;
})();
