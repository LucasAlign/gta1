import Phaser from "phaser";
import { COLORS, HERD, TILE } from "../config";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// A single cow. Grazes and wanders until the player/vehicle gets close, then
// flees directly away. Once it's pushed inside the pen it "settles" (freezes),
// so herding progress only ever moves forward.
class Cow {
  sprite: Phaser.Physics.Arcade.Image;
  penned = false;
  private wanderT = 0;
  private wanderDir = new Phaser.Math.Vector2(1, 0);

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.image(x, y, "cow").setDepth(5);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.sprite.width * 0.8, this.sprite.height * 0.7, true);
    body.setBounce(0.2);
  }

  update(dtSec: number, herderX: number, herderY: number, pen: Rect) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    if (this.penned) {
      body.setVelocity(0, 0);
      return;
    }

    // settle once inside the pen
    if (inside(this.sprite.x, this.sprite.y, pen)) {
      this.penned = true;
      body.setVelocity(0, 0);
      return;
    }

    const dx = this.sprite.x - herderX;
    const dy = this.sprite.y - herderY;
    const dist = Math.hypot(dx, dy) || 1;

    if (dist < HERD.fleeRadius) {
      // flee directly away from the herder
      const v = new Phaser.Math.Vector2(dx / dist, dy / dist).scale(HERD.fleeSpeed);
      body.setVelocity(v.x, v.y);
      this.sprite.rotation = v.angle();
    } else {
      // gentle wander, changing heading every so often
      this.wanderT -= dtSec;
      if (this.wanderT <= 0) {
        this.wanderT = Phaser.Math.FloatBetween(0.8, 2.2);
        this.wanderDir = new Phaser.Math.Vector2(
          Phaser.Math.FloatBetween(-1, 1),
          Phaser.Math.FloatBetween(-1, 1)
        ).normalize();
      }
      body.setVelocity(this.wanderDir.x * HERD.wanderSpeed, this.wanderDir.y * HERD.wanderSpeed);
      if (body.velocity.lengthSq() > 1) this.sprite.rotation = body.velocity.angle();
    }
  }

  reset(x: number, y: number) {
    this.penned = false;
    this.sprite.setPosition(x, y);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }
}

// A fenced pasture with a herd and a corner pen. Push all the cows into the pen
// to complete a round and earn a reward; a fresh round then scatters them again.
export class CowPasture {
  readonly bounds: Rect;
  readonly pen: Rect;
  readonly fences: Phaser.Physics.Arcade.StaticGroup;
  readonly cowGroup: Phaser.Physics.Arcade.Group;
  private scene: Phaser.Scene;
  private cows: Cow[] = [];
  private justCompleted = false;

  constructor(scene: Phaser.Scene, bounds: Rect) {
    this.scene = scene;
    this.bounds = bounds;
    this.fences = scene.physics.add.staticGroup();
    this.cowGroup = scene.physics.add.group();

    // pen: bottom-right corner, 2x2 tiles, opening faces into the pasture
    const pw = 2 * TILE;
    const ph = 2 * TILE;
    this.pen = { x: bounds.x + bounds.w - pw, y: bounds.y + bounds.h - ph, w: pw, h: ph };

    this.drawGround();
    this.buildFences();
    this.drawPen();
    this.spawnCows();
  }

  private drawGround() {
    // subtle darker grass patch so the pasture reads as its own place
    this.scene.add
      .rectangle(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h, 0x3f6a2c, 0.35)
      .setOrigin(0, 0)
      .setDepth(-9);
    this.scene.add
      .text(this.bounds.x + this.bounds.w / 2, this.bounds.y + 12, "PASTURE", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        color: "#eaf3d8",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(-8);
  }

  // A perimeter rail that only collides with cows (the player/vehicles step over
  // it), so cows are always contained and can never escape onto the road.
  private buildFences() {
    const b = this.bounds;
    const t = 6;
    const edges: Rect[] = [
      { x: b.x, y: b.y, w: b.w, h: t }, // top
      { x: b.x, y: b.y + b.h - t, w: b.w, h: t }, // bottom
      { x: b.x, y: b.y, w: t, h: b.h }, // left
      { x: b.x + b.w - t, y: b.y, w: t, h: b.h }, // right
    ];
    for (const e of edges) this.addFence(e);
  }

  private drawPen() {
    const p = this.pen;
    const t = 6;
    // fence the two interior-facing sides, leaving a gap on the top edge as the gate
    const gate = TILE; // one-tile opening
    // left side (full)
    this.addFence({ x: p.x, y: p.y, w: t, h: p.h });
    // top side split around a central gate
    const half = (p.w - gate) / 2;
    this.addFence({ x: p.x, y: p.y, w: half, h: t });
    this.addFence({ x: p.x + p.w - half, y: p.y, w: half, h: t });

    // pen floor tint
    this.scene.add
      .rectangle(p.x, p.y, p.w, p.h, COLORS.pen, 0.25)
      .setOrigin(0, 0)
      .setDepth(-9);
  }

  private addFence(r: Rect) {
    const rect = this.scene.add.rectangle(r.x + r.w / 2, r.y + r.h / 2, r.w, r.h, COLORS.fence, 1);
    rect.setDepth(1);
    this.fences.add(rect);
    (rect.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
  }

  private spawnCows() {
    for (let i = 0; i < HERD.cows; i++) {
      const pos = this.scatterPoint();
      const cow = new Cow(this.scene, pos.x, pos.y);
      this.cowGroup.add(cow.sprite);
      this.cows.push(cow);
    }
  }

  // A point in the pasture interior, away from the pen.
  private scatterPoint() {
    const m = 30;
    for (let tries = 0; tries < 20; tries++) {
      const x = Phaser.Math.Between(this.bounds.x + m, this.bounds.x + this.bounds.w - m);
      const y = Phaser.Math.Between(this.bounds.y + m, this.bounds.y + this.bounds.h - m);
      if (!inside(x, y, this.pen)) return { x, y };
    }
    return { x: this.bounds.x + m, y: this.bounds.y + m };
  }

  get progress(): { penned: number; total: number } {
    return { penned: this.cows.filter((c) => c.penned).length, total: this.cows.length };
  }

  get minimapMarker() {
    return { x: this.pen.x + this.pen.w / 2, y: this.pen.y + this.pen.h / 2, color: COLORS.pen };
  }

  contains(x: number, y: number): boolean {
    return inside(x, y, this.bounds);
  }

  // Returns reward cash when a round is completed this frame, else 0.
  update(dtSec: number, herderX: number, herderY: number): number {
    for (const c of this.cows) c.update(dtSec, herderX, herderY, this.pen);

    const { penned, total } = this.progress;
    if (penned === total && !this.justCompleted) {
      this.justCompleted = true;
      this.scene.time.delayedCall(1400, () => this.startNewRound());
      return HERD.reward;
    }
    return 0;
  }

  private startNewRound() {
    for (const c of this.cows) c.reset(this.scatterPoint().x, this.scatterPoint().y);
    this.justCompleted = false;
  }
}

function inside(x: number, y: number, r: Rect): boolean {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}
