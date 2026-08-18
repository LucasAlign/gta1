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
- **E** — on foot, harvest the ripe plot you're standing on
- **B** — buy the tractor upgrade when standing at the shop
- **G** — sell produce at the farmers' market
- **C** — cycle the crop the Seeder plants
- **Shift+N** — wipe the save and start a new game

## Crops, ranks & persistence

- **Crops** — carrot (balanced), wheat (fast/cheap), pumpkin (slow/valuable).
  The Seeder plants whichever crop is selected (**C**); each sells at its own
  price at the market.
- **Progression** — every job gains **rank** with completions (bigger rewards),
  and a shared **streak** multiplies back-to-back completions (decays if you
  idle). Shown in the HUD.
- **Emergency stakes** — unattended fires grow, **spread** to neighbouring
  buildings, and burn a building down (cash penalty) if ignored. Police chases
  **escalate** a wanted level (★) the longer they run — faster suspect, bigger
  payout.
- **Save/load** — cash, produce, tractor upgrades, job ranks, and the market
  contract persist to `localStorage` automatically (every few seconds and on
  exit). **Shift+N** starts fresh.

## Economy & jobs

- **Farmers' Market** (south of the field) — harvesting fills your **produce**
  stock; press **G** at the market to sell it, filling a rolling **delivery
  contract** that pays a bonus when completed.
- **Duty jobs** — drive a duty vehicle from its station to go on duty:
  - **Fire Truck** (Fire Station) → fires break out on buildings; park near one
    to spray it out for a reward.
  - **Police Car** (Police station) → a suspect flees the road network; chase
    and close in to bust them.
- The HUD objective line and minimap markers follow whatever job you're on.

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
- **Cow herding** (fenced **Pasture**, top-left) — a side quest: cows flee when
  you get close (on foot or in a vehicle), so approach from the far side and
  push the whole herd into the corner **pen**. Pen all of them to earn a reward;
  a fresh round scatters them again. The fence only stops cows — you step over
  it. Tuning lives in `src/config.ts` (`HERD`); logic in
  `src/farming/CowPasture.ts`.

## Farming loop — three specialised tractors

The center soil block is a grid of crop plots. Each plot cycles through a
four-stage loop, and **each stage is gated to a specific task tractor** parked
at the **Farm Depot** (north of the field):

```
untilled --(Plow Tractor)--> tilled --(Seeder)--> growing --(time)--> ripe
   ripe --(Harvester)--> untilled   (loop repeats)
```

- Hop between the three depot tractors to do each job — driving the matching
  tractor over a plot performs its stage automatically.
- The HUD hints which tractor a plot needs.
- On foot you can **harvest ripe crops by hand (E)**, but plowing and seeding
  need the tractors.
- Harvesting pays cash (`+$` popup, HUD total top-right).

Tractors and crops are data-driven in `src/config.ts`: a task tractor is just a
`VehicleSpec` with a `farmJob` (`plow` / `seed` / `harvest`); crops are `CROPS`
entries (growth time, stages, value). Field state machine lives in
`src/farming/FarmField.ts`.

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
