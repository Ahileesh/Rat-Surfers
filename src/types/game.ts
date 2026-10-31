/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'SHOP';

export type Lane = -1 | 0 | 1; // -1: Left, 0: Center, 1: Right

export const LANE_WIDTH = 2.4;
export const CHEESE_ROOF_HEIGHT = 2.2; // Height on top of giant cheese slabs

export type PowerUpType = 'SPEED_CHEDDAR' | 'MAGNET' | 'CHEESE_SHIELD' | 'DOUBLE_TREATS' | 'GLIDER_WINGS';

export type CollectibleType = 'CHEESE' | 'CANDY' | 'CHOCO' | PowerUpType;

export type ObstacleType =
  | 'GIANT_CHEESE_WHEEL'
  | 'CANDY_CANE_GATE'
  | 'CHOCOLATE_SLAB_WALL'
  | 'GUMDROP_BOULDER'
  | 'MELTED_FONDUE_PIT'
  | 'CHEESE_BLOCK_STACK'
  | 'BRIDGE_GAP_JUMP'
  | 'SWINGING_BRIDGE_LANTERN'
  | 'POPCORN_GEYSER_PRESS';

export type CavernBiome = 'CRYSTAL_CAVERN' | 'CHEESE_GROTTO' | 'CHOCO_CHASM' | 'CANDY_MINES';

export interface PowerUpActive {
  type: PowerUpType;
  duration: number;
  remaining: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number; // Cheese reward
  completed: boolean;
  type: 'CHEESE' | 'JUMP' | 'SLIDE' | 'DISTANCE' | 'POWERUP';
}

export interface PlayerStats {
  score: number;
  distance: number;
  cheeseCount: number;
  candyCount: number;
  chocoCount: number;
  multiplier: number;
  catDistance: number;
  currentBiome: CavernBiome;
  biomeProgress: number;
  feverCharge: number; // 0 to 10
  isFeverActive: boolean;
  activeMission?: Mission | null;
}

export interface HighScoreRecord {
  score: number;
  distance: number;
  cheeseCount: number;
  date: string;
}

export interface CollectibleItem {
  id: number;
  type: CollectibleType;
  lane: Lane;
  z: number;
  y: number;
  collected: boolean;
  mesh?: any;
}

export interface ObstacleItem {
  id: number;
  type: ObstacleType;
  lane: Lane;
  z: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  passed: boolean;
  canSlideUnder: boolean;
  canJumpOver: boolean;
  isRampable?: boolean;
  mesh?: any;
}

export interface RatSkin {
  id: string;
  name: string;
  description: string;
  furColor: number;
  bellyColor: number;
  cost: number;
  unlocked: boolean;
  badge?: string;
}

export type ToolUpgradeId =
  | 'magnet'
  | 'spring_shoes'
  | 'shield'
  | 'multiplier'
  | 'rocket'
  | 'radar'
  | 'distractor'
  | 'vault'
  | 'wings'
  | 'clover'
  | 'fever_spark';

export interface ToolUpgrade {
  id: ToolUpgradeId;
  name: string;
  description: string;
  level: number;
  maxLevel?: number;
  baseCost: number;
  iconType: 'magnet' | 'spring' | 'shield' | 'multiplier' | 'rocket' | 'radar' | 'distractor' | 'vault' | 'wings' | 'clover' | 'fever_spark';
  effectLabel: string;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  totalRuns: number;
  lastRunDate: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank: number; // For ▲ +2, ▼ -1, • 0
  name: string;
  score: number;
  scoreDelta?: number; // Daily points fluctuation (+2,400 / -1,200)
  streak: number;
  cheese: number;
  skinId: string;
  title?: string;
  isPlayer?: boolean;
}
