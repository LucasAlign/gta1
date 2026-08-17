// Central tuning + world constants. Everything data-driven so new vehicles/tiles
// are config, not new code (carries over the "data-driven from day one" principle
// from the original project handoff).

export const TILE = 64;

// World is a grid of blocks. Each block is BLOCK_TILES x BLOCK_TILES tiles,
// separated by road lanes. Keep it comfortably explorable but not huge.
export const BLOCK_TILES = 5;
export const BLOCKS_X = 6;
export const BLOCKS_Y = 6;
export const ROAD_TILES = 2; // road width between blocks, in tiles

export const WORLD_TILES_X = BLOCKS_X * (BLOCK_TILES + ROAD_TILES) + ROAD_TILES;
export const WORLD_TILES_Y = BLOCKS_Y * (BLOCK_TILES + ROAD_TILES) + ROAD_TILES;
export const WORLD_W = WORLD_TILES_X * TILE;
export const WORLD_H = WORLD_TILES_Y * TILE;

// Block+road repeat period, in tiles. Shared by every system that reasons about
// the road grid (traffic, minimap, missions).
export const PERIOD = BLOCK_TILES + ROAD_TILES;

// The road network is a lattice of intersections. There's one vertical road
// before each block plus a trailing one, so the intersection grid is
// (BLOCKS + 1) in each axis.
export const INTERSECTIONS_X = BLOCKS_X + 1;
export const INTERSECTIONS_Y = BLOCKS_Y + 1;

// World-pixel center of intersection (ix, iy) — the middle of the 2-tile road.
export function intersectionPx(ix: number, iy: number): { x: number; y: number } {
  return {
    x: (ix * PERIOD + ROAD_TILES / 2) * TILE,
    y: (iy * PERIOD + ROAD_TILES / 2) * TILE,
  };
}

export const COLORS = {
  grass: 0x4a7a34,
  grassAlt: 0x53853a,
  road: 0x2b2f36,
  roadLine: 0xc9b458,
  soil: 0x6b4a2f,
  soilAlt: 0x5e4029,
  building: 0x8a8f98,
  buildingRoof: 0x6d727b,
  sidewalk: 0x9a9a92,
  player: 0xffd27f,
  playerOutline: 0x3a2a12,
  ped: 0xd98cb3,
  pickup: 0xf4c430,
  dropoff: 0x3fd07a,
  shop: 0x8e6bd0,
};

// Colors traffic cars are tinted with (picked at random per car).
export const TRAFFIC_TINTS = [0xdedede, 0x4c6ef5, 0xf03e3e, 0x2f9e44, 0xf59f00, 0x343a40];

// ---- economy / gameplay tuning -----------------------------------------

export const MISSION = {
  minReward: 40,
  maxReward: 90,
  pickupRadius: 70,
  dropoffRadius: 70,
};

export const SHOP = {
  // Tractor "turbo": each purchase raises speed/accel, price climbs.
  turboBasePrice: 100,
  turboPriceStep: 60,
  turboMaxLevel: 5,
  turboSpeedPerLevel: 55,
  turboAccelPerLevel: 70,
  radius: 80,
};

// Field jobs a tractor can perform. Each stage of the field loop is gated to the
// tractor that carries the matching job — that's the whole point of specialised
// tractors: one machine, one task.
export type FarmJob = "plow" | "seed" | "harvest";

// A vehicle is a config, never a bespoke class — matches the handoff's
// "vehicle framework is the technical keystone" note.
export interface VehicleSpec {
  key: string;
  label: string;
  bodyColor: number;
  accentColor: number;
  width: number; // px (sprite drawn pointing +x / east)
  height: number;
  maxSpeed: number; // px/s
  accel: number; // px/s^2 engine force
  reverseMax: number; // px/s
  braking: number; // px/s^2
  drag: number; // passive deceleration factor per second
  grip: number; // 0..1, higher = less lateral slide (kills drift)
  turnRate: number; // rad/s at speed
  farmJob?: FarmJob; // set = this is a task tractor for that field stage
}

// A crop is config too. `stages` is the number of visible growth steps; the last
// stage is ripe/harvestable. `growSeconds` is time spent per stage.
export interface CropSpec {
  key: string;
  label: string;
  stages: number;
  growSeconds: number;
  value: number; // cash awarded on harvest
  sproutColor: number;
  leafColor: number;
  ripeColor: number;
}

export const CROPS: Record<string, CropSpec> = {
  carrot: {
    key: "carrot",
    label: "Carrot",
    stages: 3,
    growSeconds: 3.5,
    value: 15,
    sproutColor: 0x7ec850,
    leafColor: 0x3f9e3f,
    ripeColor: 0xe8792b,
  },
};

// The crop planted when the tractor tills a fresh plot (data-driven default).
export const DEFAULT_CROP = "carrot";

export const VEHICLES: Record<string, VehicleSpec> = {
  // ---- task tractors (one per field stage) ----
  plow: {
    key: "plow",
    label: "Plow Tractor",
    bodyColor: 0x9c5a2c, // earthy brown
    accentColor: 0xd98a3d,
    width: 76,
    height: 54,
    maxSpeed: 180,
    accel: 240,
    reverseMax: 85,
    braking: 420,
    drag: 1.3,
    grip: 0.96,
    turnRate: 2.1,
    farmJob: "plow",
  },
  seeder: {
    key: "seeder",
    label: "Seeder",
    bodyColor: 0x2e7d32, // classic green
    accentColor: 0xf4d03f,
    width: 72,
    height: 50,
    maxSpeed: 210,
    accel: 260,
    reverseMax: 90,
    braking: 420,
    drag: 1.2,
    grip: 0.95,
    turnRate: 2.3,
    farmJob: "seed",
  },
  harvester: {
    key: "harvester",
    label: "Harvester",
    bodyColor: 0xd4a017, // combine yellow
    accentColor: 0xb03030,
    width: 86,
    height: 58,
    maxSpeed: 200,
    accel: 250,
    reverseMax: 85,
    braking: 440,
    drag: 1.25,
    grip: 0.96,
    turnRate: 2.0,
    farmJob: "harvest",
  },
  hatchback: {
    key: "hatchback",
    label: "Hatchback",
    bodyColor: 0xc0392b,
    accentColor: 0x2c3e50,
    width: 64,
    height: 34,
    maxSpeed: 430,
    accel: 520,
    reverseMax: 150,
    braking: 640,
    drag: 0.9,
    grip: 0.82,
    turnRate: 3.0,
  },
  sports: {
    key: "sports",
    label: "Sports Car",
    bodyColor: 0x2980b9,
    accentColor: 0xecf0f1,
    width: 70,
    height: 32,
    maxSpeed: 560,
    accel: 700,
    reverseMax: 170,
    braking: 720,
    drag: 0.8,
    grip: 0.7, // slides more = fun
    turnRate: 3.2,
  },
};
