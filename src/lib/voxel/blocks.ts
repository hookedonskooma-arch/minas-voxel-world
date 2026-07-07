/**
 * VoxelCanvas — Block Database
 * Ported from SWR06 Block.h / BlockDatabase.h
 * 
 * Each block has an id, a display name, a color (for simple rendering),
 * and flags for transparency, solidity, and special behavior.
 */

export enum BlockType {
  Air = 0,
  Grass = 1,
  Dirt = 2,
  Stone = 3,
  Sand = 4,
  Water = 5,
  Wood = 6,
  Leaves = 7,
  Glass = 8,
  Brick = 9,
  Plank = 10,
  Cobblestone = 11,
  Snow = 12,
  Ice = 13,
  Bedrock = 14,
  Glowstone = 15,
  // Mina-special blocks
  Candy = 16,
  Flower = 17,
  Cloud = 18,
  // Lab blocks (behavioral)
  Bouncy = 19,
  Teleport = 20,
  Trigger = 21,
  Ghost = 22, // no-collision pass-through
}

export interface BlockDef {
  id: BlockType;
  name: string;
  /** Base color for flat shading */
  color: [number, number, number];
  /** Top face color (for grass etc.) */
  topColor?: [number, number, number];
  /** Side face color */
  sideColor?: [number, number, number];
  /** Bottom face color */
  bottomColor?: [number, number, number];
  transparent: boolean;
  solid: boolean;
  /** Emits light */
  lightEmission: number;
  /** Lab mode: special behavior tag */
  behavior?: 'bouncy' | 'teleport' | 'trigger' | 'ghost' | 'none';
  /** Mina mode: emoji icon for hotbar */
  emoji?: string;
}

const C = (r: number, g: number, b: number): [number, number, number] => [r / 255, g / 255, b / 255];

export const BLOCK_DEFS: Record<number, BlockDef> = {
  [BlockType.Air]: {
    id: BlockType.Air, name: 'Air', color: C(0, 0, 0),
    transparent: true, solid: false, lightEmission: 0,
  },
  [BlockType.Grass]: {
    id: BlockType.Grass, name: 'Grass', color: C(86, 168, 56),
    topColor: C(96, 186, 64), sideColor: C(134, 96, 67), bottomColor: C(134, 96, 67),
    transparent: false, solid: true, lightEmission: 0, emoji: '🌱',
  },
  [BlockType.Dirt]: {
    id: BlockType.Dirt, name: 'Dirt', color: C(134, 96, 67),
    transparent: false, solid: true, lightEmission: 0, emoji: '🟫',
  },
  [BlockType.Stone]: {
    id: BlockType.Stone, name: 'Stone', color: C(128, 128, 128),
    transparent: false, solid: true, lightEmission: 0, emoji: '🪨',
  },
  [BlockType.Sand]: {
    id: BlockType.Sand, name: 'Sand', color: C(218, 207, 122),
    transparent: false, solid: true, lightEmission: 0, emoji: '🏖️',
  },
  [BlockType.Water]: {
    id: BlockType.Water, name: 'Water', color: C(58, 118, 204),
    transparent: true, solid: false, lightEmission: 0, emoji: '💧',
  },
  [BlockType.Wood]: {
    id: BlockType.Wood, name: 'Wood', color: C(102, 76, 42),
    topColor: C(160, 120, 60), sideColor: C(102, 76, 42), bottomColor: C(160, 120, 60),
    transparent: false, solid: true, lightEmission: 0, emoji: '🪵',
  },
  [BlockType.Leaves]: {
    id: BlockType.Leaves, name: 'Leaves', color: C(60, 140, 44),
    transparent: true, solid: true, lightEmission: 0, emoji: '🍃',
  },
  [BlockType.Glass]: {
    id: BlockType.Glass, name: 'Glass', color: C(180, 220, 255),
    transparent: true, solid: true, lightEmission: 0, emoji: '🪟',
  },
  [BlockType.Brick]: {
    id: BlockType.Brick, name: 'Brick', color: C(156, 74, 44),
    transparent: false, solid: true, lightEmission: 0, emoji: '🧱',
  },
  [BlockType.Plank]: {
    id: BlockType.Plank, name: 'Plank', color: C(184, 148, 96),
    transparent: false, solid: true, lightEmission: 0, emoji: '🟧',
  },
  [BlockType.Cobblestone]: {
    id: BlockType.Cobblestone, name: 'Cobble', color: C(100, 100, 100),
    transparent: false, solid: true, lightEmission: 0, emoji: '⛏️',
  },
  [BlockType.Snow]: {
    id: BlockType.Snow, name: 'Snow', color: C(240, 248, 255),
    transparent: false, solid: true, lightEmission: 0, emoji: '❄️',
  },
  [BlockType.Ice]: {
    id: BlockType.Ice, name: 'Ice', color: C(155, 196, 226),
    transparent: true, solid: true, lightEmission: 0, emoji: '🧊',
  },
  [BlockType.Bedrock]: {
    id: BlockType.Bedrock, name: 'Bedrock', color: C(40, 40, 40),
    transparent: false, solid: true, lightEmission: 0, emoji: '⬛',
  },
  [BlockType.Glowstone]: {
    id: BlockType.Glowstone, name: 'Glow', color: C(255, 220, 100),
    transparent: false, solid: true, lightEmission: 15, emoji: '💡',
  },
  // --- Mina special ---
  [BlockType.Candy]: {
    id: BlockType.Candy, name: 'Candy', color: C(255, 105, 180),
    transparent: false, solid: true, lightEmission: 2, emoji: '🍬',
  },
  [BlockType.Flower]: {
    id: BlockType.Flower, name: 'Flower', color: C(255, 182, 193),
    transparent: true, solid: false, lightEmission: 0, emoji: '🌸',
  },
  [BlockType.Cloud]: {
    id: BlockType.Cloud, name: 'Cloud', color: C(255, 255, 255),
    transparent: true, solid: true, lightEmission: 0, emoji: '☁️',
  },
  // --- Lab behavioral ---
  [BlockType.Bouncy]: {
    id: BlockType.Bouncy, name: 'Bouncy', color: C(255, 50, 80),
    transparent: false, solid: true, lightEmission: 1,
    behavior: 'bouncy', emoji: '🤸',
  },
  [BlockType.Teleport]: {
    id: BlockType.Teleport, name: 'Teleport', color: C(180, 80, 255),
    transparent: false, solid: true, lightEmission: 8,
    behavior: 'teleport', emoji: '🌀',
  },
  [BlockType.Trigger]: {
    id: BlockType.Trigger, name: 'Trigger', color: C(255, 200, 0),
    transparent: true, solid: false, lightEmission: 5,
    behavior: 'trigger', emoji: '⚡',
  },
  [BlockType.Ghost]: {
    id: BlockType.Ghost, name: 'Ghost', color: C(200, 200, 220),
    transparent: true, solid: false, lightEmission: 0,
    behavior: 'ghost', emoji: '👻',
  },
};

/** Mina mode palette — kid-friendly blocks */
export const MINA_PALETTE: BlockType[] = [
  BlockType.Grass, BlockType.Dirt, BlockType.Sand, BlockType.Water,
  BlockType.Wood, BlockType.Leaves, BlockType.Glass, BlockType.Brick,
  BlockType.Candy, BlockType.Flower, BlockType.Cloud, BlockType.Glowstone,
];

/** Lab mode palette — includes behavioral blocks */
export const LAB_PALETTE: BlockType[] = [
  BlockType.Stone, BlockType.Cobblestone, BlockType.Plank, BlockType.Brick,
  BlockType.Glass, BlockType.Glowstone, BlockType.Bouncy, BlockType.Teleport,
  BlockType.Trigger, BlockType.Ghost, BlockType.Water, BlockType.Leaves,
];

export function getBlock(id: number): BlockDef {
  return BLOCK_DEFS[id] || BLOCK_DEFS[BlockType.Air];
}

export function isTransparent(id: number): boolean {
  return getBlock(id).transparent;
}

export function isSolid(id: number): boolean {
  return getBlock(id).solid;
}

export function getFaceColor(id: number, face: 'top' | 'side' | 'bottom'): [number, number, number] {
  const def = getBlock(id);
  if (face === 'top' && def.topColor) return def.topColor;
  if (face === 'bottom' && def.bottomColor) return def.bottomColor;
  if (face === 'side' && def.sideColor) return def.sideColor;
  return def.color;
}