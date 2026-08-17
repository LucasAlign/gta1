import Phaser from "phaser";
import { COLORS, CROPS, CropSpec, TILE, VEHICLES, VehicleSpec } from "../config";

// Generates every sprite procedurally into the texture cache so the game ships
// with zero external art dependencies (fast load, no missing-asset clunk).
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create() {
    this.makeTile("tile-grass", COLORS.grass, COLORS.grassAlt);
    this.makeTile("tile-soil", COLORS.soil, COLORS.soilAlt);
    this.makeRoadTile();
    this.makeSidewalkTile();
    this.makePlayer();
    this.makePed();
    this.makeCow();

    for (const spec of Object.values(VEHICLES)) {
      this.makeVehicle(spec);
    }

    this.makeTilled();
    for (const crop of Object.values(CROPS)) {
      this.makeCrop(crop);
    }

    this.scene.start("World");
  }

  private makeTile(key: string, base: number, speckle: number) {
    const g = this.add.graphics();
    g.fillStyle(base, 1).fillRect(0, 0, TILE, TILE);
    g.fillStyle(speckle, 1);
    // deterministic speckle so tiles don't shimmer between draws
    let seed = 1337;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = 0; i < 10; i++) {
      g.fillRect(rand() * TILE, rand() * TILE, 3, 3);
    }
    g.generateTexture(key, TILE, TILE);
    g.destroy();
  }

  private makeRoadTile() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.road, 1).fillRect(0, 0, TILE, TILE);
    g.generateTexture("tile-road", TILE, TILE);
    g.destroy();
  }

  private makeSidewalkTile() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.sidewalk, 1).fillRect(0, 0, TILE, TILE);
    g.lineStyle(1, 0x000000, 0.08).strokeRect(0, 0, TILE, TILE);
    g.generateTexture("tile-sidewalk", TILE, TILE);
    g.destroy();
  }

  private makePlayer() {
    const size = 26;
    const g = this.add.graphics();
    g.fillStyle(COLORS.playerOutline, 1).fillCircle(size / 2, size / 2, size / 2);
    g.fillStyle(COLORS.player, 1).fillCircle(size / 2, size / 2, size / 2 - 3);
    // facing nub (points +x / east, matching rotation=0)
    g.fillStyle(COLORS.playerOutline, 1).fillCircle(size - 4, size / 2, 3);
    g.generateTexture("player", size, size);
    g.destroy();
  }

  private makePed() {
    const size = 14;
    const g = this.add.graphics();
    g.fillStyle(0x2a1e26, 1).fillCircle(size / 2, size / 2, size / 2);
    g.fillStyle(COLORS.ped, 1).fillCircle(size / 2, size / 2, size / 2 - 2);
    g.generateTexture("ped", size, size);
    g.destroy();
  }

  // Top-down cow: rounded white body pointing east, dark spots + a head nub.
  private makeCow() {
    const w = 30;
    const h = 20;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.2).fillEllipse(w / 2 + 1, h / 2 + 2, w, h);
    g.fillStyle(COLORS.cow, 1).fillRoundedRect(2, 1, w - 4, h - 2, 7);
    // spots
    g.fillStyle(COLORS.cowSpot, 1);
    g.fillCircle(w * 0.4, h * 0.4, 3.5);
    g.fillCircle(w * 0.6, h * 0.62, 2.8);
    // head at the front (east)
    g.fillStyle(COLORS.cow, 1).fillCircle(w - 3, h / 2, 4.5);
    g.fillStyle(0xf6b8c8, 1).fillCircle(w - 1, h / 2, 2); // snout
    g.generateTexture("cow", w + 2, h + 4);
    g.destroy();
  }

  // Draws a top-down car pointing east (+x) so sprite.rotation maps to heading.
  private makeVehicle(spec: VehicleSpec) {
    const w = spec.width;
    const h = spec.height;
    const g = this.add.graphics();

    // shadow
    g.fillStyle(0x000000, 0.25).fillRoundedRect(3, 4, w, h, 6);
    // body
    g.fillStyle(spec.bodyColor, 1).fillRoundedRect(0, 0, w, h, 6);
    // roof / cabin accent
    g.fillStyle(spec.accentColor, 1).fillRoundedRect(w * 0.32, h * 0.2, w * 0.4, h * 0.6, 4);
    // windshield hint toward front
    g.fillStyle(0x111418, 0.55).fillRoundedRect(w * 0.66, h * 0.22, w * 0.14, h * 0.56, 3);
    // headlights at the front (east edge)
    g.fillStyle(0xfff6c2, 1);
    g.fillCircle(w - 3, h * 0.22, 2.5);
    g.fillCircle(w - 3, h * 0.78, 2.5);

    if (spec.farmJob) {
      // chunky rear wheels give the task tractors their agricultural character
      g.fillStyle(0x1a1a1a, 1);
      g.fillCircle(w * 0.2, 2, 6);
      g.fillCircle(w * 0.2, h - 2, 6);

      // a job-specific implement hanging off the front of the tractor
      if (spec.farmJob === "plow") {
        // three plow discs
        g.fillStyle(0xc9ccd1, 1);
        g.fillTriangle(w, h * 0.2, w + 5, h * 0.1, w + 5, h * 0.3);
        g.fillTriangle(w, h * 0.5, w + 5, h * 0.4, w + 5, h * 0.6);
        g.fillTriangle(w, h * 0.8, w + 5, h * 0.7, w + 5, h * 0.9);
      } else if (spec.farmJob === "seed") {
        // seed hopper on the back
        g.fillStyle(0x6b4a2f, 1).fillRoundedRect(-4, h * 0.28, 10, h * 0.44, 2);
      } else if (spec.farmJob === "harvest") {
        // wide reel bar across the front
        g.fillStyle(0x8a5a2b, 1).fillRect(w, 2, 5, h - 4);
      }
    }

    if (spec.emergency) {
      // roof light bar (red/blue for police, red/white for fire)
      const a = spec.emergency === "police" ? 0x2f6fd0 : 0xffffff;
      const b = 0xff3030;
      g.fillStyle(a, 1).fillRect(w * 0.42, h * 0.28, w * 0.08, h * 0.44);
      g.fillStyle(b, 1).fillRect(w * 0.5, h * 0.28, w * 0.08, h * 0.44);
    }

    g.generateTexture(`veh-${spec.key}`, w + 8, h + 6);
    g.destroy();
  }

  // A darker, furrowed soil patch shown once a plot is tilled/planted.
  private makeTilled() {
    const g = this.add.graphics();
    g.fillStyle(0x4a3320, 1).fillRect(0, 0, TILE, TILE);
    g.lineStyle(2, 0x382618, 0.7);
    for (let i = 1; i < 5; i++) {
      const y = (TILE / 5) * i;
      g.lineBetween(4, y, TILE - 4, y);
    }
    g.generateTexture("tilled", TILE, TILE);
    g.destroy();
  }

  // One texture per growth stage: a sprout, a bushier plant, then a ripe crop.
  private makeCrop(spec: CropSpec) {
    for (let stage = 0; stage < spec.stages; stage++) {
      const ripe = stage === spec.stages - 1;
      const g = this.add.graphics();
      const cx = TILE / 2;
      const baseY = TILE * 0.72;
      const t = (stage + 1) / spec.stages; // 0..1 size factor
      const leafColor = ripe ? spec.leafColor : Phaser.Display.Color.IntegerToColor(spec.sproutColor).color;

      // three little leaves fanning up, growing with stage
      const h = 10 + t * 22;
      g.lineStyle(3, leafColor, 1);
      g.lineBetween(cx, baseY, cx, baseY - h);
      g.lineBetween(cx, baseY, cx - 6 * t - 2, baseY - h * 0.7);
      g.lineBetween(cx, baseY, cx + 6 * t + 2, baseY - h * 0.7);

      if (ripe) {
        // a ripe fruit/root peeking at the base
        g.fillStyle(spec.ripeColor, 1);
        g.fillCircle(cx, baseY + 2, 6);
        g.fillStyle(0xffffff, 0.25);
        g.fillCircle(cx - 2, baseY, 2);
      }

      g.generateTexture(`crop-${spec.key}-${stage}`, TILE, TILE);
      g.destroy();
    }
  }
}
