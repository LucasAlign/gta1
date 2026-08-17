import Phaser from "phaser";
import {
  BLOCKS_X,
  BLOCKS_Y,
  BLOCK_TILES,
  COLORS,
  PERIOD,
  ROAD_TILES,
  TILE,
  VEHICLES,
  VehicleSpec,
  WORLD_H,
  WORLD_TILES_X,
  WORLD_TILES_Y,
  WORLD_W,
  intersectionPx,
} from "../config";
import { Vehicle } from "../entities/Vehicle";
import { Player } from "../entities/Player";
import { Hud } from "../ui/Hud";
import { FarmField } from "../farming/FarmField";
import { Traffic } from "../traffic/Traffic";
import { Pedestrians } from "../npc/Pedestrians";
import { Minimap } from "../ui/Minimap";
import { MissionManager } from "../missions/MissionManager";
import { Shop } from "../shop/Shop";

type BlockKind = "building" | "park" | "farm";

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private vehicles: Vehicle[] = [];
  private buildings!: Phaser.Physics.Arcade.StaticGroup;
  private driving: Vehicle | null = null;
  private hud!: Hud;
  private farm!: FarmField;
  private farmTiles: Array<{ tx: number; ty: number }> = [];
  private cash = 0;
  private traffic!: Traffic;
  private pedestrians!: Pedestrians;
  private minimap!: Minimap;
  private missions!: MissionManager;
  private shop!: Shop;

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
    e: Phaser.Input.Keyboard.Key;
    b: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super("World");
  }

  create() {
    // Reset per-run state so a scene restart starts clean (no accumulation).
    this.vehicles = [];
    this.farmTiles = [];
    this.driving = null;
    this.cash = 0;

    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBackgroundColor("#1a1d22");

    this.buildings = this.physics.add.staticGroup();
    this.buildGround();
    this.farm = new FarmField(this, this.farmTiles);

    // Player starts by the farm depot, next to the task tractors.
    const cyStart = Math.floor(BLOCKS_Y / 2);
    const start = {
      x: this.farmCenterPx().x,
      y: (cyStart * PERIOD + ROAD_TILES / 2) * TILE - 44,
    };
    this.player = new Player(this, start.x, start.y);

    this.spawnVehicles();

    // Ambient life + systems.
    this.traffic = new Traffic(this, 14);
    this.pedestrians = new Pedestrians(this, 20);
    this.missions = new MissionManager(this);
    const shopPos = intersectionPx(1, Math.floor(BLOCKS_Y / 2));
    this.shop = new Shop(this, shopPos.x, shopPos.y);

    this.physics.add.collider(this.player, this.buildings);
    for (const v of this.vehicles) {
      this.physics.add.collider(v, this.buildings);
    }
    this.physics.add.collider(this.vehicles, this.vehicles);
    this.physics.add.collider(this.player, this.vehicles);
    // You can bump traffic in a vehicle or on foot; traffic recovers its lane.
    this.physics.add.collider(this.vehicles, this.traffic.group);
    this.physics.add.collider(this.player, this.traffic.group);

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
      e: kb.addKey("E"),
      b: kb.addKey("B"),
    };
    // Space + F also toggle vehicle, and prevent page scroll.
    kb.addKey("SPACE").on("down", () => this.toggleVehicle());
    kb.addKey("F").on("down", () => this.toggleVehicle());
    this.keys.enter.on("down", () => this.toggleVehicle());
    // On foot, E plants/harvests the plot you're standing on.
    this.keys.e.on("down", () => this.footFarm());
    // B buys a tractor upgrade when near the shop.
    this.keys.b.on("down", () => this.tryBuy());

    this.hud = new Hud(this);
    this.minimap = new Minimap(this);
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
          if (!isBorder) this.farmTiles.push({ tx, ty });
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

  // World-pixel center of the farm block.
  private farmCenterPx() {
    const cx = Math.floor(BLOCKS_X / 2);
    const cy = Math.floor(BLOCKS_Y / 2);
    return {
      x: (cx * PERIOD + ROAD_TILES + BLOCK_TILES / 2) * TILE,
      y: (cy * PERIOD + ROAD_TILES + BLOCK_TILES / 2) * TILE,
    };
  }

  private spawnVehicles() {
    this.buildDepot();

    // City cars parked on roads for getting around / delivery missions.
    const city: Array<[VehicleSpec, number, number, number]> = [
      [VEHICLES.hatchback, ROAD_TILES + 2, ROAD_TILES - 0.5, 0],
      [VEHICLES.sports, ROAD_TILES - 0.5, PERIOD + 2, Math.PI / 2],
      [VEHICLES.hatchback, WORLD_TILES_X - ROAD_TILES - 2, WORLD_TILES_Y - ROAD_TILES - 1, Math.PI],
    ];
    for (const [spec, tx, ty, rot] of city) {
      const p = this.tileToPx(tx, ty);
      const v = new Vehicle(this, p.x, p.y, spec);
      v.rotation = rot;
      this.vehicles.push(v);
    }
  }

  // Parks the three task tractors on the road just north of the farm field,
  // with a labelled slab, so the player can swap jobs by hopping between them.
  private buildDepot() {
    const cy = Math.floor(BLOCKS_Y / 2);
    const northRoadY = (cy * PERIOD + ROAD_TILES / 2) * TILE;
    const cx = this.farmCenterPx().x;

    // depot slab + label
    this.add.rectangle(cx, northRoadY, 300, 74, 0x1f242b, 0.55).setDepth(-8);
    this.add
      .text(cx, northRoadY - 30, "FARM DEPOT", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        color: "#f4d03f",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(-7);

    const tractors = [VEHICLES.plow, VEHICLES.seeder, VEHICLES.harvester];
    tractors.forEach((spec, i) => {
      const v = new Vehicle(this, cx + (i - 1) * 92, northRoadY, spec);
      v.rotation = Math.PI / 2; // face south, into the field
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

    this.farm.update(dt);
    this.traffic.update();
    this.pedestrians.update(dt);

    if (this.driving) {
      const throttle = (up ? 1 : 0) + (down ? -1 : 0);
      const steer = (right ? 1 : 0) + (left ? -1 : 0);
      this.driving.drive({ throttle, steer }, dt);
      // A task tractor performs only its own field stage, just by driving over
      // a plot: the Plow tills, the Seeder plants, the Harvester reaps.
      const job = this.driving.spec.farmJob;
      if (job && this.driving.speed > 8) {
        const r = this.farm.interact(this.driving.x, this.driving.y, job);
        if (r.cash > 0) this.addCash(r.cash, this.driving.x, this.driving.y);
      }
    } else {
      const dx = (right ? 1 : 0) + (left ? -1 : 0);
      const dy = (down ? 1 : 0) + (up ? -1 : 0);
      this.player.walk(dx, dy);
    }

    // Missions track whichever entity the player controls.
    const actor = this.driving ?? this.player;
    const earned = this.missions.update(actor.x, actor.y);
    if (earned > 0) this.addCash(earned, actor.x, actor.y);

    this.minimap.update(actor, [this.missions.minimapMarker, this.shop.minimapMarker]);

    this.hud.update({
      driving: this.driving,
      nearbyVehicle: this.nearestVehicleLabel(),
      cash: this.cash,
      fieldHint: this.fieldHint(),
      objective: this.missions.objective,
      shopPrompt: this.shop.contains(actor.x, actor.y) ? this.shop.promptText(this.cash) : null,
    });
  }

  private tryBuy() {
    const actor = this.driving ?? this.player;
    if (!this.shop.contains(actor.x, actor.y)) return;
    const res = this.shop.buy(this.cash);
    if (res.ok) {
      this.cash -= res.cost;
      this.flashText(res.message, actor.x, actor.y, "#c9b3ff");
    } else {
      this.flashText(res.message, actor.x, actor.y, "#ff9b9b");
    }
  }

  private flashText(text: string, x: number, y: number, color: string) {
    const label = this.add
      .text(x, y - 24, text, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "15px",
        color,
        fontStyle: "bold",
      })
      .setOrigin(0.5, 1)
      .setDepth(50);
    this.tweens.add({
      targets: label,
      y: y - 58,
      alpha: 0,
      duration: 900,
      ease: "Quad.out",
      onComplete: () => label.destroy(),
    });
  }

  // On foot you can only harvest ripe crops by hand — plowing and seeding need
  // the tractors.
  private footFarm() {
    if (this.driving) return;
    const r = this.farm.interact(this.player.x, this.player.y, "hand");
    if (r.cash > 0) this.addCash(r.cash, this.player.x, this.player.y);
  }

  // Contextual field hint: which tractor a plot needs, or the on-foot action.
  private fieldHint(): string | null {
    const job = this.driving?.spec.farmJob ?? null;
    // In a non-tractor vehicle: no field hints.
    if (this.driving && !job) return null;

    const actor = this.driving ?? this.player;
    const plot = this.farm.plotAtWorld(actor.x, actor.y);
    if (!plot) return null;

    // Driving the right tractor for this plot — it works automatically, stay quiet.
    if (job && plot.need === job) return null;

    const needLabel: Record<string, string> = {
      plow: "Plow Tractor",
      seed: "Seeder",
      harvest: "Harvester",
    };
    switch (plot.need) {
      case "plow":
        return job ? "Needs the Plow Tractor" : "Bring the Plow Tractor";
      case "seed":
        return "Needs the Seeder";
      case "wait":
        return "Growing…";
      case "harvest":
        return this.driving ? "Needs the Harvester" : "Press E to harvest";
    }
    return needLabel[plot.need] ?? null;
  }

  private addCash(amount: number, x: number, y: number) {
    this.cash += amount;
    const label = this.add
      .text(x, y - 20, `+$${amount}`, {
        fontFamily: "ui-monospace, monospace",
        fontSize: "16px",
        color: "#ffe08a",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 1)
      .setDepth(50);
    this.tweens.add({
      targets: label,
      y: y - 52,
      alpha: 0,
      duration: 700,
      ease: "Quad.out",
      onComplete: () => label.destroy(),
    });
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
