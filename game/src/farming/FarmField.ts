import Phaser from "phaser";
import { CROPS, CropSpec, DEFAULT_CROP, TILE } from "../config";

type PlotState = "empty" | "growing" | "ripe";

// One soil cell. Holds its own growth timer and two sprites (tilled patch + crop)
// so the field can advance thousands of plots cheaply.
class Plot {
  state: PlotState = "empty";
  stage = 0;
  timer = 0;
  crop: CropSpec | null = null;
  readonly tx: number;
  readonly ty: number;
  readonly x: number;
  readonly y: number;
  private tilled: Phaser.GameObjects.Image;
  private plant: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, tx: number, ty: number) {
    this.tx = tx;
    this.ty = ty;
    this.x = tx * TILE + TILE / 2;
    this.y = ty * TILE + TILE / 2;
    this.tilled = scene.add.image(this.x, this.y, "tilled").setDepth(-9).setVisible(false);
    this.plant = scene.add.image(this.x, this.y, "crop-carrot-0").setDepth(1).setVisible(false);
  }

  plant_(scene: Phaser.Scene, spec: CropSpec) {
    this.crop = spec;
    this.state = "growing";
    this.stage = 0;
    this.timer = 0;
    this.tilled.setVisible(true);
    this.plant.setTexture(`crop-${spec.key}-0`).setVisible(true).setScale(0.4);
    scene.tweens.add({ targets: this.plant, scale: 1, duration: 220, ease: "Back.out" });
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

  harvest_(scene: Phaser.Scene): number {
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
    this.tilled.setVisible(false);
    this.state = "empty";
    this.stage = 0;
    this.crop = null;
    return value;
  }
}

// Owns every crop plot on the farm field and the plant/grow/harvest loop.
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

  // Drive/step onto a plot: plant an empty one, harvest a ripe one, else nothing.
  // Returns cash gained (0 unless a harvest happened).
  interact(x: number, y: number): { planted: boolean; cash: number } {
    const plot = this.plotAtWorld(x, y);
    if (!plot) return { planted: false, cash: 0 };
    if (plot.state === "empty") {
      plot.plant_(this.scene, CROPS[DEFAULT_CROP]);
      return { planted: true, cash: 0 };
    }
    if (plot.state === "ripe") {
      return { planted: false, cash: plot.harvest_(this.scene) };
    }
    return { planted: false, cash: 0 };
  }

  get plotCount(): number {
    return this.plots.size;
  }
}

function key(tx: number, ty: number): string {
  return `${tx},${ty}`;
}
