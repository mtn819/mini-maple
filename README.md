# mini-maple

A minimalist, single-player, 2D side-scrolling ARPG for the browser, in the spirit of MapleStory.
Built on Phaser 3 (loaded via CDN, no build step). All sprites are pixel art authored as data in
JS and rendered onto canvas textures at boot time — no external image files.

## How to run

Just open `index.html` directly in Chrome/Edge/Firefox (double-click it, or drag it into a browser
window). Everything is classic `<script>` tags (no ES modules) and all art is generated in-memory,
so it works fine over `file://` — no local server required.

If a browser ever complains (e.g. locked-down policy), serve the folder instead:

```powershell
# zero-install fallback (PowerShell only)
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8000/")
$listener.Start()
Write-Host "Serving http://localhost:8000/ - Ctrl+C to stop"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = Join-Path (Get-Location) ($ctx.Request.Url.LocalPath.TrimStart('/'))
  if (Test-Path $path -PathType Leaf) {
    $bytes = [IO.File]::ReadAllBytes($path)
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $ctx.Response.StatusCode = 404
  }
  $ctx.Response.Close()
}
```

or, if Node/Python are installed: `npx serve .` / `python -m http.server 8000`.

## Controls

- Move: Arrow Keys or A/D
- Jump: Up / W / Space
- Attack: X (or J)

## Architecture

```
index.html                     canvas host + ordered <script> tags (no bundler, no modules)
src/
  core/
    Constants.js                gravity, sprite scale, tuning numbers
    PixelArt.js                 pixel-grid data -> Phaser canvas textures/spritesheets
    AnimationBuilder.js         frame-range map -> scene.anims.create() calls
  art/
    playerFrames.js             Warrior + Mage pixel frame data (idle/walk/attack) + palettes
    enemyFrames.js               Slime + Mushroom pixel frame data + palettes
    worldFrames.js                projectile bolt frame + platform tile colors
  systems/
    InputController.js           keyboard -> isLeftDown/isRightDown/isJumpJustDown/isAttackJustDown
    Leveling.js                   pure XP/level-up math, no Phaser dependency
  entities/
    Player.js                    base class: movement, jump, HP/XP/level, attack template method
    Enemy.js                     base class: PATROL/CHASE state machine, takeDamage, death->XP
    Projectile.js                 mage bolt: velocity + lifespan auto-destroy
    classes/Warrior.js             melee: hitbox zone swing
    classes/Mage.js                ranged: spawns Projectile
    enemies/Slime.js               weak/common contact enemy
    enemies/Mushroom.js            tougher/less common contact enemy
  level/
    Level1.js                     platform rects, enemy spawns, player spawn (data only)
  scenes/
    BootScene.js                  generates all textures/animations, then -> ClassSelectScene
    ClassSelectScene.js            pick Warrior or Mage
    GameScene.js                   level, player, enemies, collisions, camera
    HUDScene.js                    HP/XP bars + level text, overlay scene
  main.js                         Phaser.Game config + scene list
```

## Scope (intentionally minimal)

Single level, 2 classes, 2 enemy types, no inventory/equipment, no skill trees, no save system,
no multiplayer. Leveling only bumps max HP and attack damage and fully heals on level-up.
