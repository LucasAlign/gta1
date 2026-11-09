import { PROGRESSION } from "../config";

export type JobType = "fire" | "police" | "delivery" | "herd" | "farm";

const JOBS: JobType[] = ["fire", "police", "delivery", "herd", "farm"];

export interface JobStat {
  xp: number;
  rank: number;
}

export interface RewardResult {
  reward: number; // final cash after rank + streak scaling
  rank: number;
  rankedUp: boolean;
  streak: number;
}

export interface ProgressionSnapshot {
  stats: Record<string, JobStat>;
  // streak is intentionally not persisted — it's a live, in-session thing.
}

// Tracks per-job rank (from completions) and a shared streak. Completing jobs
// back-to-back within the streak window multiplies rewards.
export class Progression {
  private stats: Record<JobType, JobStat>;
  private streak = 0;
  private streakTimer = 0;

  constructor() {
    this.stats = {
      fire: { xp: 0, rank: 1 },
      police: { xp: 0, rank: 1 },
      delivery: { xp: 0, rank: 1 },
      herd: { xp: 0, rank: 1 },
      farm: { xp: 0, rank: 1 },
    };
  }

  update(dtSec: number) {
    if (this.streakTimer > 0) {
      this.streakTimer -= dtSec;
      if (this.streakTimer <= 0) this.streak = 0;
    }
  }

  rankOf(job: JobType): number {
    return this.stats[job].rank;
  }

  get streakCount(): number {
    return this.streak;
  }

  // Current streak multiplier (1 when no streak is running).
  get streakMult(): number {
    if (this.streak < 2) return 1;
    const steps = Math.min(this.streak - 1, PROGRESSION.streakCap);
    return 1 + steps * PROGRESSION.streakStep;
  }

  private rankMult(job: JobType): number {
    return 1 + (this.stats[job].rank - 1) * PROGRESSION.rankBonus;
  }

  // Record a completed job with its base reward; returns the scaled payout.
  record(job: JobType, base: number): RewardResult {
    const stat = this.stats[job];
    stat.xp += 1;
    const newRank = Math.floor(stat.xp / PROGRESSION.xpPerRank) + 1;
    const rankedUp = newRank > stat.rank;
    stat.rank = newRank;

    this.streak += 1;
    this.streakTimer = PROGRESSION.streakWindow;

    const reward = Math.round(base * this.rankMult(job) * this.streakMult);
    return { reward, rank: stat.rank, rankedUp, streak: this.streak };
  }

  snapshot(): ProgressionSnapshot {
    return { stats: JSON.parse(JSON.stringify(this.stats)) };
  }

  restore(snap: ProgressionSnapshot | null | undefined) {
    if (!snap?.stats) return;
    for (const job of JOBS) {
      if (snap.stats[job]) this.stats[job] = { xp: snap.stats[job].xp, rank: snap.stats[job].rank };
    }
  }
}
