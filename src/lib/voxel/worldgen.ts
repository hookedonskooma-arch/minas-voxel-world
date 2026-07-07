/**
 * VoxelCanvas — World Generator
 * Ported from SWR06 WorldGenerator.cpp / FastNoise.cpp
 * 
 * Uses simplex-noise to generate terrain height maps, biome quantization,
 * tree placement, and water levels. Supports multiple generator types
 * matching the original SWR06 WorldGeneratorType.h.
 */

import { createNoise2D } from 'simplex-noise';

export type GeneratorType = 'default' | 'mountains' | 'islands' | 'flat';

export interface WorldGenConfig {
  type: GeneratorType;
  seed: number;
  /** Base ground level */
  baseHeight: number;
  /** Amplitude of terrain features */
  amplitude: number;
  /** Noise scale — higher = smoother, larger features */
  scale: number;
  /** Water level (blocks below this become water) */
  waterLevel: number;
  /** Tree density 0..1 */
  treeDensity: number;
}

export const DEFAULT_GEN: WorldGenConfig = {
  type: 'default',
  seed: 1337,
  baseHeight: 32,
  amplitude: 16,
  scale: 0.015,
  waterLevel: 28,
  treeDensity: 0.02,
};

export const MINA_GEN: WorldGenConfig = {
  type: 'default',
  seed: 42,
  baseHeight: 36,
  amplitude: 6,
  scale: 0.012,
  waterLevel: 30,
  treeDensity: 0.05,
};

/**
 * Simple seeded PRNG (mulberry32) for deterministic noise seeds.
 */
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class WorldGenerator {
  private noise2D: (x: number, y: number) => number;
  private treeNoise2D: (x: number, y: number) => number;
  private config: WorldGenConfig;
  private treeRng: () => number;

  constructor(config: WorldGenConfig) {
    this.config = config;
    const rng1 = mulberry32(config.seed);
    const rng2 = mulberry32(config.seed + 777);
    const rng3 = mulberry32(config.seed + 4242);
    this.noise2D = createNoise2D(rng1);
    this.treeNoise2D = createNoise2D(rng2);
    this.treeRng = mulberry32(config.seed + 100);
  }

  /**
   * Get terrain height at world (x, z).
   * Returns the Y coordinate of the topmost solid block.
   */
  getHeight(x: number, z: number): number {
    const { type, scale, baseHeight, amplitude } = this.config;

    switch (type) {
      case 'flat':
        return baseHeight;

      case 'mountains': {
        const n = this.noise2D(x * scale * 0.5, z * scale * 0.5);
        const n2 = this.noise2D(x * scale * 1.5, z * scale * 1.5) * 0.3;
        return Math.floor(baseHeight + (n + n2) * amplitude * 2.5);
      }

      case 'islands': {
        const n = this.noise2D(x * scale, z * scale);
        const n2 = this.noise2D(x * scale * 2.5, z * scale * 2.5) * 0.4;
        const height = baseHeight + (n + n2) * amplitude;
        // Below water level = water, clamp to small islands
        if (height < this.config.waterLevel) {
          return Math.floor(this.config.waterLevel - 1);
        }
        return Math.floor(height);
      }

      case 'default':
      default: {
        const n = this.noise2D(x * scale, z * scale);
        const n2 = this.noise2D(x * scale * 2.1, z * scale * 2.1) * 0.4;
        const n3 = this.noise2D(x * scale * 4.3, z * scale * 4.3) * 0.15;
        return Math.floor(baseHeight + (n + n2 + n3) * amplitude);
      }
    }
  }

  /**
   * Determine which block type fills the column at (x, y, z).
   * y is the absolute world Y; height is the terrain surface height.
   */
  getBlockAt(x: number, z: number, y: number, height: number): number {
    const { waterLevel } = this.config;

    // Bedrock at bottom
    if (y === 0) return 14; // Bedrock

    // Above terrain
    if (y > height) {
      if (y <= waterLevel) return 5; // Water
      return 0; // Air
    }

    // At terrain surface
    if (y === height) {
      if (height <= waterLevel) return 5; // Water at surface
      // Grass on top, sand near water
      if (height <= waterLevel + 1) return 4; // Sand
      return 1; // Grass
    }

    // Underground
    if (y >= height - 3) return 2; // Dirt
    return 3; // Stone
  }

  /**
   * Should a tree be placed at (x, z)?
   * Uses noise + density threshold.
   */
  shouldPlaceTree(x: number, z: number, height: number): boolean {
    if (this.config.treeDensity <= 0) return false;
    if (height <= this.config.waterLevel + 1) return false;

    const treeN = this.treeNoise2D(x * 0.1, z * 0.1);
    const roll = this.treeRng();
    return treeN > 0.7 && roll < this.config.treeDensity;
  }

  /**
   * Get tree height (4-6 blocks).
   */
  getTreeHeight(): number {
    return 4 + Math.floor(this.treeRng() * 3);
  }
}