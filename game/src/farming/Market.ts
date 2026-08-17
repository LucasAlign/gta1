import Phaser from "phaser";
import { COLORS, CROPS, DEFAULT_CROP, FARM_MARKET } from "../config";

export interface SellResult {
  sold: number;
  cash: number;
  contractDone: boolean;
}

// The farmers' market. Sell harvested produce here for cash; each sale also
// counts toward a rolling delivery contract that pays a bonus when filled.
export class Market {
  readonly x: number;
  readonly y: number;
  private unitPrice = CROPS[DEFAULT_CROP].value;
  private need = 0;
  private delivered = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.newContract();

    const fill = scene.add.circle(x, y, 26, COLORS.market, 0.22).setDepth(2);
    const ring = scene.add.circle(x, y, 26).setStrokeStyle(3, COLORS.market, 0.95).setDepth(2);
    // little market-stall awning
    scene.add.triangle(x, y - 2, -20, 6, 20, 6, 0, -14, COLORS.market, 0.9).setDepth(3);
    scene.add
      .text(x, y + 16, "MARKET", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "11px",
        color: "#ffe3bd",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(3);
    scene.tweens.add({
      targets: ring,
      scale: 1.25,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
    void fill;
  }

  private newContract() {
    this.need = Phaser.Math.Between(FARM_MARKET.contractMin, FARM_MARKET.contractMax);
    this.delivered = 0;
  }

  contains(px: number, py: number): boolean {
    return Phaser.Math.Distance.Between(px, py, this.x, this.y) < FARM_MARKET.radius;
  }

  promptText(produce: number): string {
    const contract = `Contract ${this.delivered}/${this.need}`;
    if (produce > 0) {
      return `Press G — sell ${produce} crop${produce === 1 ? "" : "s"} ($${produce * this.unitPrice})  •  ${contract}`;
    }
    return `Farmers' Market  •  ${contract}  (harvest crops to sell)`;
  }

  // Sell all carried produce. Returns cash (spot price + any contract bonus).
  sell(produce: number): SellResult {
    if (produce <= 0) return { sold: 0, cash: 0, contractDone: false };

    let cash = produce * this.unitPrice;
    this.delivered += produce;

    let contractDone = false;
    if (this.delivered >= this.need) {
      cash += this.need * FARM_MARKET.contractBonusPerUnit; // completion bonus
      contractDone = true;
      this.delivered -= this.need; // carry overflow into the next contract
      this.need = Phaser.Math.Between(FARM_MARKET.contractMin, FARM_MARKET.contractMax);
    }
    return { sold: produce, cash, contractDone };
  }

  get minimapMarker() {
    return { x: this.x, y: this.y, color: COLORS.market };
  }
}
