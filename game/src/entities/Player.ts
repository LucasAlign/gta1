import Phaser from "phaser";

const WALK_SPEED = 200;

// On-foot character: 8-directional walk, faces the direction of travel.
export class Player extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setCircle(13);
    this.setDepth(6);
  }

  walk(dirX: number, dirY: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const v = new Phaser.Math.Vector2(dirX, dirY);
    if (v.lengthSq() > 0) {
      v.normalize().scale(WALK_SPEED);
      this.rotation = v.angle();
    }
    body.setVelocity(v.x, v.y);
  }

  stop() {
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }
}
