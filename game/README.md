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
