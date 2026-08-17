import Phaser from "phaser";
import { CROPS, CropSpec, DEFAULT_CROP, FarmJob, TILE } from "../config";

export type PlotState = "untilled" | "tilled" | "growing" | "ripe";

// What a plot wants next — drives HUD hints ("grab the Seeder", etc.).
export type PlotNeed = "plow" | "seed" | "wait" | "harvest";

// One soil cell cycling through the field loop:
//   untilled --(Plow)--> tilled --(Seeder)--> growing --(time)--> ripe
//   ripe --(Harvester/hand)--> untilled   (loop repeats)
class Plot {
  state: PlotState = "untilled";
  stage = 0;
  private timer = 0;
  private crop: CropSpec | null = null;
  readonly x: number;
  readonly y: number;
  private tilled: Phaser.GameObjects.Image;
  private plant: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, tx: number, ty: number) {
    this.x = tx * TILE + TILE / 2;
    this.y = ty * TILE + TILE / 2;
    this.tilled = scene.add.image(this.x, this.y, "tilled").setDepth(-9).setVisible(false);
    this.plant = scene.add.image(this.x, this.y, "crop-carrot-0").setDepth(1).setVisible(false);
  }

  get need(): PlotNeed {
    switch (this.state) {
      case "untilled":
        return "plow";
      case "tilled":
        return "seed";
      case "growing":
        return "wait";
      case "ripe":
        return "harvest";
    }
  }

  till(): boolean {
    if (this.state !== "untilled") return false;
    this.state = "tilled";
    this.tilled.setVisible(true).setScale(0.6);
    return true;
  }

  seed(scene: Phaser.Scene, spec: CropSpec): boolean {
    if (this.state !== "tilled") return false;
    this.crop = spec;
    this.state = "growing";
    this.stage = 0;
    this.timer = 0;
    this.plant.setTexture(`crop-${spec.key}-0`).setVisible(true).setScale(0.4);
    scene.tweens.add({ targets: this.plant, scale: 1, duration: 220, ease: "Back.out" });
    return true;
  }

  advance(dtSec: number) {
    if (this.state !== "growing" || !this.crop) return;
    this.timer += dtSec;
    if (this.timer >= this.crop.growSeconds) {
      this.timer = 0;
      this.stage++;
      this.plant.setTexture(`crop-${this.crop.key}-${this.stage}`);
      if (this.stage >= this.crop.stages - 1) this.state = "ripe";
    }
  }

  harvest(scene: Phaser.Scene): number {
    if (this.state !== "ripe" || !this.crop) return 0;
    const value = this.crop.value;
    const plant = this.plant;
    scene.tweens.add({
      targets: plant,
      y: this.y - 18,
      alpha: 0,
      scale: 1.3,
      duration: 260,
      ease: "Quad.out",
      onComplete: () => plant.setVisible(false).setAlpha(1).setScale(1).setY(this.y),
    });
    this.tilled.setVisible(false); // reaped soil goes back to untilled
    this.state = "untilled";
    this.stage = 0;
    this.crop = null;
    return value;
  }
}

export interface FieldResult {
  changed: boolean;
  produce: number; // crops gained (harvest only) — sold later at the market
}

// Owns every crop plot on the farm field and runs the plow/seed/grow/harvest loop.
export class FarmField {
  private scene: Phaser.Scene;
  private plots = new Map<string, Plot>();

  constructor(scene: Phaser.Scene, tiles: Array<{ tx: number; ty: number }>) {
    this.scene = scene;
    for (const { tx, ty } of tiles) {
      this.plots.set(key(tx, ty), new Plot(scene, tx, ty));
    }
  }

  update(dtSec: number) {
    for (const plot of this.plots.values()) plot.advance(dtSec);
  }

  plotAtWorld(x: number, y: number): Plot | undefined {
    return this.plots.get(key(Math.floor(x / TILE), Math.floor(y / TILE)));
  }

  // Apply a job to the plot under (x, y). `hand` is on-foot: harvest only.
  // Harvesting yields produce (sold later at the market), not instant cash.
  interact(x: number, y: number, job: FarmJob | "hand"): FieldResult {
    const plot = this.plotAtWorld(x, y);
    if (!plot) return { changed: false, produce: 0 };

    if (job === "plow") return { changed: plot.till(), produce: 0 };
    if (job === "seed") return { changed: plot.seed(this.scene, CROPS[DEFAULT_CROP]), produce: 0 };

    // harvest or hand: one crop per ripe plot
    const reaped = plot.harvest(this.scene) > 0;
    return { changed: reaped, produce: reaped ? 1 : 0 };
  }

  get plotCount(): number {
    return this.plots.size;
  }
}

function key(tx: number, ty: number): string {
  return `${tx},${ty}`;
}
