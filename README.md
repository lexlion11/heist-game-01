<a href="https://make.fun/bounty/best-heist-game-20261122-0559"><img src="https://make.fun/badge/best-heist-game-20261122-0559.svg" alt="make.fun bounty" /></a>
<a href="https://make.fun/bounty/best-heist-game-20261122-0559"><img src="https://make.fun/badge/best-heist-game-20261122-0559/lexlion11/heist-game-01/rank.svg" alt="rank" /></a>
<a href="https://make.fun/bounty/best-heist-game-20261122-0559"><img src="https://make.fun/badge/best-heist-game-20261122-0559/lexlion11/heist-game-01/reward.svg" alt="reward" /></a>

# Cold Signal

**Cold Signal** is an original top-down heist game, written from scratch in plain
ES modules with no library and no build step. You are a hooded thief crossing the
**Meridian Signal Annex**: four connected rooms, guards whose translucent vision
cones sweep the floor, wall cameras with cones of their own, a signal vault full
of loot, and an alarm meter that fills while anyone is looking at you.

Read the cones, cut the cameras, crack the vault, and get the haul back to the van
in the service dock before the alarm tops out.

## The game

- **Four rooms, several routes.** The Atrium, the Signal Vault, the Service Dock
  and the Cold Store are joined by six doorways. Crates, pillars, shelving and a
  delivery van break line of sight, so there is more than one way into the vault
  and more than one way out.
- **Guards with readable vision cones.** Four patrollers walk fixed routes and
  turn their cones as they go. The cone turns red the moment it holds you.
- **Cameras with cones.** Four wall cameras sweep on their own rhythm. Cutting a
  camera takes time and makes noise, so it is a trade, not a free win.
- **An alarm meter.** It fills while you are seen and bleeds off while you are
  not. Full meter means the run is over.
- **Tools, each with a cost.**
  - *Smoke veil* (Space) — makes you invisible for a few seconds, but the pop
    adds 18 to the alarm.
  - *Lockpick* (Space) — cuts the vault work to a third, spends a charge.
  - *Coin toss* (Space) — throws a coin that pulls the nearest guard over to it.
- **A getaway.** The loot is not the win. The win is the loot *home*: reach the
  van in the service dock with the haul.
- **Sneaking.** Shift moves you slowly and quietly; running is faster and
  louder, and guards hear you.

## Controls

| Key | Action |
| --- | --- |
| WASD / arrow keys | move |
| SHIFT | sneak (quiet, slow) |
| E | work the vault lock |
| SPACE | use the selected tool |
| Q / 1 / 2 / 3 | cycle or pick the tool |
| Mouse | aim |
| R | run it again (on the end card) |

## Run it

```bash
node serve.ts          # serves game/ on http://localhost:8080
```

Open `http://localhost:8080` in a desktop Chrome. The game is static files
under `game/`; there is no build step and no network request at any point.

## Handing it in

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` into the output directory and writes
`dossier.json` with the unmodified `vendor/makefun-game.ts` library.

## Source layout

| File | Job |
| --- | --- |
| `game/src/main.js` | bootstrap and the game loop |
| `game/src/state.js` | the state object and its reset |
| `game/src/level.js` | the building: rooms, walls, doors, cover, vault |
| `game/src/thief.js` | movement, sneaking, carrying, hiding |
| `game/src/guards.js` | patrol routes and vision cones |
| `game/src/cameras.js` | wall cameras and their cones |
| `game/src/vault.js` | the lock, the packets and the payout |
| `game/src/alarm.js` | the alarm meter and its rules |
| `game/src/tools.js` | the tools, their costs and effects |
| `game/src/hud.js` | the on-screen heads-up display |
| `game/src/render.js` | the world drawing |
| `game/src/sprites.js` | the thief, guards, cameras, cones, cover, loot |
| `game/src/input.js` | keyboard and mouse |
| `game/src/audio.js` | original WebAudio sounds, no files |
| `game/src/shots.js` | the screenshot scenes |

Everything here is original: the names, the art, the sounds and the layout are
this repository's own.

## Licence

MIT — see [LICENSE](LICENSE).
