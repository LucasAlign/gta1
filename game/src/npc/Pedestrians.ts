import Phaser from "phaser";
import { BLOCKS_X, BLOCKS_Y, BLOCK_TILES, PERIOD, ROAD_TILES, TILE } from "../config";

// A pedestrian walks the sidewalk ring of one block, looping its four corners.
// Purposeful-looking motion for cheap — no physics, just waypoint stepping.
class Pedestrian {
  private sprite: Phaser.GameObjects.Image;
  private waypoints: Array<{ x: number; y: number }>;
  private idx = 0;
  private speed: number;

  constructor(scene: Phaser.Scene, bx: number, by: number) {
    const originTx = bx * PERIOD + ROAD_TILES;
    const originTy = by * PERIOD + ROAD_TILES;
    const corner = (lx: number, ly: number) => ({
      x: (originTx + lx) * TILE + TILE / 2,
      y: (originTy + ly) * TILE + TILE / 2,
    });
    // clockwise ring, slightly randomised start
    this.waypoints = [
      corner(0, 0),
      corner(BLOCK_TILES - 1, 0),
      corner(BLOCK_TILES - 1, BLOCK_TILES - 1),
      corner(0, BLOCK_TILES - 1),
    ];
    this.idx = Phaser.Math.Between(0, 3);
    this.speed = Phaser.Math.Between(38, 66);

    const p = this.waypoints[this.idx];
    this.sprite = scene.add.image(p.x, p.y, "ped").setDepth(6);
  }

  update(dtSec: number) {
    const wp = this.waypoints[this.idx];
    const dx = wp.x - this.sprite.x;
    const dy = wp.y - this.sprite.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) {
      this.idx = (this.idx + 1) % this.waypoints.length;
      return;
    }
    const step = Math.min(dist, this.speed * dtSec);
    this.sprite.x += (dx / dist) * step;
    this.sprite.y += (dy / dist) * step;
  }
}

export class Pedestrians {
  private peds: Pedestrian[] = [];

  constructor(scene: Phaser.Scene, count: number) {
    for (let i = 0; i < count; i++) {
      const bx = Phaser.Math.Between(0, BLOCKS_X - 1);
      const by = Phaser.Math.Between(0, BLOCKS_Y - 1);
      this.peds.push(new Pedestrian(scene, bx, by));
    }
  }

  update(dtSec: number) {
    for (const p of this.peds) p.update(dtSec);
  }
}
