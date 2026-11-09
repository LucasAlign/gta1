import Phaser from "phaser";
import { Vehicle } from "../entities/Vehicle";

export interface HudState {
  driving: Vehicle | null;
  nearbyVehicle: string | null;
  cash: number;
  produce: number;
  fieldHint: string | null;
  objective: string;
  shopPrompt: string | null;
  herd: { penned: number; total: number } | null;
  seederCrop: string | null;
  streak: number;
  streakMult: number;
}

// Screen-fixed heads-up display. Uses setScrollFactor(0) so it never moves with
// the camera, and stays pinned on window resize.
export class Hud {
  private scene: Phaser.Scene;
  private prompt: Phaser.GameObjects.Text;
  private speed: Phaser.GameObjects.Text;
  private cash: Phaser.GameObjects.Text;
  private produce: Phaser.GameObjects.Text;
  private objective: Phaser.GameObjects.Text;
  private seeder: Phaser.GameObjects.Text;
  private streak: Phaser.GameObjects.Text;

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
        "WASD move  •  Enter in/out  •  Plow → Seed → Harvest the field  •  E harvest by hand  •  B shop",
        {
          fontFamily: "system-ui, sans-serif",
          fontSize: "13px",
          color: "#cfd3d8",
        }
      )
      .setScrollFactor(0)
      .setDepth(1000);

    this.objective = scene.add
      .text(16, 64, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#00000055",
        padding: { x: 8, y: 4 },
      })
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

    this.produce = scene.add
      .text(0, 40, "", {
        fontFamily: "ui-monospace, monospace",
        fontSize: "14px",
        color: "#a6e05a",
      })
      .setScrollFactor(0)
      .setDepth(1000)
      .setOrigin(1, 0);

    this.seeder = scene.add
      .text(16, 88, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        color: "#cfeeb0",
        backgroundColor: "#2e7d3266",
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.streak = scene.add
      .text(0, 66, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "15px",
        color: "#ffce54",
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
    this.produce.setPosition(w - 16, 40);
    this.streak.setPosition(w - 16, 64);
  }

  update(s: HudState) {
    this.cash.setText(`$${s.cash}`);
    this.produce.setText(s.produce > 0 ? `🌾 ${s.produce} crops` : "");
    if (s.seederCrop) this.seeder.setText(`🌱 Seeder: ${s.seederCrop}  (C to change)`).setVisible(true);
    else this.seeder.setVisible(false);

    if (s.streak >= 2) {
      const pct = Math.round((s.streakMult - 1) * 100);
      this.streak.setText(`🔥 Streak x${s.streak}  +${pct}%`).setVisible(true);
    } else {
      this.streak.setVisible(false);
    }
    // In the pasture, the objective line becomes the herding tracker.
    if (s.herd) {
      this.objective.setText(`◆ Herd the cows into the pen — ${s.herd.penned}/${s.herd.total}`);
    } else {
      this.objective.setText(`◆ ${s.objective}`);
    }

    if (s.driving) {
      const kmh = Math.round((s.driving.speed / 10) * 3.6);
      this.speed
        .setText(`${s.driving.spec.label.toUpperCase()}   ${kmh} km/h`)
        .setVisible(true);
    } else {
      this.speed.setVisible(false);
    }

    // Prompt priority: shop > enter-vehicle > field hint (works on foot or in a tractor).
    let prompt: string | null = null;
    if (s.shopPrompt) prompt = s.shopPrompt;
    else if (!s.driving && s.nearbyVehicle) prompt = `Press Enter to drive the ${s.nearbyVehicle}`;
    else if (s.fieldHint) prompt = s.fieldHint;

    if (prompt) this.prompt.setText(prompt).setVisible(true);
    else this.prompt.setVisible(false);
  }
}
