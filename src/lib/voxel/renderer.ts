/**
 * VoxelCanvas — Three.js Renderer
 * 
 * Takes chunk mesh data from the voxel engine and creates
 * Three.js BufferGeometries. Manages the scene, camera, lighting,
 * sky color, fog, and the render loop.
 */

import * as THREE from 'three';
import { VoxelWorld } from './world';
import { Chunk, CHUNK_SIZE } from './chunk';
import { PlayerController } from './player';
import { BlockType } from './blocks';
import { EngineSettings } from './engineStore';

interface ChunkMeshEntry {
  mesh: THREE.Mesh;
  wireframe: THREE.LineSegments;
  chunk: Chunk;
}

export class VoxelRenderer {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  world: VoxelWorld;
  player: PlayerController;
  settings: EngineSettings;
  chunkMeshes: Map<string, ChunkMeshEntry> = new Map();
  private highlightMesh: THREE.LineSegments;
  private sunLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private skyColor = new THREE.Color(0x87ceeb);

  private lastTime = performance.now();
  private frameCount = 0;
  private fpsTime = 0;
  public fps = 0;
  public chunkCount = 0;
  public loadedChunks = 0;

  private animFrameId: number = 0;
  private onTick: ((dt: number, fps: number) => void) | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    world: VoxelWorld,
    player: PlayerController,
    settings: EngineSettings,
  ) {
    this.world = world;
    this.player = player;
    this.settings = settings;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = this.skyColor;
    this.scene.fog = new THREE.FogExp2(this.skyColor.getHex(), settings.fogDensity);

    // Camera — use the player's camera so player.update() controls it
    this.camera = player.camera;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.sunLight.position.set(50, 100, 30);
    this.scene.add(this.sunLight);

    // Block highlight (wireframe box)
    const boxGeo = new THREE.BoxGeometry(1.002, 1.002, 1.002);
    const edges = new THREE.EdgesGeometry(boxGeo);
    this.highlightMesh = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 }),
    );
    this.highlightMesh.visible = false;
    this.scene.add(this.highlightMesh);
  }

  /** Resize the renderer to match the canvas parent */
  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  /** Update lighting and sky based on time of day (0=midnight, 0.5=noon) */
  updateTimeOfDay(time: number): void {
    // Simple day/night cycle
    const sunAngle = time * Math.PI * 2 - Math.PI / 2;
    const sunY = Math.sin(sunAngle);
    const sunX = Math.cos(sunAngle);

    this.sunLight.position.set(sunX * 100, Math.max(sunY, 0.05) * 100, 30);

    // Sky color interpolation
    const dayColor = new THREE.Color(0x87ceeb);
    const nightColor = new THREE.Color(0x0a0a2a);
    const sunsetColor = new THREE.Color(0xff8c42);

    let sky: THREE.Color;
    if (sunY > 0.2) {
      sky = dayColor;
    } else if (sunY > -0.1) {
      // Sunset/sunrise blend
      const t = (sunY + 0.1) / 0.3;
      sky = nightColor.clone().lerp(dayColor, t).lerp(sunsetColor, 1 - Math.abs(sunY - 0.05) * 5);
    } else {
      sky = nightColor;
    }

    this.skyColor.copy(sky);
    this.scene.background = sky;
    this.scene.fog = new THREE.FogExp2(sky.getHex(), this.settings.fogDensity);

    // Ambient intensity follows sun
    this.ambientLight.intensity = 0.3 + Math.max(sunY, 0) * 0.5;
    this.sunLight.intensity = 0.2 + Math.max(sunY, 0) * 0.8;
  }

  /**
   * Build or rebuild a chunk mesh in Three.js.
   */
  buildChunkMesh(chunk: Chunk): void {
    const key = `${chunk.cx},${chunk.cz}`;
    const existing = this.chunkMeshes.get(key);

    // Generate mesh data if needed
    if (!chunk.isMeshed) {
      this.world.buildChunkMesh(chunk);
    }

    // Remove old mesh
    if (existing) {
      this.scene.remove(existing.mesh);
      this.scene.remove(existing.wireframe);
      existing.mesh.geometry.dispose();
      (existing.mesh.material as THREE.Material).dispose();
      existing.wireframe.geometry.dispose();
      (existing.wireframe.material as THREE.Material).dispose();
      this.chunkMeshes.delete(key);
    }

    if (!chunk.meshData) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(chunk.meshData.positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(chunk.meshData.normals, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(chunk.meshData.colors, 3));
    geometry.setIndex(new THREE.BufferAttribute(chunk.meshData.indices, 1));

    const material = new THREE.MeshLambertMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(chunk.cx * CHUNK_SIZE, 0, chunk.cz * CHUNK_SIZE);
    this.scene.add(mesh);

    // Wireframe overlay (for lab debug mode)
    const wireGeo = new THREE.WireframeGeometry(geometry);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.15 });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    wireframe.position.copy(mesh.position);
    wireframe.visible = this.settings.showWireframe;
    this.scene.add(wireframe);

    this.chunkMeshes.set(key, { mesh, wireframe, chunk });
  }

  /**
   * Update which chunks are visible — generate and mesh chunks
   * within renderDistance of the player.
   */
  updateChunks(): void {
    const pcx = Math.floor(this.player.position.x / CHUNK_SIZE);
    const pcz = Math.floor(this.player.position.z / CHUNK_SIZE);
    const r = this.settings.renderDistance;

    // Load chunks in radius
    const chunks = this.world.getChunksInRadius(pcx, pcz, r);
    this.loadedChunks = chunks.length;

    for (const chunk of chunks) {
      if (!chunk.isMeshed) {
        this.buildChunkMesh(chunk);
      }
    }

    // Unload chunks beyond render distance + 2
    for (const [key, entry] of this.chunkMeshes) {
      const dx = entry.chunk.cx - pcx;
      const dz = entry.chunk.cz - pcz;
      if (Math.sqrt(dx * dx + dz * dz) > r + 2) {
        this.scene.remove(entry.mesh);
        this.scene.remove(entry.wireframe);
        entry.mesh.geometry.dispose();
        (entry.mesh.material as THREE.Material).dispose();
        entry.wireframe.geometry.dispose();
        (entry.wireframe.material as THREE.Material).dispose();
        this.chunkMeshes.delete(key);
      }
    }

    this.chunkCount = this.chunkMeshes.size;
  }

  /** Update block highlight position */
  updateHighlight(): void {
    const target = this.player.getTargetedBlock(32);
    if (target) {
      const [x, y, z] = target.block;
      this.highlightMesh.position.set(x + 0.5, y + 0.5, z + 0.5);
      this.highlightMesh.visible = true;
    } else {
      this.highlightMesh.visible = false;
    }
  }

  /** Set the tick callback for HUD updates */
  setTickCallback(cb: (dt: number, fps: number) => void): void {
    this.onTick = cb;
  }

  /** Update settings from the store */
  updateSettings(settings: EngineSettings): void {
    this.settings = settings;
    this.camera.fov = settings.fov;
    this.camera.updateProjectionMatrix();
    this.player.config.flyMode = settings.flyMode;
    this.player.config.gravity = settings.gravity;

    // Toggle wireframes
    for (const entry of this.chunkMeshes.values()) {
      entry.wireframe.visible = settings.showWireframe;
    }
  }

  /** Start the render loop */
  start(): void {
    this.lastTime = performance.now();
    const loop = () => {
      const now = performance.now();
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;

      // FPS counter
      this.frameCount++;
      this.fpsTime += dt;
      if (this.fpsTime >= 0.5) {
        this.fps = Math.round(this.frameCount / this.fpsTime);
        this.frameCount = 0;
        this.fpsTime = 0;
      }

      // Update player physics
      this.player.update(dt);

      // Periodically update chunks (every ~5 frames to reduce lag)
      if (this.frameCount % 5 === 0) {
        this.updateChunks();
      }

      this.updateHighlight();
      this.renderer.render(this.scene, this.camera);

      if (this.onTick) this.onTick(dt, this.fps);

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  /** Stop the render loop */
  stop(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = 0;
  }

  /** Dispose all resources */
  dispose(): void {
    this.stop();
    for (const entry of this.chunkMeshes.values()) {
      entry.mesh.geometry.dispose();
      (entry.mesh.material as THREE.Material).dispose();
      entry.wireframe.geometry.dispose();
      (entry.wireframe.material as THREE.Material).dispose();
    }
    this.chunkMeshes.clear();
    this.renderer.dispose();
  }
}