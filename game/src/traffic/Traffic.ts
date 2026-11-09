import Phaser from "phaser";
import {
  INTERSECTIONS_X,
  INTERSECTIONS_Y,
  TRAFFIC_TINTS,
  intersectionPx,
} from "../config";

const LANE_OFFSET = 13; // px to the right of travel = right-hand traffic
const ARRIVE_DIST = 16;

// One ambient car that hops between road intersections. It steers toward its
// current target intersection (offset into the right-hand lane); on arrival it
// picks a new neighbouring intersection, avoiding an immediate U-turn.
class TrafficCar {
  sprite: Phaser.Physics.Arcade.Image;
  private tix: number;
  private tiy: number;
  private pix: number;
  private piy: number;
  private speed: number;

  constructor(scene: Phaser.Scene, ix: number, iy: number) {
    this.tix = ix;
    this.tiy = iy;
    this.pix = ix;
    this.piy = iy;
    this.speed = Phaser.Math.Between(120, 190);

    const p = intersectionPx(ix, iy);
    this.sprite = scene.physics.add.image(p.x, p.y, "veh-hatchback");
    this.sprite.setTint(Phaser.Utils.Array.GetRandom(TRAFFIC_TINTS));
    this.sprite.setDepth(4);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.sprite.width * 0.8, this.sprite.height * 0.8, true);
    this.pickNextTarget();
  }

  private pickNextTarget() {
    const opts: Array<[number, number]> = [];
    const cand: Array<[number, number]> = [
      [this.tix + 1, this.tiy],
      [this.tix - 1, this.tiy],
      [this.tix, this.tiy + 1],
      [this.tix, this.tiy - 1],
    ];
    for (const [nx, ny] of cand) {
      if (nx < 0 || ny < 0 || nx >= INTERSECTIONS_X || ny >= INTERSECTIONS_Y) continue;
      if (nx === this.pix && ny === this.piy) continue; // no U-turn
      opts.push([nx, ny]);
    }
    const pool = opts.length ? opts : [[this.pix, this.piy] as [number, number]];
    const [nx, ny] = Phaser.Utils.Array.GetRandom(pool);
    this.pix = this.tix;
    this.piy = this.tiy;
    this.tix = nx;
    this.tiy = ny;
  }

  update() {
    const target = intersectionPx(this.tix, this.tiy);
    const from = intersectionPx(this.pix, this.piy);
    const dir = new Phaser.Math.Vector2(target.x - from.x, target.y - from.y).normalize();
    const rightN = new Phaser.Math.Vector2(-dir.y, dir.x).scale(LANE_OFFSET);

    // Steer toward the target intersection, offset into the right-hand lane.
    // Steering toward this point (rather than a fixed heading) keeps cars in
    // lane and lets them recover if the player bumps them.
    const aim = new Phaser.Math.Vector2(target.x + rightN.x, target.y + rightN.y);
    const desired = new Phaser.Math.Vector2(aim.x - this.sprite.x, aim.y - this.sprite.y);
    if (desired.lengthSq() > 0.001) desired.normalize().scale(this.speed);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(desired.x, desired.y);
    this.sprite.rotation = desired.angle();

    if (Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, target.x, target.y) < ARRIVE_DIST) {
      this.pickNextTarget();
    }
  }
}

export class Traffic {
  readonly group: Phaser.Physics.Arcade.Group;
  private cars: TrafficCar[] = [];

  constructor(scene: Phaser.Scene, count: number) {
    this.group = scene.physics.add.group();
    for (let i = 0; i < count; i++) {
      const ix = Phaser.Math.Between(0, INTERSECTIONS_X - 1);
      const iy = Phaser.Math.Between(0, INTERSECTIONS_Y - 1);
      const car = new TrafficCar(scene, ix, iy);
      this.group.add(car.sprite);
      this.cars.push(car);
    }
  }

  update() {
    for (const c of this.cars) c.update();
  }
}
