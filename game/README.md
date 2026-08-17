# Grand Tractor Auto — Web Game

Top-down, open-world driving game with an original-GTA (GTA 1/2) feel, built
browser-first. Keeps the "tractor" identity from the original project but adds
GTA-style open-world mechanics: walk around, hop into any vehicle, and drive.

## Stack

- **Phaser 3** (Canvas renderer — runs on low-end hardware, no WebGL fragility)
- **Vite** dev server + build
- **TypeScript** (strict)
- Zero external art: every sprite is generated procedurally at boot.

## Run

```bash
cd game
npm install
npm run dev
```

Then open http://localhost:5173. The canvas fills the whole window — no
scrolling, no page chrome.

- `npm run dev` — dev server with hot reload
- `npm run build` — typecheck + production build to `dist/`
- `npm run preview` — serve the production build

## Controls

- **WASD / Arrow keys** — walk (on foot) or drive (in a vehicle)
- **Enter / Space / F** — get in / out of the nearest vehicle
- **E** — on foot, plant/harvest the plot you're standing on
- **B** — buy the tractor upgrade when standing at the shop

## Living world

- **Traffic** — AI cars follow the road lattice with right-hand lanes; bump
  them in a vehicle or on foot and they recover their lane.
- **Pedestrians** — stroll the sidewalk rings around blocks.
- **Minimap** (bottom-left) — baked world grid + live markers for you, the
  active mission objective, and the shop.
- **Missions** — a rolling delivery loop: drive to the yellow pickup marker,
  then the green drop-off marker, for cash. A new contract starts immediately.
- **Shop** ($ marker) — spend farm + mission cash on the **Tractor Turbo**
  upgrade (more speed and acceleration, price climbs each level).

## Farming loop

The center soil block is a grid of crop plots, wired straight into the driving
loop instead of a menu:

- **Drive the tractor over empty soil** → it tills and plants a crop.
- Crops grow through visible stages over time (sprout → bushy → ripe).
- **Drive the ripe crop over** → harvest it for cash (`+$` popup, HUD total
  top-right). Only the tractor farms; cars just drive.
- On foot, stand on a plot and press **E** to plant or harvest by hand.

Crops are data-driven in `src/config.ts` (`CROPS`) — growth time, stages, and
cash value are config, so adding a new crop is an entry, not new code.

## How it's laid out

- `src/config.ts` — world grid dimensions, colors, and the **vehicle specs**
  (a vehicle is data, not a class — add one by adding an entry here).
- `src/scenes/BootScene.ts` — procedurally generates all textures.
- `src/scenes/WorldScene.ts` — builds the city/farm grid, spawns vehicles,
  handles camera + enter/exit.
- `src/entities/Vehicle.ts` — top-down car physics (accel, braking,
  speed-scaled steering, lateral grip / drift).
- `src/entities/Player.ts` — on-foot movement.
- `src/ui/Hud.ts` — screen-fixed HUD (speed readout, prompts).

## World

A 6×6 block city grid with roads, sidewalks, buildings (solid), grass parks,
and a **soil farm field** in the center block. Three vehicle types are tuned
differently: the **Tractor** (slow, high grip), the **Hatchback** (mid), and
the **Sports Car** (fast, slides in corners).

## Renderer note

Uses Phaser's Canvas renderer for maximum compatibility on low-end machines.
For a heavier world later (many entities, lighting, effects) switch
`type: Phaser.CANVAS` to `Phaser.AUTO` in `src/main.ts` to prefer WebGL.
