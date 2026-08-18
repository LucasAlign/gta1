import Phaser from "phaser";
import {
  COLORS,
  INTERSECTIONS_X,
  INTERSECTIONS_Y,
  MISSION,
  intersectionPx,
} from "../config";

type Phase = "pickup" | "delivery";

// A rolling delivery loop: go to the pickup marker to grab cargo, then reach the
// drop-off marker to earn cash. Completing one immediately offers the next.
export class MissionManager {
  private phase: Phase = "pickup";
  private pickup = { x: 0, y: 0 };
  private dropoff = { x: 0, y: 0 };
  private reward = 0;
  private marker: Phaser.GameObjects.Container;
  private ring: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene) {
    const fill = scene.add.circle(0, 0, 22, 0xffffff, 0.18);
    this.ring = scene.add.circle(0, 0, 22).setStrokeStyle(3, 0xffffff, 0.9);
    this.marker = scene.add.container(0, 0, [fill, this.ring]).setDepth(3);
    scene.tweens.add({
      targets: this.ring,
      scale: 1.35,
      alpha: 0.2,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.newContract();
  }

  private randIntersection() {
    const ix = Phaser.Math.Between(0, INTERSECTIONS_X - 1);
    const iy = Phaser.Math.Between(0, INTERSECTIONS_Y - 1);
    return intersectionPx(ix, iy);
  }

  private newContract() {
    this.pickup = this.randIntersection();
    do {
      this.dropoff = this.randIntersection();
    } while (Phaser.Math.Distance.Between(this.pickup.x, this.pickup.y, this.dropoff.x, this.dropoff.y) < 400);
    this.reward = Phaser.Math.Between(MISSION.minReward, MISSION.maxReward);
    this.phase = "pickup";
    this.moveMarkerTo(this.pickup, COLORS.pickup);
  }

  private moveMarkerTo(pos: { x: number; y: number }, color: number) {
    this.marker.setPosition(pos.x, pos.y);
    this.ring.setStrokeStyle(3, color, 0.9);
    (this.marker.list[0] as Phaser.GameObjects.Arc).setFillStyle(color, 0.18);
  }

  // Returns cash earned this frame (reward on a completed delivery, else 0).
  update(px: number, py: number): number {
    if (this.phase === "pickup") {
      if (Phaser.Math.Distance.Between(px, py, this.pickup.x, this.pickup.y) < MISSION.pickupRadius) {
        this.phase = "delivery";
        this.moveMarkerTo(this.dropoff, COLORS.dropoff);
      }
      return 0;
    }
    // delivery
    if (Phaser.Math.Distance.Between(px, py, this.dropoff.x, this.dropoff.y) < MISSION.dropoffRadius) {
      const earned = this.reward;
      this.newContract();
      return earned;
    }
    return 0;
  }

  get objective(): string {
    return this.phase === "pickup"
      ? `Pick up the delivery  (reward $${this.reward})`
      : `Deliver the cargo  (+$${this.reward})`;
  }

  get minimapMarker() {
    const pos = this.phase === "pickup" ? this.pickup : this.dropoff;
    const color = this.phase === "pickup" ? COLORS.pickup : COLORS.dropoff;
    return { x: pos.x, y: pos.y, color };
  }
}
