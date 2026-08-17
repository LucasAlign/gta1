import Phaser from "phaser";
import { COLORS, SHOP, VEHICLES } from "../config";

export interface BuyResult {
  ok: boolean;
  cost: number;
  message: string;
}

// A fixed roadside shop. Standing near it and pressing B spends cash on the
// "Tractor Turbo" upgrade, which mutates the shared tractor spec so the boost
// applies to every tractor immediately (speed + acceleration).
export class Shop {
  readonly x: number;
  readonly y: number;
  private level = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;

    const fill = scene.add.circle(x, y, 26, COLORS.shop, 0.22);
    const ring = scene.add.circle(x, y, 26).setStrokeStyle(3, COLORS.shop, 0.95);
    scene.add
      .text(x, y, "$", {
        fontFamily: "ui-monospace, monospace",
        fontSize: "26px",
        color: "#e9deff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(3);
    scene.add.existing(fill.setDepth(2));
    scene.add.existing(ring.setDepth(2));
    scene.tweens.add({
      targets: ring,
      scale: 1.25,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  get price(): number {
    return SHOP.turboBasePrice + SHOP.turboPriceStep * this.level;
  }

  get maxed(): boolean {
    return this.level >= SHOP.turboMaxLevel;
  }

  contains(px: number, py: number): boolean {
    return Phaser.Math.Distance.Between(px, py, this.x, this.y) < SHOP.radius;
  }

  promptText(cash: number): string {
    if (this.maxed) return "Tractor fully upgraded";
    if (cash < this.price) return `Need $${this.price} for Tractor Turbo (Lv ${this.level + 1})`;
    return `Press B — Tractor Turbo Lv ${this.level + 1}  ($${this.price})`;
  }

  buy(cash: number): BuyResult {
    if (this.maxed) return { ok: false, cost: 0, message: "Tractor already maxed" };
    const cost = this.price;
    if (cash < cost) return { ok: false, cost: 0, message: `Need $${cost}` };

    this.level++;
    // Apply the boost to every task tractor (plow/seeder/harvester).
    for (const spec of Object.values(VEHICLES)) {
      if (!spec.farmJob) continue;
      spec.maxSpeed += SHOP.turboSpeedPerLevel;
      spec.accel += SHOP.turboAccelPerLevel;
    }
    return { ok: true, cost, message: `Tractor Turbo Lv ${this.level}!` };
  }

  get minimapMarker() {
    return { x: this.x, y: this.y, color: COLORS.shop };
  }
}
