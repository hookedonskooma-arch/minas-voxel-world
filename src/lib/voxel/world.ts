/**
 * VoxelCanvas — World Manager
 * Ported from SWR06 World.cpp
 * 
 * Manages a map of chunks, coordinates terrain generation,
 * handles block get/set at world coordinates, and triggers
 * chunk remeshing when edits happen.
 */

import { Chunk, CHUNK_SIZE, CHUNK_HEIGHT, ChunkMeshData } from './chunk';
import { WorldGenerator } from './worldgen';
import { BlockType } from './blocks';

export interface ChunkKey {
  cx: number;
  cz: number;
}

function chunkKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

export class VoxelWorld {
  chunks: Map<string, Chunk> = new Map();
  generator: WorldGenerator;
  /** Maximum build height (blocks above this are always air) */
  maxHeight: number;

  constructor(generator: WorldGenerator, maxHeight = CHUNK_HEIGHT) {
    this.generator = generator;
    this.maxHeight = maxHeight;
  }

  /** Convert world Y to chunk-local Y (we use 1 chunk column of height) */
  worldToChunk(x: number, z: number): ChunkKey {
    return {
      cx: Math.floor(x / CHUNK_SIZE),
      cz: Math.floor(z / CHUNK_SIZE),
    };
  }

  getChunk(cx: number, cz: number): Chunk | undefined {
    return this.chunks.get(chunkKey(cx, cz));
  }

  ensureChunk(cx: number, cz: number): Chunk {
    const key = chunkKey(cx, cz);
    let chunk = this.chunks.get(key);
    if (!chunk) {
      chunk = new Chunk(cx, cz);
      chunk.generate(this.generator);
      this.chunks.set(key, chunk);
    }
    return chunk;
  }

  /** Get block at world coordinates */
  getBlock(x: number, y: number, z: number): number {
    if (y < 0 || y >= this.maxHeight) return BlockType.Air;
    const { cx, cz } = this.worldToChunk(x, z);
    const chunk = this.getChunk(cx, cz);
    if (!chunk || !chunk.isGenerated) return BlockType.Air;
    const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return chunk.getBlock(lx, y, lz);
  }

  /** Set block at world coordinates, returns true if changed */
  setBlock(x: number, y: number, z: number, id: number): boolean {
    if (y < 0 || y >= this.maxHeight) return false;
    const { cx, cz } = this.worldToChunk(x, z);
    const chunk = this.ensureChunk(cx, cz);
    const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const old = chunk.getBlock(lx, y, lz);
    if (old === id) return false;
    chunk.setBlock(lx, y, lz, id);

    // Mark neighbor chunks for remesh if on border
    if (lx === 0) this.markDirty(cx - 1, cz);
    if (lx === CHUNK_SIZE - 1) this.markDirty(cx + 1, cz);
    if (lz === 0) this.markDirty(cx, cz - 1);
    if (lz === CHUNK_SIZE - 1) this.markDirty(cx, cz + 1);

    return true;
  }

  private markDirty(cx: number, cz: number): void {
    const chunk = this.getChunk(cx, cz);
    if (chunk) chunk.isMeshed = false;
  }

  /**
   * Get all chunks within render distance of (centerCX, centerCZ).
   * Generates any missing chunks.
   */
  getChunksInRadius(centerCX: number, centerCZ: number, radius: number): Chunk[] {
    const result: Chunk[] = [];
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const cx = centerCX + dx;
        const cz = centerCZ + dz;
        // Circular radius
        if (dx * dx + dz * dz > radius * radius) continue;
        result.push(this.ensureChunk(cx, cz));
      }
    }
    return result;
  }

  /**
   * Build mesh for a chunk, using world-space neighbor lookups.
   */
  buildChunkMesh(chunk: Chunk): ChunkMeshData | null {
    return chunk.buildMesh((wx, y, wz) => {
      if (y < 0 || y >= this.maxHeight) return BlockType.Air;
      const ncx = Math.floor(wx / CHUNK_SIZE);
      const ncz = Math.floor(wz / CHUNK_SIZE);
      // Ensure neighbor is generated for correct face culling
      const neighbor = this.ensureChunk(ncx, ncz);
      const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      return neighbor.getBlock(lx, y, lz);
    });
  }

  /** Find the highest non-air block at (x, z) — for player spawn */
  getSurfaceHeight(x: number, z: number): number {
    const { cx, cz } = this.worldToChunk(x, z);
    const chunk = this.ensureChunk(cx, cz);
    const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
      const b = chunk.getBlock(lx, y, lz);
      if (b !== BlockType.Air && b !== BlockType.Water) return y + 1;
    }
    return 1;
  }

  /** Serialize all loaded chunks to a compact JSON (for Supabase save) */
  serialize(): string {
    const data: Array<{ cx: number; cz: number; blocks: number[] }> = [];
    for (const chunk of this.chunks.values()) {
      data.push({
        cx: chunk.cx,
        cz: chunk.cz,
        blocks: Array.from(chunk.blocks),
      });
    }
    return JSON.stringify({ chunks: data, maxHeight: this.maxHeight, chunkHeight: CHUNK_HEIGHT });
  }

  /** Deserialize from JSON (for Supabase load) */
  deserialize(json: string): void {
    try {
      const parsed = JSON.parse(json);
      this.maxHeight = parsed.maxHeight || CHUNK_HEIGHT;
      for (const c of parsed.chunks) {
        const chunk = new Chunk(c.cx, c.cz);
        chunk.blocks = new Uint8Array(c.blocks);
        chunk.isGenerated = true;
        chunk.isMeshed = false;
        this.chunks.set(chunkKey(c.cx, c.cz), chunk);
      }
    } catch {
      // Corrupt save — start fresh
    }
  }
}