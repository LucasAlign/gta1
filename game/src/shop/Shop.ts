import Phaser from "phaser";
import { COLORS, SHOP, VEHICLES } from "../config";

export interface BuyResult {
  ok: boolean;
  cost: number;
  message: string;
}

// Base tractor stats captured at import (before any purchase), so applying a
// turbo level is absolute-from-base and therefore idempotent — safe to re-apply
// when restoring a saved game.
const BASE_TRACTOR: Record<string, { maxSpeed: number; accel: number }> = {};
for (const spec of Object.values(VEHICLES)) {
  if (spec.farmJob) BASE_TRACTOR[spec.key] = { maxSpeed: spec.maxSpeed, accel: spec.accel };
}

function applyTurbo(level: number) {
  for (const spec of Object.values(VEHICLES)) {
    if (!spec.farmJob) continue;
    const base = BASE_TRACTOR[spec.key];
    spec.maxSpeed = base.maxSpeed + level * SHOP.turboSpeedPerLevel;
    spec.accel = base.accel + level * SHOP.turboAccelPerLevel;
  }
}

// A fixed roadside shop. Standing near it and pressing B spends cash on the
// "Tractor Turbo" upgrade, which mutates the shared tractor spec so the boost
// applies to every tractor immediately (speed + acceleration).
export class Shop {
  readonly x: number;
  readonly y: number;
  private level_ = 0;

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
    return SHOP.turboBasePrice + SHOP.turboPriceStep * this.level_;
  }

  get maxed(): boolean {
    return this.level_ >= SHOP.turboMaxLevel;
  }

  contains(px: number, py: number): boolean {
    return Phaser.Math.Distance.Between(px, py, this.x, this.y) < SHOP.radius;
  }

  promptText(cash: number): string {
    if (this.maxed) return "Tractor fully upgraded";
    if (cash < this.price) return `Need $${this.price} for Tractor Turbo (Lv ${this.level_ + 1})`;
    return `Press B — Tractor Turbo Lv ${this.level_ + 1}  ($${this.price})`;
  }

  buy(cash: number): BuyResult {
    if (this.maxed) return { ok: false, cost: 0, message: "Tractor already maxed" };
    const cost = this.price;
    if (cash < cost) return { ok: false, cost: 0, message: `Need $${cost}` };

    this.level_++;
    applyTurbo(this.level_); // absolute-from-base = idempotent
    return { ok: true, cost, message: `Tractor Turbo Lv ${this.level_}!` };
  }

  get level(): number {
    return this.level_;
  }

  // Restore a saved turbo level (re-applies the boost to the base specs).
  restore(level: number) {
    this.level_ = Phaser.Math.Clamp(level, 0, SHOP.turboMaxLevel);
    applyTurbo(this.level_);
  }

  get minimapMarker() {
    return { x: this.x, y: this.y, color: COLORS.shop };
  }
}
