/**
 * VoxelCanvas — Chunk System
 * Ported from SWR06 Chunk.cpp / ChunkMesh.cpp
 * 
 * Chunks are CHUNK_SIZE³ cubes of blocks. Each chunk generates its
 * own mesh via face culling — only faces adjacent to transparent
 * blocks are rendered.
 */

import { BlockType, getBlock, isTransparent, getFaceColor } from './blocks';
import { WorldGenerator } from './worldgen';

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 64; // Full world height per chunk column

// Face definitions: normal, corner offsets, and face type
// Faces: 0=+X, 1=-X, 2=+Y(top), 3=-Y(bottom), 4=+Z, 5=-Z
const FACES = [
  { // +X
    normal: [1, 0, 0] as [number, number, number],
    corners: [
      [1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1],
    ] as [number, number, number][],
    faceType: 'side' as const,
  },
  { // -X
    normal: [-1, 0, 0] as [number, number, number],
    corners: [
      [0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0],
    ] as [number, number, number][],
    faceType: 'side' as const,
  },
  { // +Y (top)
    normal: [0, 1, 0] as [number, number, number],
    corners: [
      [0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0],
    ] as [number, number, number][],
    faceType: 'top' as const,
  },
  { // -Y (bottom)
    normal: [0, -1, 0] as [number, number, number],
    corners: [
      [0, 0, 1], [0, 0, 0], [1, 0, 0], [1, 0, 1],
    ] as [number, number, number][],
    faceType: 'bottom' as const,
  },
  { // +Z
    normal: [0, 0, 1] as [number, number, number],
    corners: [
      [1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1],
    ] as [number, number, number][],
    faceType: 'side' as const,
  },
  { // -Z
    normal: [0, 0, -1] as [number, number, number],
    corners: [
      [0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0],
    ] as [number, number, number][],
    faceType: 'side' as const,
  },
];

export interface ChunkMeshData {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  indices: Uint32Array;
}

export class Chunk {
  public blocks: Uint8Array;
  public cx: number;
  public cz: number;
  public isGenerated = false;
  public isMeshed = false;
  public meshData: ChunkMeshData | null = null;

  constructor(cx: number, cz: number) {
    this.cx = cx;
    this.cz = cz;
    this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
  }

  /** Flat index into the blocks array */
  private idx(x: number, y: number, z: number): number {
    return y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
  }

  getBlock(x: number, y: number, z: number): number {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
      return BlockType.Air;
    }
    return this.blocks[this.idx(x, y, z)];
  }

  setBlock(x: number, y: number, z: number, id: number): void {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) return;
    this.blocks[this.idx(x, y, z)] = id;
    this.isMeshed = false;
  }

  /**
   * Generate terrain using a WorldGenerator.
   * The chunk's world origin is (cx*CHUNK_SIZE, 0, cz*CHUNK_SIZE).
   */
  generate(gen: WorldGenerator): void {
    const worldX = this.cx * CHUNK_SIZE;
    const worldZ = this.cz * CHUNK_SIZE;

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const wx = worldX + x;
        const wz = worldZ + z;
        const height = gen.getHeight(wx, wz);

        for (let y = 0; y < CHUNK_HEIGHT; y++) {
          const blockId = gen.getBlockAt(wx, wz, y, height);
          if (blockId !== BlockType.Air) {
            this.blocks[this.idx(x, y, z)] = blockId;
          }
        }

        // Place trees on top
        if (gen.shouldPlaceTree(wx, wz, height)) {
          const treeH = gen.getTreeHeight();
          const trunkBase = height + 1;
          for (let t = 0; t < treeH && trunkBase + t < CHUNK_HEIGHT; t++) {
            this.blocks[this.idx(x, trunkBase + t, z)] = BlockType.Wood;
          }
          // Leaves canopy
          const topY = trunkBase + treeH;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              for (let dz = -2; dz <= 2; dz++) {
                const lx = x + dx, ly = topY + dy, lz = z + dz;
                if (lx < 0 || lx >= CHUNK_SIZE || ly < 0 || ly >= CHUNK_HEIGHT || lz < 0 || lz >= CHUNK_SIZE) continue;
                const dist = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
                if (dist > 3) continue;
                if (this.blocks[this.idx(lx, ly, lz)] === BlockType.Air) {
                  this.blocks[this.idx(lx, ly, lz)] = BlockType.Leaves;
                }
              }
            }
          }
        }
      }
    }

    this.isGenerated = true;
    this.isMeshed = false;
  }

  /**
   * Build the mesh via face culling.
   * A face is visible if the neighboring block (in world space) is transparent
   * and the current block is not air.
   * 
   * neighborLookup: function(x,y,z) → block id, for blocks outside this chunk.
   */
  buildMesh(neighborLookup: (worldX: number, y: number, worldZ: number) => number): ChunkMeshData | null {
    const positions: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const worldXBase = this.cx * CHUNK_SIZE;
    const worldZBase = this.cz * CHUNK_SIZE;

    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
          const blockId = this.blocks[this.idx(x, y, z)];
          if (blockId === BlockType.Air) continue;

          for (let f = 0; f < 6; f++) {
            const face = FACES[f];
            const nx = x + face.normal[0];
            const ny = y + face.normal[1];
            const nz = z + face.normal[2];

            // Check neighbor — inside chunk or via lookup
            let neighborId: number;
            if (nx >= 0 && nx < CHUNK_SIZE && ny >= 0 && ny < CHUNK_HEIGHT && nz >= 0 && nz < CHUNK_SIZE) {
              neighborId = this.blocks[this.idx(nx, ny, nz)];
            } else {
              // Outside chunk — use world-space lookup
              neighborId = neighborLookup(
                worldXBase + nx,
                ny,
                worldZBase + nz,
              );
            }

            // Skip face if neighbor is opaque
            if (!isTransparent(neighborId)) continue;
            // Skip face if both are transparent of the same type (water-water)
            if (isTransparent(blockId) && blockId === neighborId) continue;

            const faceColor = getFaceColor(blockId, face.faceType);
            const vi = positions.length / 3;

            for (const corner of face.corners) {
              positions.push(x + corner[0], y + corner[1], z + corner[2]);
              normals.push(face.normal[0], face.normal[1], face.normal[2]);
              // Slight AO/shading per face direction
              const shade = f === 2 ? 1.0 : f === 3 ? 0.5 : f === 0 || f === 1 ? 0.8 : 0.7;
              colors.push(faceColor[0] * shade, faceColor[1] * shade, faceColor[2] * shade);
            }

            indices.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
          }
        }
      }
    }

    if (positions.length === 0) return null;

    this.meshData = {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      colors: new Float32Array(colors),
      indices: new Uint32Array(indices),
    };
    this.isMeshed = true;
    return this.meshData;
  }
}