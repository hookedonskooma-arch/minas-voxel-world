/**
 * VoxelCanvas — Voxel Raycaster
 * Ported from SWR06 Raycast.cpp / Ray.h
 * 
 * Uses the Amanatides-Woo voxel traversal algorithm to find
 * the first solid block hit by a ray (from camera along look direction).
 * Returns the hit block position and the face normal (for placement).
 */

import { BlockType } from './blocks';
import { VoxelWorld } from './world';

export interface RayHit {
  /** Block coordinates of the hit */
  block: [number, number, number];
  /** Normal of the hit face — direction to place new block */
  normal: [number, number, number];
  /** Distance along the ray */
  distance: number;
}

/**
 * Cast a ray through the voxel world and find the first solid block.
 * Based on the Amanatides-Woo algorithm (1987).
 * 
 * @param world - the voxel world
 * @param origin - ray origin [x, y, z]
 * @param direction - normalized ray direction [dx, dy, dz]
 * @param maxDist - maximum ray distance
 */
export function raycastVoxel(
  world: VoxelWorld,
  origin: [number, number, number],
  direction: [number, number, number],
  maxDist = 32,
): RayHit | null {
  let x = Math.floor(origin[0]);
  let y = Math.floor(origin[1]);
  let z = Math.floor(origin[2]);

  const stepX = Math.sign(direction[0]);
  const stepY = Math.sign(direction[1]);
  const stepZ = Math.sign(direction[2]);

  // Distance to next voxel boundary
  const tDeltaX = stepX !== 0 ? Math.abs(1 / direction[0]) : Infinity;
  const tDeltaY = stepY !== 0 ? Math.abs(1 / direction[1]) : Infinity;
  const tDeltaZ = stepZ !== 0 ? Math.abs(1 / direction[2]) : Infinity;

  // Initial tMax — distance to first boundary crossing
  const fracX = stepX > 0 ? 1 - (origin[0] - Math.floor(origin[0])) : origin[0] - Math.floor(origin[0]);
  const fracY = stepY > 0 ? 1 - (origin[1] - Math.floor(origin[1])) : origin[1] - Math.floor(origin[1]);
  const fracZ = stepZ > 0 ? 1 - (origin[2] - Math.floor(origin[2])) : origin[2] - Math.floor(origin[2]);

  let tMaxX = stepX !== 0 ? (fracX / Math.abs(direction[0])) : Infinity;
  let tMaxY = stepY !== 0 ? (fracY / Math.abs(direction[1])) : Infinity;
  let tMaxZ = stepZ !== 0 ? (fracZ / Math.abs(direction[2])) : Infinity;

  let normal: [number, number, number] = [0, 0, 0];
  let t = 0;

  while (t <= maxDist) {
    const block = world.getBlock(x, y, z);
    if (block !== BlockType.Air && block !== BlockType.Water) {
      return {
        block: [x, y, z],
        normal,
        distance: t,
      };
    }

    // Advance to next voxel
    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      x += stepX;
      t = tMaxX;
      tMaxX += tDeltaX;
      normal = [-stepX, 0, 0];
    } else if (tMaxY < tMaxZ) {
      y += stepY;
      t = tMaxY;
      tMaxY += tDeltaY;
      normal = [0, -stepY, 0];
    } else {
      z += stepZ;
      t = tMaxZ;
      tMaxZ += tDeltaZ;
      normal = [0, 0, -stepZ];
    }
  }

  return null;
}

/**
 * AABB collision check for a player at position with given size.
 * Returns true if the player overlaps any solid block.
 * 
 * @param world - voxel world
 * @param pos - player center position [x, y, z]
 * @param halfSize - half-extents [hx, hy, hz]
 */
export function checkAABBCollision(
  world: VoxelWorld,
  pos: [number, number, number],
  halfSize: [number, number, number],
): boolean {
  const minX = Math.floor(pos[0] - halfSize[0]);
  const maxX = Math.floor(pos[0] + halfSize[0]);
  const minY = Math.floor(pos[1] - halfSize[1]);
  const maxY = Math.floor(pos[1] + halfSize[1]);
  const minZ = Math.floor(pos[2] - halfSize[0]);
  const maxX2 = Math.floor(pos[2] + halfSize[0]);

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxX2; z++) {
        const block = world.getBlock(x, y, z);
        if (block !== BlockType.Air && block !== BlockType.Water) {
          return true;
        }
      }
    }
  }
  return false;
}