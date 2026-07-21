window.G = window.G || {};

(function () {
  class Mushroom extends G.Enemy {
    constructor(scene, x, y) {
      super(scene, x, y, 'mushroom', {
        maxHp: 40,
        contactDamage: 14,
        xpReward: 25,
        moveSpeed: 55,
        aggroRange: 170,
        patrolDistance: 70,
      });
    }
  }

  G.Mushroom = Mushroom;
})();
