import Phaser from "phaser";
import { VehicleSpec } from "../config";

export interface DriveInput {
  throttle: number; // -1 reverse/brake .. +1 forward
  steer: number; // -1 left .. +1 right
}

// Top-down arcade car. We keep forward/lateral speed in the car's own frame and
// recompose into the arcade body velocity each frame. Lateral grip bleeds off
// sideways momentum, giving the GTA-1 "plant and turn, slide when pushed" feel.
export class Vehicle extends Phaser.Physics.Arcade.Image {
  readonly spec: VehicleSpec;

  constructor(scene: Phaser.Scene, x: number, y: number, spec: VehicleSpec) {
    super(scene, x, y, `veh-${spec.key}`);
    this.spec = spec;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(0.15);
    // Tighten the collision body a touch inside the drawn sprite.
    body.setSize(spec.width * 0.9, spec.height * 0.9, true);
    this.setDepth(5);
  }

  drive(input: DriveInput, dtSec: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const spec = this.spec;

    const fwd = new Phaser.Math.Vector2(Math.cos(this.rotation), Math.sin(this.rotation));
    const right = new Phaser.Math.Vector2(-fwd.y, fwd.x);

    const vel = new Phaser.Math.Vector2(body.velocity.x, body.velocity.y);
    let fSpeed = vel.dot(fwd);
    let sSpeed = vel.dot(right);

    // Longitudinal: throttle, brake, reverse, or coast.
    if (input.throttle > 0) {
      fSpeed += spec.accel * input.throttle * dtSec;
    } else if (input.throttle < 0) {
      if (fSpeed > 4) {
        fSpeed -= spec.braking * dtSec; // braking while moving forward
      } else {
        fSpeed -= spec.accel * 0.6 * dtSec; // then reverse
      }
    } else {
      const coast = 180 * spec.drag * dtSec;
      fSpeed -= Math.sign(fSpeed) * Math.min(Math.abs(fSpeed), coast);
    }
    fSpeed = Phaser.Math.Clamp(fSpeed, -spec.reverseMax, spec.maxSpeed);

    // Lateral grip: kill sideways drift (higher grip = kills it faster).
    sSpeed *= Math.max(0, 1 - spec.grip * 9 * dtSec);

    // Steering scales with speed and reverses when driving backward.
    const speedFactor = Phaser.Math.Clamp(Math.abs(fSpeed) / 110, 0, 1);
    const dir = fSpeed >= 0 ? 1 : -1;
    if (speedFactor > 0.01) {
      this.rotation += input.steer * spec.turnRate * dtSec * speedFactor * dir;
    }

    const newVel = fwd.scale(fSpeed).add(right.scale(sSpeed));
    body.setVelocity(newVel.x, newVel.y);
  }

  get speed(): number {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return body.velocity.length();
  }

  parkAndIdle() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }
}
