import Phaser from "phaser";
import { INTERSECTIONS_X, INTERSECTIONS_Y, POLICE_JOB, intersectionPx } from "../config";

interface Point {
  x: number;
  y: number;
}

// A fleeing suspect car that runs along the road lattice, always choosing the
// exit that takes it farthest from the pursuing police car.
class Suspect {
  x: number;
  y: number;
  private tix: number;
  private tiy: number;
  private pix: number;
  private piy: number;
  private sprite: Phaser.GameObjects.Image;
  private ring: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, ix: number, iy: number, police: Point) {
    this.tix = ix;
    this.tiy = iy;
    this.pix = ix;
    this.piy = iy;
    const p = intersectionPx(ix, iy);
    this.x = p.x;
    this.y = p.y;

    this.sprite = scene.add.image(p.x, p.y, "veh-hatchback").setTint(0xd63384).setDepth(6);
    this.ring = scene.add.circle(p.x, p.y, 26).setStrokeStyle(3, 0xff4d6d, 0.9).setDepth(6);
    scene.tweens.add({
      targets: this.ring,
      scale: 1.4,
      alpha: 0.25,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
    this.pickFleeTarget(police);
  }

  private neighbours(ix: number, iy: number): Array<[number, number]> {
    const cand: Array<[number, number]> = [
      [ix + 1, iy],
      [ix - 1, iy],
      [ix, iy + 1],
      [ix, iy - 1],
    ];
    return cand.filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < INTERSECTIONS_X && ny < INTERSECTIONS_Y);
  }

  private pickFleeTarget(police: Point) {
    let opts = this.neighbours(this.tix, this.tiy).filter(
      ([nx, ny]) => !(nx === this.pix && ny === this.piy)
    );
    if (!opts.length) opts = this.neighbours(this.tix, this.tiy);

    // choose the neighbour whose center is farthest from the police car
    let best = opts[0];
    let bestDist = -1;
    for (const [nx, ny] of opts) {
      const c = intersectionPx(nx, ny);
      const d = Phaser.Math.Distance.Between(c.x, c.y, police.x, police.y);
      if (d > bestDist) {
        bestDist = d;
        best = [nx, ny];
      }
    }
    this.pix = this.tix;
    this.piy = this.tiy;
    this.tix = best[0];
    this.tiy = best[1];
  }

  update(dtSec: number, police: Point, speed: number) {
    const target = intersectionPx(this.tix, this.tiy);
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const step = Math.min(dist, speed * dtSec);
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    this.sprite.setPosition(this.x, this.y).setRotation(Math.atan2(dy, dx));
    this.ring.setPosition(this.x, this.y);

    if (dist < 12) this.pickFleeTarget(police);
  }

  destroy() {
    this.sprite.destroy();
    this.ring.destroy();
  }
}

// Police job. Active only while driving the police car. A suspect flees the
// road network; get within catch range to bust them for a reward, then another
// suspect appears after a short delay.
export class Police {
  private scene: Phaser.Scene;
  private suspect: Suspect | null = null;
  private respawnTimer = 1.5;
  private chaseTime = 0;
  private wantedLevel = 1;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // Returns reward cash when a suspect is busted this frame, else 0. The reward
  // scales with the wanted level the chase reached.
  update(dtSec: number, onDuty: boolean, police: Point): number {
    if (!onDuty) {
      if (this.suspect) {
        this.suspect.destroy();
        this.suspect = null;
      }
      this.respawnTimer = 1.2;
      this.chaseTime = 0;
      this.wantedLevel = 1;
      return 0;
    }

    if (!this.suspect) {
      this.respawnTimer -= dtSec;
      if (this.respawnTimer <= 0) this.spawnSuspect(police);
      return 0;
    }

    // escalate: the longer the chase, the higher the wanted level
    this.chaseTime += dtSec;
    this.wantedLevel = Math.min(
      POLICE_JOB.maxWanted,
      Math.floor(this.chaseTime / POLICE_JOB.escalateInterval) + 1
    );
    const speed = POLICE_JOB.suspectSpeed * (1 + (this.wantedLevel - 1) * POLICE_JOB.speedStep);

    this.suspect.update(dtSec, police, speed);
    if (Phaser.Math.Distance.Between(this.suspect.x, this.suspect.y, police.x, police.y) < POLICE_JOB.catchRadius) {
      const reward = POLICE_JOB.reward * this.wantedLevel;
      this.suspect.destroy();
      this.suspect = null;
      this.respawnTimer = POLICE_JOB.respawnDelay;
      this.chaseTime = 0;
      this.wantedLevel = 1;
      return reward;
    }
    return 0;
  }

  get wanted(): number {
    return this.suspect ? this.wantedLevel : 0;
  }

  private spawnSuspect(police: Point) {
    // spawn at a far corner-ish intersection so there's a chase
    let ix = 0;
    let iy = 0;
    let bestD = -1;
    for (let t = 0; t < 8; t++) {
      const cx = Phaser.Math.Between(0, INTERSECTIONS_X - 1);
      const cy = Phaser.Math.Between(0, INTERSECTIONS_Y - 1);
      const c = intersectionPx(cx, cy);
      const d = Phaser.Math.Distance.Between(c.x, c.y, police.x, police.y);
      if (d > bestD) {
        bestD = d;
        ix = cx;
        iy = cy;
      }
    }
    this.suspect = new Suspect(this.scene, ix, iy, police);
  }

  get hasSuspect(): boolean {
    return this.suspect !== null;
  }

  get minimapMarker() {
    if (!this.suspect) return null;
    return { x: this.suspect.x, y: this.suspect.y, color: 0xff4d6d };
  }
}
