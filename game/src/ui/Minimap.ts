import Phaser from "phaser";
import {
  BLOCKS_X,
  BLOCKS_Y,
  BLOCK_TILES,
  COLORS,
  PERIOD,
  ROAD_TILES,
  TILE,
  WORLD_H,
  WORLD_W,
} from "../config";

const SIZE = 176; // px square
const MARGIN = 16;

export interface MinimapMarker {
  x: number; // world px
  y: number;
  color: number;
}

// Screen-fixed minimap. The static grid is baked once into a Graphics layer;
// dynamic markers (player, mission, shop) are redrawn each frame on top.
export class Minimap {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private markerG: Phaser.GameObjects.Graphics;
  private scale: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scale = SIZE / Math.max(WORLD_W, WORLD_H);

    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(1100);

    const bg = scene.add.graphics();
    bg.fillStyle(0x0d0f12, 0.72).fillRoundedRect(-4, -4, SIZE + 8, SIZE + 8, 6);
    bg.lineStyle(2, 0xffffff, 0.15).strokeRoundedRect(-4, -4, SIZE + 8, SIZE + 8, 6);
    this.container.add(bg);

    this.container.add(this.bakeGrid());

    this.markerG = scene.add.graphics();
    this.container.add(this.markerG);

    scene.scale.on("resize", () => this.reposition());
    this.reposition();
  }

  private bakeGrid(): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    const s = this.scale;

    // roads as background, blocks painted on top
    g.fillStyle(COLORS.road, 1).fillRect(0, 0, WORLD_W * s, WORLD_H * s);

    for (let by = 0; by < BLOCKS_Y; by++) {
      for (let bx = 0; bx < BLOCKS_X; bx++) {
        const cx = Math.floor(BLOCKS_X / 2);
        const cy = Math.floor(BLOCKS_Y / 2);
        let color = COLORS.building;
        if (bx === cx && by === cy) color = COLORS.soil;
        else if ((bx + by) % 5 === 0) color = COLORS.grass;

        const x = (bx * PERIOD + ROAD_TILES) * TILE * s;
        const y = (by * PERIOD + ROAD_TILES) * TILE * s;
        const w = BLOCK_TILES * TILE * s;
        g.fillStyle(color, 1).fillRect(x, y, w, w);
      }
    }
    return g;
  }

  private reposition() {
    // bottom-left corner
    const h = this.scene.scale.height;
    this.container.setPosition(MARGIN + 4, h - SIZE - MARGIN);
  }

  update(player: { x: number; y: number }, markers: MinimapMarker[]) {
    const s = this.scale;
    this.markerG.clear();

    for (const m of markers) {
      this.markerG.fillStyle(m.color, 1).fillCircle(m.x * s, m.y * s, 3.5);
      this.markerG.lineStyle(1.5, m.color, 0.4).strokeCircle(m.x * s, m.y * s, 6);
    }

    // player on top, white with dark ring
    this.markerG.fillStyle(0xffffff, 1).fillCircle(player.x * s, player.y * s, 3);
    this.markerG.lineStyle(1.5, 0x000000, 0.6).strokeCircle(player.x * s, player.y * s, 3);
  }
}
