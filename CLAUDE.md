# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

mini-maple is a minimalist, single-player, 2D side-scrolling ARPG for the browser (in the spirit of
MapleStory), built on Phaser 3. There is **no build step, no bundler, no npm/package.json, and no test
suite**. Phaser is loaded from a CDN `<script>` tag, all other code is plain global `<script>` tags in
`index.html`, and every sprite is pixel art authored as string-grid data in JS and rasterized onto
canvas textures at boot time — there are no external image assets.

## Running / testing changes

There is nothing to build or install. To see a change:

- Open `index.html` directly in a browser (double-click or drag into Chrome/Edge/Firefox). It works
  over `file://` since nothing is a fetched asset or ES module.
- If `file://` script loading is ever blocked by browser policy, serve the folder instead:
  `npx serve .`, `python -m http.server 8000`, or the zero-install PowerShell `HttpListener` snippet in
  `README.md`.

There is no lint or test command configured — verify changes by loading the page and playing.

## Workflow: commit, push, and keep this file current

This project's only record of progress is git history — there is no issue tracker, changelog, or
design doc. To make sure nothing is ever lost between sessions:

- **Commit and push after every successful change**, not just at the end of a session. "Successful"
  means the page loads without console errors and the change was verified in-browser (see "Running /
  testing changes" above). Don't leave work uncommitted, and don't let unrelated changes pile up into
  one commit — commit at natural checkpoints with a message that describes what changed and why (never
  a generic "update files").
- Repo: https://github.com/mtn819/mini-maple (public, default branch `master`). Push straight to
  `master` — this is a solo project with no branch/PR workflow.
- **Update this file in the same commit as the code change** whenever the change affects something
  documented here: a new top-level `src/` area, a changed scene flow, a new shared system, a new
  script-load-order dependency, or a scope change to the intentionally-minimal feature set. Treat
  CLAUDE.md as part of the change, not a follow-up task.
- Windows/PowerShell note: `git` and `gh` are installed on this machine but a freshly spawned shell
  process may not have them on `PATH`. If a bare `git`/`gh` call fails with "not recognized", prepend:
  `$env:PATH = "C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI\;" + $env:PATH`.

## Architecture

**Global namespace, no modules.** Every file does `window.G = window.G || {};` then wraps its content
in an IIFE that assigns onto `G` (e.g. `G.Player = Player;`). There is no `import`/`export` and no
bundler — dependencies between files are resolved purely by `<script>` load order in `index.html`. If
you add a new file, you must also add a `<script src="...">` line in `index.html` **after** any file it
depends on and before any file that depends on it.

**Pixel art pipeline (`src/core/PixelArt.js`).** Sprite frames are authored in `src/art/*.js` as arrays
of equal-length strings — one character per pixel, each character indexing a per-sprite palette object
(`.` = transparent). `PixelArt.buildAnimatedSpriteSheet` validates frame dimensions, flattens all
frames for an entity across all its animations into one horizontal strip, draws it to an offscreen
`<canvas>`, and registers it as a Phaser spritesheet — returning `{ animName: { start, end } }` frame
ranges. `AnimationBuilder.registerAnimations` turns those ranges + a per-animation frameRate/repeat
config into `scene.anims.create()` calls. `BootScene.create()` is what actually drives this for every
character (warrior/mage/slime/mushroom), plus one static texture (projectile) and one procedural tile
texture (platform), before starting `ClassSelectScene`.

**Entity class hierarchy.** `Player` and `Enemy` (`src/entities/`) are base `Phaser.Physics.Arcade.Sprite`
classes holding shared state (HP, movement, animation-name derivation from `textureKey`) and a few
methods meant to be overridden — notably `Player.performAttack()` is a no-op template method. Concrete
classes subclass these:
- `entities/classes/Warrior.js` / `Mage.js` extend `Player`, each implementing `performAttack()`
  differently (Warrior enables a melee hitbox zone timed to the attack animation; Mage spawns a
  `Projectile`).
- `entities/enemies/Slime.js` / `Mushroom.js` extend `Enemy`, mostly just supplying stat blocks — the
  shared PATROL/CHASE/DEAD state machine lives entirely in `Enemy.update()` (distance-based aggro
  against the player each tick, no pathfinding).

**Data-only level definition (`src/level/Level1.js`).** Platform rects, enemy spawn specs
(`{type, x, y}`), and the player spawn point are plain data with no Phaser calls — `GameScene.create()`
is what interprets this data, instantiating platforms as a static physics group and mapping
`spec.type` (`'slime' | 'mushroom'`) and the chosen class (`'warrior' | 'mage'`) to their entity
classes via lookup objects.

**Scene flow:** `BootScene` (generates all textures/animations) → `ClassSelectScene` (choose
Warrior/Mage) → `GameScene` (owns platforms, player, enemies, colliders/overlaps, camera follow) with
`HUDScene` launched alongside it as an overlay scene (HP/XP bars, level text) driven by events emitted
from `Player` (`hpchanged`, `died`). On player death, `GameScene` stops `HUDScene` and returns to
`ClassSelectScene`. All contact/collision resolution (player-enemy contact damage + knockback, melee
hitbox hits, projectile hits) is centralized in `GameScene`, not in the entities themselves.

**Leveling (`src/systems/Leveling.js`)** is pure XP/level-up math with no Phaser dependency, called from
`Player.gainXP()`. Leveling only increases max HP and attack damage and fully heals on level-up — by
design there is no inventory, equipment, skill trees, save system, or multiplayer (see README "Scope"
section for the intentional feature boundary — don't expand it without checking with the user first).

**Input (`src/systems/InputController.js`)** wraps Phaser keyboard state into semantic queries
(`isLeftDown()`, `isRightDown()`, `isJumpJustDown()`, `isAttackJustDown()`) consumed by `Player.update()`
— entities never touch `scene.input` directly.
