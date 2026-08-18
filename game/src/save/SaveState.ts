import { ProgressionSnapshot } from "../jobs/Progression";

export interface SaveData {
  cash: number;
  produce: Record<string, number>;
  seederCropIndex: number;
  shopLevel: number;
  progression: ProgressionSnapshot;
  contract: { delivered: number; need: number };
}

const KEY = "grand-tractor-auto.save.v1";

// Thin wrapper over localStorage. All access is guarded so a disabled or full
// store never crashes the game.
export const SaveState = {
  load(): SaveData | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as SaveData) : null;
    } catch {
      return null;
    }
  },

  save(data: SaveData) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable — ignore */
    }
  },

  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
