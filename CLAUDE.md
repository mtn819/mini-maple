# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

mini-maple is a minimalist, single-player, 2D side-scrolling ARPG for the browser (in the spirit of
MapleStory), built on Phaser 3. The shipped game has **no build step and no bundler** — Phaser is loaded
from a CDN `<script>` tag, all other code is plain global `<script>` tags in `index.html`, and every
sprite is pixel art authored as string-grid data in JS and rasterized onto canvas textures at boot time
(no external image assets). `package.json`/`node_modules` exist only as a **dev-only** dependency for
running the unit test suite (see "Testing" below) — they are not required to play the game, and nothing
under `src/` or `index.html` depends on Node at runtime.

## Running / testing changes

There is nothing to build or install. To see a change:

- Open `index.html` directly in a browser (double-click or drag into Chrome/Edge/Firefox). It works
  over `file://` since nothing is a fetched asset or ES module.
- If `file://` script loading is ever blocked by browser policy, serve the folder instead:
  `npx serve .`, `python -m http.server 8000`, or the zero-install PowerShell `HttpListener` snippet in
  `README.md`.

There is no lint configured. For behavior that lives in `src/logic/*.js` (see "Testing" below), run the
unit tests; for anything Phaser-touching (Sprite/Scene classes), verify by loading the page and playing
— there is no automated way to test that part of the app in this environment.

## Testing

`npm install` once, then `npm test` (single run) or `npm run coverage` (single run + coverage report).
`npm run test:watch` for a watch-mode loop while iterating.

**Why a test suite exists alongside "no build step":** most of the game's actual rules (movement,
combat math, damage/invulnerability, the enemy AI state machine, XP/leveling, HUD bar math) used to be
inlined inside Phaser `Sprite`/`Scene` subclasses. Testing those directly would mean either simulating
large parts of Phaser (GameObject/EventEmitter, Arcade Physics bodies, canvas textures, Scene lifecycle)
as a test double — high effort, brittle, low value — or not testing them at all. Instead, the
decision/math logic was extracted into small, Phaser-independent pure functions under **`src/logic/`**
(`PlayerLogic.js`, `EnemyLogic.js`, `CombatLogic.js`, `HUDLogic.js`), which the original classes now
delegate to. These follow the same `window.G = window.G || {}` + IIFE convention as everything else and
are wired into `index.html` as `<script>` tags immediately before the file that consumes them (e.g.
`logic/PlayerLogic.js` before `entities/Player.js`). **When adding new game-rule logic, put the
decision/math part in a new or existing `src/logic/*.js` module and keep the Phaser class as thin
delegation** — that's what makes it testable without a browser.

**What's unit tested (Vitest + jsdom, `vitest.config.js`, 100% lines/statements/branches/functions on
the files listed below):**
- `src/logic/*.js` — all four modules, exhaustively, including boundary conditions (e.g. strict `>` vs
  strict `<` comparisons that look symmetric but aren't, hysteresis bands, tie-breaks).
- `src/systems/Leveling.js` — already Phaser-independent; multi-level-up-from-one-XP-gain, exact
  threshold boundaries, zero/negative gains.
- `src/systems/InputController.js` — via `test/support/phaserStub.js`, a minimal fake of just
  `Phaser.Input.Keyboard.JustDown`/`KeyCodes` (not a general Phaser mock).
- `src/core/PixelArt.js` — `validateFrame`, `drawFrame` (via a fake recording canvas-context object,
  not a real canvas), and `computeFrameLayout` (the pure frame-flattening/range-computation logic
  extracted out of `buildAnimatedSpriteSheet`).
- `src/core/AnimationBuilder.js` — `resolveAnimConfig` (the pure default-resolution logic extracted out
  of `registerAnimations`) and `registerAnimations` itself via a fake `scene.anims`.
- `src/core/Constants.js` — sanity only (finite numbers, gravity positive).
- `src/art/*.js` and `src/level/Level1.js` — data-integrity tests: the real `PixelArt.validateFrame` run
  against every authored sprite frame, palette-coverage checks, and `Level1` world-bounds/enemy-type
  checks (the latter is what makes `GameScene.js`'s enemy-type lookup, which has no `||` fallback unlike
  its playerClass lookup, safe in practice — that lookup itself was deliberately left unchanged).

**What's NOT unit tested, and why:** `Player.js`, `Enemy.js`, `Projectile.js`, `Warrior.js`, `Mage.js`,
`Slime.js`, `Mushroom.js`, `BootScene.js`, `ClassSelectScene.js`, `GameScene.js`, `HUDScene.js`. After
the `src/logic/` extraction, what's left in these files is almost entirely direct Phaser API calls
(`setVelocityX`, `anims.play`, `body.enable`, `tweens.add`, `physics.add.collider/overlap/group`,
`scene.start/launch`). Verify these by loading `index.html` and playing, per "Running / testing changes"
above — there is no headless-Phaser or jsdom-canvas setup in this project to test them automatically.

**The `/* v8 ignore start */` / `/* v8 ignore stop */` comments in `PixelArt.js`** aren't a coverage
shortcut — jsdom's `HTMLCanvasElement.getContext('2d')` returns `null` without the optional native
`canvas` npm package (which needs a compiler toolchain not installed on this project's dev machines), so
`buildAnimatedSpriteSheet`'s canvas-drawing body, `buildStaticTexture`, and `buildTileTexture` cannot
execute under the test runner at all, in any environment lacking that toolchain. If you add a new
canvas-touching function to this file, ignore it the same way rather than trying to make it "pass"
coverage some other way.

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
(`.` = transparent). `PixelArt.computeFrameLayout` (pure) flattens all frames for an entity across all
its animations into one array and computes `{ animName: { start, end } }` frame ranges;
`buildAnimatedSpriteSheet` calls it, then draws the flattened frames to an offscreen `<canvas>` and
registers the result as a Phaser spritesheet. `AnimationBuilder.resolveAnimConfig` (pure) resolves each
animation's `{frameRate, repeat}` against defaults; `registerAnimations` calls it and issues the actual
`scene.anims.create()` calls. `BootScene.create()` is what drives this for every character
(warrior/mage/slime/mushroom), plus one static texture (projectile) and one procedural tile texture
(platform), before starting `ClassSelectScene`.

**Entity class hierarchy.** `Player` and `Enemy` (`src/entities/`) are base `Phaser.Physics.Arcade.Sprite`
classes holding shared state (HP, movement, animation-name derivation from `textureKey`) and a few
methods meant to be overridden — notably `Player.performAttack()` is a no-op template method. Their
decision logic (movement resolution, attack-cooldown gating, damage/invulnerability math, animation
selection for `Player`; the PATROL/CHASE/DEAD state machine, patrol bounce, chase direction, damage math
for `Enemy`) lives in `src/logic/PlayerLogic.js` / `EnemyLogic.js` respectively — the classes call these
pure functions and apply the results to Phaser sprite/body state (see "Testing" below for why). Concrete
classes subclass `Player`/`Enemy`:
- `entities/classes/Warrior.js` / `Mage.js` extend `Player`, each implementing `performAttack()`
  differently (Warrior enables a melee hitbox zone timed to the attack animation; Mage spawns a
  `Projectile`). Both, plus `Projectile.js`'s launch velocity, use `src/logic/CombatLogic.js`'s
  `scaleByDirection(direction, magnitude)` for their facing-relative offset/velocity math.
- `entities/enemies/Slime.js` / `Mushroom.js` extend `Enemy`, mostly just supplying stat blocks — the
  shared state machine lives in `EnemyLogic.nextState`, driven from `Enemy.update()` (distance-based
  aggro against the player each tick, no pathfinding).

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
hitbox hits, projectile hits) is centralized in `GameScene`, not in the entities themselves. `HUDScene`'s
HP/XP bar-fill widths are computed by the pure `src/logic/HUDLogic.js:computeBarWidth`, not inline.

**Leveling (`src/systems/Leveling.js`)** is pure XP/level-up math with no Phaser dependency, called from
`Player.gainXP()`. Leveling only increases max HP and attack damage and fully heals on level-up — by
design there is no inventory, equipment, skill trees, save system, or multiplayer (see README "Scope"
section for the intentional feature boundary — don't expand it without checking with the user first).

**Input (`src/systems/InputController.js`)** wraps Phaser keyboard state into semantic queries
(`isLeftDown()`, `isRightDown()`, `isJumpJustDown()`, `isAttackJustDown()`) consumed by `Player.update()`
— entities never touch `scene.input` directly.
