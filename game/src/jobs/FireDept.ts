import Phaser from "phaser";
import { COLORS, FIRE_JOB } from "../config";

interface Point {
  x: number;
  y: number;
}

// A single building fire. Intensity drops while the truck sprays it, and grows
// when left unattended — a big enough fire spreads to a neighbour, and a fire
// pinned at max intensity long enough burns the building down (a penalty).
class Fire {
  readonly x: number;
  readonly y: number;
  intensity = FIRE_JOB.intensity;
  spreadTimer = FIRE_JOB.spreadCooldown;
  private atMaxTimer = 0;
  private flames: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;

    const g = scene.add.graphics();
    g.fillStyle(0xffd23f, 1).fillTriangle(-7, 8, 7, 8, 0, -14);
    g.fillStyle(COLORS.fire, 1).fillTriangle(-5, 8, 5, 8, 0, -8);
    const ring = scene.add.circle(0, 4, 20).setStrokeStyle(2, COLORS.fire, 0.5);
    this.flames = scene.add.container(x, y, [ring, g]).setDepth(7);

    scene.tweens.add({
      targets: g,
      scaleY: 1.35,
      scaleX: 0.85,
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
    scene.tweens.add({
      targets: ring,
      scale: 1.4,
      alpha: 0.2,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  private rescale() {
    this.flames.setScale(Math.max(0.4, this.intensity / FIRE_JOB.intensity));
  }

  // Being sprayed: intensity falls. Returns true once extinguished.
  spray(dtSec: number): boolean {
    this.intensity -= FIRE_JOB.extinguishRate * dtSec;
    this.atMaxTimer = 0;
    this.rescale();
    return this.intensity <= 0;
  }

  // Left alone: intensity grows; track spread readiness and burnout timer.
  grow(dtSec: number) {
    this.intensity = Math.min(FIRE_JOB.maxIntensity, this.intensity + FIRE_JOB.growthRate * dtSec);
    this.spreadTimer -= dtSec;
    if (this.intensity >= FIRE_JOB.maxIntensity) this.atMaxTimer += dtSec;
    this.rescale();
  }

  get readyToSpread(): boolean {
    return this.intensity >= FIRE_JOB.spreadThreshold && this.spreadTimer <= 0;
  }

  get burnedOut(): boolean {
    return this.atMaxTimer >= FIRE_JOB.burnoutTime;
  }

  destroy() {
    this.flames.destroy();
  }
}

// Firefighter job. Active only while the player drives the fire truck. Fires
// break out on buildings; park near one to spray it out for a reward.
export class FireDept {
  private scene: Phaser.Scene;
  private sites: Point[];
  private fires: Fire[] = [];
  private spawnTimer = 3;

  constructor(scene: Phaser.Scene, buildingSites: Point[]) {
    this.scene = scene;
    this.sites = buildingSites;
  }

  // Returns cash change this frame: rewards for extinguishing, penalties for
  // buildings that burn down.
  update(dtSec: number, onDuty: boolean, truck: Point): { reward: number; penalty: number } {
    if (onDuty) {
      this.spawnTimer -= dtSec;
      if (this.spawnTimer <= 0 && this.fires.length < FIRE_JOB.maxActive) {
        this.spawnTimer = FIRE_JOB.spawnInterval;
        this.spawnFire();
      }
    }

    let reward = 0;
    let penalty = 0;
    const toSpread: Point[] = [];

    for (let i = this.fires.length - 1; i >= 0; i--) {
      const fire = this.fires[i];
      const spraying =
        onDuty &&
        Phaser.Math.Distance.Between(truck.x, truck.y, fire.x, fire.y) < FIRE_JOB.extinguishRadius;

      if (spraying) {
        if (fire.spray(dtSec)) {
          fire.destroy();
          this.fires.splice(i, 1);
          reward += FIRE_JOB.reward;
        }
        continue;
      }

      // unattended: grow, maybe spread, maybe burn the building down
      fire.grow(dtSec);
      if (fire.readyToSpread && this.fires.length + toSpread.length < FIRE_JOB.hardCap) {
        fire.spreadTimer = FIRE_JOB.spreadCooldown;
        toSpread.push(fire);
      }
      if (fire.burnedOut) {
        fire.destroy();
        this.fires.splice(i, 1);
        penalty += FIRE_JOB.penalty;
      }
    }

    for (const from of toSpread) this.spawnFireNear(from);
    return { reward, penalty };
  }

  private freeSites(): Point[] {
    return this.sites.filter((s) => !this.fires.some((f) => f.x === s.x && f.y === s.y));
  }

  private spawnFire() {
    const free = this.freeSites();
    if (!free.length) return;
    const site = Phaser.Utils.Array.GetRandom(free);
    this.fires.push(new Fire(this.scene, site.x, site.y));
  }

  // Spread: ignite the nearest free building to an existing fire.
  private spawnFireNear(from: Point) {
    const free = this.freeSites();
    if (!free.length) return;
    let best = free[0];
    let bestD = Infinity;
    for (const s of free) {
      const d = Phaser.Math.Distance.Between(from.x, from.y, s.x, s.y);
      if (d > 1 && d < bestD) {
        bestD = d;
        best = s;
      }
    }
    this.fires.push(new Fire(this.scene, best.x, best.y));
  }

  get activeCount(): number {
    return this.fires.length;
  }

  get minimapMarkers() {
    return this.fires.map((f) => ({ x: f.x, y: f.y, color: COLORS.fire }));
  }
}
