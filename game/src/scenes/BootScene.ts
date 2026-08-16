import Phaser from "phaser";
import { COLORS, TILE, VEHICLES, VehicleSpec } from "../config";

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

    for (const spec of Object.values(VEHICLES)) {
      this.makeVehicle(spec);
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

    if (spec.key === "tractor") {
      // chunky rear wheels for tractor character
      g.fillStyle(0x1a1a1a, 1);
      g.fillCircle(w * 0.2, 2, 6);
      g.fillCircle(w * 0.2, h - 2, 6);
    }

    g.generateTexture(`veh-${spec.key}`, w + 6, h + 6);
    g.destroy();
  }
}
