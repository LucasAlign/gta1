import Phaser from "phaser";
import { Vehicle } from "../entities/Vehicle";

// Screen-fixed heads-up display. Uses setScrollFactor(0) so it never moves with
// the camera, and stays pinned on window resize.
export class Hud {
  private scene: Phaser.Scene;
  private prompt: Phaser.GameObjects.Text;
  private speed: Phaser.GameObjects.Text;
  private cash: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    scene.add
      .text(16, 14, "GRAND TRACTOR AUTO", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "20px",
        color: "#f4d03f",
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(1000);

    scene.add
      .text(
        16,
        42,
        "WASD / arrows to move  •  Enter to get in/out  •  drive the tractor over the field to farm",
        {
          fontFamily: "system-ui, sans-serif",
          fontSize: "13px",
          color: "#cfd3d8",
        }
      )
      .setScrollFactor(0)
      .setDepth(1000);

    this.cash = scene.add
      .text(0, 14, "$0", {
        fontFamily: "ui-monospace, monospace",
        fontSize: "20px",
        color: "#ffe08a",
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(1000)
      .setOrigin(1, 0);

    this.prompt = scene.add
      .text(0, 0, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#1c9e57cc",
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(1000)
      .setOrigin(0.5, 1);

    this.speed = scene.add
      .text(0, 0, "", {
        fontFamily: "ui-monospace, monospace",
        fontSize: "15px",
        color: "#ffffff",
        backgroundColor: "#00000066",
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(1000)
      .setOrigin(1, 1);

    scene.scale.on("resize", () => this.reposition());
    this.reposition();
  }

  private reposition() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    this.prompt.setPosition(w / 2, h - 24);
    this.speed.setPosition(w - 16, h - 16);
    this.cash.setPosition(w - 16, 14);
  }

  update(
    driving: Vehicle | null,
    nearbyLabel: string | null,
    cash: number,
    footHint: string | null
  ) {
    this.cash.setText(`$${cash}`);

    if (driving) {
      this.prompt.setVisible(false);
      const kmh = Math.round((driving.speed / 10) * 3.6);
      this.speed
        .setText(`${driving.spec.label.toUpperCase()}   ${kmh} km/h`)
        .setVisible(true);
    } else {
      this.speed.setVisible(false);
      if (nearbyLabel) {
        this.prompt.setText(`Press Enter to drive the ${nearbyLabel}`).setVisible(true);
      } else if (footHint) {
        this.prompt.setText(footHint).setVisible(true);
      } else {
        this.prompt.setVisible(false);
      }
    }
  }
}
