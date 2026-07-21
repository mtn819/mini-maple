window.G = window.G || {};

(function () {
  function xpToNextLevel(level) {
    return 40 + (level - 1) * 20;
  }

  function applyLevelUp(player) {
    player.level += 1;
    player.maxHp += 15;
    player.hp = player.maxHp;
    player.attackDamage += 2;
  }

  function gainXP(player, amount) {
    player.xp += amount;

    while (player.xp >= xpToNextLevel(player.level)) {
      player.xp -= xpToNextLevel(player.level);
      applyLevelUp(player);
      player.emit('levelup', player.level);
      player.emit('hpchanged', player.hp, player.maxHp);
    }

    player.emit('xpchanged', player.xp, xpToNextLevel(player.level));
  }

  G.Leveling = { xpToNextLevel, applyLevelUp, gainXP };
})();
