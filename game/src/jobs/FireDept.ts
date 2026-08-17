import Phaser from "phaser";
import { COLORS, FIRE_JOB } from "../config";

interface Point {
  x: number;
  y: number;
}

// A single building fire: flame graphics + an intensity that only drops while
// the fire truck is parked close (spraying).
class Fire {
  readonly x: number;
  readonly y: number;
  intensity = FIRE_JOB.intensity;
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

  spray(dtSec: number) {
    this.intensity -= FIRE_JOB.extinguishRate * dtSec;
    this.flames.setScale(Math.max(0.4, this.intensity / FIRE_JOB.intensity));
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

  // Returns reward cash earned this frame (per fire extinguished).
  update(dtSec: number, onDuty: boolean, truck: Point): number {
    if (onDuty) {
      this.spawnTimer -= dtSec;
      if (this.spawnTimer <= 0 && this.fires.length < FIRE_JOB.maxActive) {
        this.spawnTimer = FIRE_JOB.spawnInterval;
        this.spawnFire();
      }
    }

    let reward = 0;
    for (let i = this.fires.length - 1; i >= 0; i--) {
      const fire = this.fires[i];
      if (
        onDuty &&
        Phaser.Math.Distance.Between(truck.x, truck.y, fire.x, fire.y) < FIRE_JOB.extinguishRadius
      ) {
        fire.spray(dtSec);
        if (fire.intensity <= 0) {
          fire.destroy();
          this.fires.splice(i, 1);
          reward += FIRE_JOB.reward;
        }
      }
    }
    return reward;
  }

  private spawnFire() {
    // avoid stacking two fires on the same building
    const free = this.sites.filter(
      (s) => !this.fires.some((f) => f.x === s.x && f.y === s.y)
    );
    if (!free.length) return;
    const site = Phaser.Utils.Array.GetRandom(free);
    this.fires.push(new Fire(this.scene, site.x, site.y));
  }

  get activeCount(): number {
    return this.fires.length;
  }

  get minimapMarkers() {
    return this.fires.map((f) => ({ x: f.x, y: f.y, color: COLORS.fire }));
  }
}
