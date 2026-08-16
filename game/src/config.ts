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
};

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
  tractor: {
    key: "tractor",
    label: "Tractor",
    bodyColor: 0x2e7d32,
    accentColor: 0xf4d03f,
    width: 74,
    height: 52,
    maxSpeed: 210,
    accel: 260,
    reverseMax: 90,
    braking: 420,
    drag: 1.2,
    grip: 0.95,
    turnRate: 2.2,
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
