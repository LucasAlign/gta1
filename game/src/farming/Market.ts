import Phaser from "phaser";
import { COLORS, CROPS, FARM_MARKET } from "../config";

export type Produce = Record<string, number>;

export interface SellResult {
  sold: number;
  cash: number; // spot price for the produce
  contractDone: boolean;
  bonus: number; // contract completion bonus (base, before progression scaling)
}

function countOf(p: Produce): number {
  return Object.values(p).reduce((a, b) => a + b, 0);
}
function valueOf(p: Produce): number {
  let v = 0;
  for (const [k, n] of Object.entries(p)) v += n * (CROPS[k]?.value ?? 0);
  return v;
}

// The farmers' market. Sell a mixed produce inventory here for cash (each crop
// at its own price); each sale also counts toward a rolling delivery contract
// that pays a bonus when filled.
export class Market {
  readonly x: number;
  readonly y: number;
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

  promptText(produce: Produce): string {
    const contract = `Contract ${this.delivered}/${this.need}`;
    const n = countOf(produce);
    if (n > 0) {
      return `Press G — sell ${n} crop${n === 1 ? "" : "s"} ($${valueOf(produce)})  •  ${contract}`;
    }
    return `Farmers' Market  •  ${contract}  (harvest crops to sell)`;
  }

  // Sell the whole produce inventory. Spot cash is returned directly; the
  // contract bonus is returned separately so it can be rank/streak-scaled.
  sell(produce: Produce): SellResult {
    const n = countOf(produce);
    if (n <= 0) return { sold: 0, cash: 0, contractDone: false, bonus: 0 };

    const cash = valueOf(produce);
    this.delivered += n;

    let contractDone = false;
    let bonus = 0;
    if (this.delivered >= this.need) {
      bonus = this.need * FARM_MARKET.contractBonusPerUnit;
      contractDone = true;
      this.delivered -= this.need; // carry overflow into the next contract
      this.need = Phaser.Math.Between(FARM_MARKET.contractMin, FARM_MARKET.contractMax);
    }
    return { sold: n, cash, contractDone, bonus };
  }

  get contract() {
    return { delivered: this.delivered, need: this.need };
  }

  restoreContract(delivered: number, need: number) {
    this.delivered = delivered;
    this.need = need;
  }

  get minimapMarker() {
    return { x: this.x, y: this.y, color: COLORS.market };
  }
}
