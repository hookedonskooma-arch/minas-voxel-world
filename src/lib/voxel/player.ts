/**
 * VoxelCanvas — Player Controller
 * Ported from SWR06 Player.cpp / FpsCamera.cpp
 * 
 * FPS-style camera with WASD movement, mouse look, jump,
 * gravity, AABB collision, and block interaction (break/place).
 */

import * as THREE from 'three';
import { VoxelWorld } from './world';
import { BlockType, getBlock } from './blocks';
import { raycastVoxel, checkAABBCollision } from './raycast';

export interface PlayerConfig {
  walkSpeed: number;
  runSpeed: number;
  jumpForce: number;
  gravity: number;
  eyeHeight: number;
  halfWidth: number;
  halfHeight: number;
  flyMode: boolean;
}

export const DEFAULT_PLAYER: PlayerConfig = {
  walkSpeed: 4.3,
  runSpeed: 6.5,
  jumpForce: 8.0,
  gravity: 25,
  eyeHeight: 1.6,
  halfWidth: 0.3,
  halfHeight: 0.9,
  flyMode: false,
};

export const MINA_PLAYER: PlayerConfig = {
  walkSpeed: 3.5,
  runSpeed: 5.0,
  jumpForce: 7.0,
  gravity: 20,
  eyeHeight: 1.4,
  halfWidth: 0.25,
  halfHeight: 0.8,
  flyMode: false,
};

export class PlayerController {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  yaw: number = 0;
  pitch: number = 0;
  onGround: boolean = false;
  config: PlayerConfig;
  world: VoxelWorld;
  camera: THREE.PerspectiveCamera;

  // Input state
  private keys: Record<string, boolean> = {};
  private mouseLocked: boolean = false;

  constructor(world: VoxelWorld, camera: THREE.PerspectiveCamera, config: PlayerConfig) {
    this.world = world;
    this.camera = camera;
    this.config = config;
    this.position = new THREE.Vector3(0, 40, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
  }

  /** Place player on the surface at (x, z), lifted for a better vantage point */
  spawn(x: number, z: number): void {
    const h = this.world.getSurfaceHeight(x, z);
    this.position.set(x + 0.5, h + this.config.halfHeight + 8, z + 0.5);
    this.velocity.set(0, 0, 0);
  }

  setKey(code: string, down: boolean): void {
    this.keys[code] = down;
  }

  isKeyDown(code: string): boolean {
    return !!this.keys[code];
  }

  setMouseLook(yaw: number, pitch: number): void {
    this.yaw = yaw;
    this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch));
  }

  addMouseDelta(dx: number, dy: number, sensitivity = 0.002): void {
    this.yaw -= dx * sensitivity;
    this.pitch -= dy * sensitivity;
    this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch));
  }

  /** Get the camera look direction (normalized) */
  getLookDirection(): THREE.Vector3 {
    const dir = new THREE.Vector3(0, 0, 0);
    dir.x = -Math.sin(this.yaw) * Math.cos(this.pitch);
    dir.y = Math.sin(this.pitch);
    dir.z = -Math.cos(this.yaw) * Math.cos(this.pitch);
    return dir.normalize();
  }

  /** Get the block the player is currently looking at */
  getTargetedBlock(maxDist = 32): { block: [number, number, number]; normal: [number, number, number] } | null {
    const eyePos: [number, number, number] = [
      this.position.x,
      this.position.y + this.config.eyeHeight - this.config.halfHeight,
      this.position.z,
    ];
    const dir = this.getLookDirection();
    const hit = raycastVoxel(this.world, eyePos, [dir.x, dir.y, dir.z], maxDist);
    if (!hit) return null;
    return { block: hit.block, normal: hit.normal };
  }

  /** Break the block the player is looking at */
  breakBlock(maxDist = 32): boolean {
    const target = this.getTargetedBlock(maxDist);
    if (!target) return false;
    const [x, y, z] = target.block;
    const id = this.world.getBlock(x, y, z);
    if (id === BlockType.Bedrock) return false; // can't break bedrock
    return this.world.setBlock(x, y, z, BlockType.Air);
  }

  /** Place a block adjacent to the one the player is looking at */
  placeBlock(blockId: number, maxDist = 32): boolean {
    const target = this.getTargetedBlock(maxDist);
    if (!target) return false;
    const [x, y, z] = target.block;
    const [nx, ny, nz] = target.normal;
    const placeX = x + nx;
    const placeY = y + ny;
    const placeZ = z + nz;

    // Don't place inside the player
    const playerMin = [
      this.position.x - this.config.halfWidth,
      this.position.y - this.config.halfHeight,
      this.position.z - this.config.halfWidth,
    ];
    const playerMax = [
      this.position.x + this.config.halfWidth,
      this.position.y + this.config.halfHeight,
      this.position.z + this.config.halfWidth,
    ];
    if (
      placeX >= Math.floor(playerMin[0]) && placeX <= Math.floor(playerMax[0]) &&
      placeY >= Math.floor(playerMin[1]) && placeY <= Math.floor(playerMax[1]) &&
      placeZ >= Math.floor(playerMin[2]) && placeZ <= Math.floor(playerMax[2])
    ) {
      return false;
    }

    return this.world.setBlock(placeX, placeY, placeZ, blockId);
  }

  /** Update physics and movement. dt is seconds. */
  update(dt: number): void {
    dt = Math.min(dt, 0.05); // clamp to prevent huge steps

    const speed = this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight')
      ? this.config.runSpeed
      : this.config.walkSpeed;

    // Calculate movement direction from yaw
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const moveDir = new THREE.Vector3(0, 0, 0);
    if (this.isKeyDown('KeyW')) moveDir.add(forward);
    if (this.isKeyDown('KeyS')) moveDir.sub(forward);
    if (this.isKeyDown('KeyD')) moveDir.add(right);
    if (this.isKeyDown('KeyA')) moveDir.sub(right);

    if (moveDir.lengthSq() > 0) moveDir.normalize().multiplyScalar(speed);

    this.velocity.x = moveDir.x;
    this.velocity.z = moveDir.z;

    // Gravity / jump / fly
    if (this.config.flyMode) {
      this.velocity.y = 0;
      if (this.isKeyDown('Space')) this.velocity.y = speed;
      if (this.isKeyDown('ShiftLeft')) this.velocity.y = -speed;
    } else {
      this.velocity.y -= this.config.gravity * dt;
      if (this.isKeyDown('Space') && this.onGround) {
        this.velocity.y = this.config.jumpForce;
        this.onGround = false;
      }
    }

    // Move with collision, axis-by-axis (sweep and slide)
    this.moveAxis(0, this.velocity.x * dt);
    this.moveAxis(1, this.velocity.y * dt);
    this.moveAxis(2, this.velocity.z * dt);

    // Update camera
    this.camera.position.set(
      this.position.x,
      this.position.y + this.config.eyeHeight - this.config.halfHeight,
      this.position.z,
    );
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  /** Move along a single axis with collision */
  private moveAxis(axis: 0 | 1 | 2, amount: number): void {
    if (amount === 0) return;

    const oldPos = this.position.clone();
    const newPos = this.position.clone();
    (newPos as any).toArray()[axis] += amount;
    // Simpler:
    if (axis === 0) newPos.x += 0; // already set above
    if (axis === 1) newPos.y = oldPos.y + amount;
    if (axis === 2) newPos.z = oldPos.z + amount;

    // Actually re-do properly:
    const tryPos = this.position.clone();
    if (axis === 0) tryPos.x += amount;
    if (axis === 1) tryPos.y += amount;
    if (axis === 2) tryPos.z += amount;

    const collides = checkAABBCollision(
      this.world,
      [tryPos.x, tryPos.y, tryPos.z],
      [this.config.halfWidth, this.config.halfHeight, this.config.halfWidth],
    );

    if (collides) {
      if (axis === 1) {
        if (amount < 0) this.onGround = true;
        this.velocity.y = 0;
      } else {
        // Stop on this axis
        if (axis === 0) this.velocity.x = 0;
        if (axis === 2) this.velocity.z = 0;
      }
    } else {
      this.position.copy(tryPos);
      if (axis === 1 && amount < 0) this.onGround = false;
    }
  }

  /** Toggle fly mode (lab feature) */
  toggleFly(): void {
    this.config.flyMode = !this.config.flyMode;
    this.velocity.y = 0;
  }
}