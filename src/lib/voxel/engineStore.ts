/**
 * VoxelCanvas — Engine Store (Zustand)
 * 
 * Manages the dual-mode system: Mina Mode (kid-safe sandbox)
 * and Lab Mode (developer prototyping). Controls the engine
 * configuration, selected block, and mode-specific settings.
 */

import { create } from 'zustand';
import { BlockType, MINA_PALETTE, LAB_PALETTE } from './blocks';
import { WorldGenConfig, DEFAULT_GEN, MINA_GEN } from './worldgen';
import { PlayerConfig, DEFAULT_PLAYER, MINA_PLAYER } from './player';

export type GameMode = 'mina' | 'lab';

export interface EngineSettings {
  mode: GameMode;
  renderDistance: number; // in chunks
  fov: number;
  flyMode: boolean;
  showDebug: boolean;
  showWireframe: boolean;
  showGrid: boolean;
  gravity: number;
  timeOfDay: number; // 0..1
  fogDensity: number;
}

interface VoxelEngineState {
  // Mode
  mode: GameMode;
  settings: EngineSettings;
  selectedBlock: BlockType;
  palette: BlockType[];

  // World gen config (changes per mode)
  worldGen: WorldGenConfig;
  playerConfig: PlayerConfig;

  // Actions
  setMode: (mode: GameMode) => void;
  setSelectedBlock: (block: BlockType) => void;
  setRenderDistance: (r: number) => void;
  setFlyMode: (on: boolean) => void;
  toggleFly: () => void;
  toggleDebug: () => void;
  toggleWireframe: () => void;
  setGravity: (g: number) => void;
  setTimeOfDay: (t: number) => void;
  setFogDensity: (d: number) => void;
  setWorldGenSeed: (seed: number) => void;

  // Reset
  resetToWorld: () => void;
}

export const MINA_SETTINGS: EngineSettings = {
  mode: 'mina',
  renderDistance: 4,
  fov: 70,
  flyMode: false,
  showDebug: false,
  showWireframe: false,
  showGrid: false,
  gravity: 20,
  timeOfDay: 0.35,
  fogDensity: 0.015,
};

export const LAB_SETTINGS: EngineSettings = {
  mode: 'lab',
  renderDistance: 6,
  fov: 75,
  flyMode: true,
  showDebug: true,
  showWireframe: false,
  showGrid: true,
  gravity: 25,
  timeOfDay: 0.4,
  fogDensity: 0.008,
};

export const useVoxelEngine = create<VoxelEngineState>((set, get) => ({
  mode: 'mina',
  settings: MINA_SETTINGS,
  selectedBlock: BlockType.Grass,
  palette: MINA_PALETTE,
  worldGen: { ...MINA_GEN },
  playerConfig: { ...MINA_PLAYER },

  setMode: (mode) => {
    if (mode === 'mina') {
      set({
        mode: 'mina',
        settings: MINA_SETTINGS,
        palette: MINA_PALETTE,
        worldGen: { ...MINA_GEN },
        playerConfig: { ...MINA_PLAYER },
        selectedBlock: BlockType.Grass,
      });
    } else {
      set({
        mode: 'lab',
        settings: LAB_SETTINGS,
        palette: LAB_PALETTE,
        worldGen: { ...DEFAULT_GEN },
        playerConfig: { ...DEFAULT_PLAYER },
        selectedBlock: BlockType.Stone,
      });
    }
  },

  setSelectedBlock: (block) => set({ selectedBlock: block }),

  setRenderDistance: (r) => set((s) => ({ settings: { ...s.settings, renderDistance: Math.max(1, Math.min(12, r)) } })),

  setFlyMode: (on) => set((s) => ({ settings: { ...s.settings, flyMode: on } })),

  toggleFly: () => set((s) => ({ settings: { ...s.settings, flyMode: !s.settings.flyMode } })),

  toggleDebug: () => set((s) => ({ settings: { ...s.settings, showDebug: !s.settings.showDebug } })),

  toggleWireframe: () => set((s) => ({ settings: { ...s.settings, showWireframe: !s.settings.showWireframe } })),

  setGravity: (g) => set((s) => ({ settings: { ...s.settings, gravity: g } })),

  setTimeOfDay: (t) => set((s) => ({ settings: { ...s.settings, timeOfDay: Math.max(0, Math.min(1, t)) } })),

  setFogDensity: (d) => set((s) => ({ settings: { ...s.settings, fogDensity: d } })),

  setWorldGenSeed: (seed) => set((s) => ({ worldGen: { ...s.worldGen, seed } })),

  resetToWorld: () => set((s) => ({
    worldGen: s.mode === 'mina' ? { ...MINA_GEN } : { ...DEFAULT_GEN },
  })),
}));