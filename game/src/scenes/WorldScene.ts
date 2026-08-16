import Phaser from "phaser";
import {
  BLOCKS_X,
  BLOCKS_Y,
  BLOCK_TILES,
  COLORS,
  ROAD_TILES,
  TILE,
  VEHICLES,
  WORLD_H,
  WORLD_TILES_X,
  WORLD_TILES_Y,
  WORLD_W,
} from "../config";
import { Vehicle } from "../entities/Vehicle";
import { Player } from "../entities/Player";
import { Hud } from "../ui/Hud";

const PERIOD = BLOCK_TILES + ROAD_TILES;

type BlockKind = "building" | "park" | "farm";

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private vehicles: Vehicle[] = [];
  private buildings!: Phaser.Physics.Arcade.StaticGroup;
  private driving: Vehicle | null = null;
  private hud!: Hud;

  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    enter: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super("World");
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBackgroundColor("#1a1d22");

    this.buildings = this.physics.add.staticGroup();
    this.buildGround();

    // Player starts on a road near the farm.
    const start = this.tileToPx(ROAD_TILES + 1, ROAD_TILES + 1);
    this.player = new Player(this, start.x, start.y);

    this.spawnVehicles();

    this.physics.add.collider(this.player, this.buildings);
    for (const v of this.vehicles) {
      this.physics.add.collider(v, this.buildings);
    }
    this.physics.add.collider(this.vehicles, this.vehicles);
    this.physics.add.collider(this.player, this.vehicles);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1);

    const kb = this.input.keyboard!;
    this.keys = {
      up: kb.addKey("UP"),
      down: kb.addKey("DOWN"),
      left: kb.addKey("LEFT"),
      right: kb.addKey("RIGHT"),
      w: kb.addKey("W"),
      a: kb.addKey("A"),
      s: kb.addKey("S"),
      d: kb.addKey("D"),
      enter: kb.addKey("ENTER"),
    };
    // Space + F also toggle vehicle, and prevent page scroll.
    kb.addKey("SPACE").on("down", () => this.toggleVehicle());
    kb.addKey("F").on("down", () => this.toggleVehicle());
    this.keys.enter.on("down", () => this.toggleVehicle());

    this.hud = new Hud(this);
  }

  // ---- world construction -------------------------------------------------

  private blockKind(bx: number, by: number): BlockKind {
    const cx = Math.floor(BLOCKS_X / 2);
    const cy = Math.floor(BLOCKS_Y / 2);
    if (bx === cx && by === cy) return "farm";
    if ((bx + by) % 5 === 0) return "park";
    return "building";
  }

  private buildGround() {
    const rt = this.add.renderTexture(0, 0, WORLD_W, WORLD_H).setOrigin(0, 0).setDepth(-10);

    const stamp = (key: string, tx: number, ty: number) => {
      rt.drawFrame(key, undefined, tx * TILE, ty * TILE);
    };

    for (let ty = 0; ty < WORLD_TILES_Y; ty++) {
      for (let tx = 0; tx < WORLD_TILES_X; tx++) {
        const rx = tx % PERIOD;
        const ry = ty % PERIOD;
        const isRoadX = rx < ROAD_TILES;
        const isRoadY = ry < ROAD_TILES;

        if (isRoadX || isRoadY) {
          stamp("tile-road", tx, ty);
          continue;
        }
        const bx = Math.floor(tx / PERIOD);
        const by = Math.floor(ty / PERIOD);
        const kind = this.blockKind(bx, by);
        const lx = rx - ROAD_TILES;
        const ly = ry - ROAD_TILES;
        const isBorder = lx === 0 || ly === 0 || lx === BLOCK_TILES - 1 || ly === BLOCK_TILES - 1;

        if (kind === "farm") {
          stamp(isBorder ? "tile-sidewalk" : "tile-soil", tx, ty);
        } else if (kind === "park") {
          stamp(isBorder ? "tile-sidewalk" : "tile-grass", tx, ty);
        } else {
          stamp("tile-sidewalk", tx, ty);
        }
      }
    }

    this.paintRoadLines(rt);

    // Buildings: one obstacle per building block (interior, inside the sidewalk).
    for (let by = 0; by < BLOCKS_Y; by++) {
      for (let bx = 0; bx < BLOCKS_X; bx++) {
        if (this.blockKind(bx, by) !== "building") continue;
        this.addBuilding(bx, by, rt);
      }
    }
  }

  private paintRoadLines(rt: Phaser.GameObjects.RenderTexture) {
    const g = this.add.graphics();
    g.fillStyle(COLORS.roadLine, 0.5);
    const dash = 14;
    const gap = 22;
    // vertical roads: center dashed line
    for (let bx = 0; bx <= BLOCKS_X; bx++) {
      const cx = (bx * PERIOD + ROAD_TILES / 2) * TILE;
      for (let y = 0; y < WORLD_H; y += dash + gap) {
        g.fillRect(cx - 1.5, y, 3, dash);
      }
    }
    // horizontal roads
    for (let by = 0; by <= BLOCKS_Y; by++) {
      const cy = (by * PERIOD + ROAD_TILES / 2) * TILE;
      for (let x = 0; x < WORLD_W; x += dash + gap) {
        g.fillRect(x, cy - 1.5, dash, 3);
      }
    }
    rt.draw(g);
    g.destroy();
  }

  private addBuilding(bx: number, by: number, rt: Phaser.GameObjects.RenderTexture) {
    // interior region (inside the 1-tile sidewalk border)
    const x0 = (bx * PERIOD + ROAD_TILES + 1) * TILE;
    const y0 = (by * PERIOD + ROAD_TILES + 1) * TILE;
    const w = (BLOCK_TILES - 2) * TILE;
    const h = (BLOCK_TILES - 2) * TILE;
    const cx = x0 + w / 2;
    const cy = y0 + h / 2;

    // paint roof into ground texture
    const g = this.add.graphics();
    const roof = Phaser.Display.Color.IntegerToColor(COLORS.building);
    g.fillStyle(roof.color, 1).fillRect(x0, y0, w, h);
    g.fillStyle(COLORS.buildingRoof, 1).fillRect(x0 + 6, y0 + 6, w - 12, h - 12);
    g.lineStyle(2, 0x000000, 0.15).strokeRect(x0, y0, w, h);
    rt.draw(g);
    g.destroy();

    // invisible static collider matching the roof
    const rect = this.add.rectangle(cx, cy, w, h, 0x000000, 0);
    this.buildings.add(rect);
    (rect.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
  }

  private spawnVehicles() {
    // Park a few vehicles on roads around the map so there's always one nearby.
    const specs = [
      VEHICLES.tractor,
      VEHICLES.hatchback,
      VEHICLES.sports,
      VEHICLES.tractor,
      VEHICLES.hatchback,
    ];
    const spots: Array<[number, number, number]> = [
      [ROAD_TILES + 2, ROAD_TILES - 0.5, 0],
      [PERIOD + ROAD_TILES + 1, ROAD_TILES - 0.5, 0],
      [ROAD_TILES - 0.5, PERIOD + 2, Math.PI / 2],
      [WORLD_TILES_X - ROAD_TILES - 2, WORLD_TILES_Y - ROAD_TILES - 1, Math.PI],
      [Math.floor(WORLD_TILES_X / 2), ROAD_TILES - 0.5, 0],
    ];
    spots.forEach(([tx, ty, rot], i) => {
      const p = this.tileToPx(tx, ty);
      const v = new Vehicle(this, p.x, p.y, specs[i % specs.length]);
      v.rotation = rot;
      this.vehicles.push(v);
    });
  }

  private tileToPx(tx: number, ty: number) {
    return { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 };
  }

  // ---- enter / exit vehicle ----------------------------------------------

  private toggleVehicle() {
    if (this.driving) {
      this.exitVehicle();
    } else {
      this.enterNearestVehicle();
    }
  }

  private enterNearestVehicle() {
    let best: Vehicle | null = null;
    let bestDist = 90; // reach radius
    for (const v of this.vehicles) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, v.x, v.y);
      if (d < bestDist) {
        bestDist = d;
        best = v;
      }
    }
    if (!best) return;
    this.driving = best;
    this.player.stop();
    this.player.setVisible(false);
    (this.player.body as Phaser.Physics.Arcade.Body).enable = false;
    this.cameras.main.startFollow(best, true, 0.1, 0.1);
  }

  private exitVehicle() {
    const v = this.driving;
    if (!v) return;
    v.parkAndIdle();
    // step out to the left side of the car
    const side = new Phaser.Math.Vector2(-Math.sin(v.rotation), Math.cos(v.rotation)).scale(46);
    this.player.setPosition(v.x + side.x, v.y + side.y);
    this.player.setVisible(true);
    (this.player.body as Phaser.Physics.Arcade.Body).enable = true;
    this.player.stop();
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.driving = null;
  }

  // ---- loop ---------------------------------------------------------------

  update(_time: number, deltaMs: number) {
    const dt = Math.min(deltaMs, 50) / 1000;
    const left = this.keys.left.isDown || this.keys.a.isDown;
    const right = this.keys.right.isDown || this.keys.d.isDown;
    const up = this.keys.up.isDown || this.keys.w.isDown;
    const down = this.keys.down.isDown || this.keys.s.isDown;

    if (this.driving) {
      const throttle = (up ? 1 : 0) + (down ? -1 : 0);
      const steer = (right ? 1 : 0) + (left ? -1 : 0);
      this.driving.drive({ throttle, steer }, dt);
    } else {
      const dx = (right ? 1 : 0) + (left ? -1 : 0);
      const dy = (down ? 1 : 0) + (up ? -1 : 0);
      this.player.walk(dx, dy);
    }

    this.hud.update(this.driving, this.nearestVehicleLabel());
  }

  private nearestVehicleLabel(): string | null {
    if (this.driving) return null;
    let best: Vehicle | null = null;
    let bestDist = 90;
    for (const v of this.vehicles) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, v.x, v.y);
      if (d < bestDist) {
        bestDist = d;
        best = v;
      }
    }
    return best ? best.spec.label : null;
  }
}
