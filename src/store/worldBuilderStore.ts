import { create } from 'zustand';
import {
  WorldData,
  BiomeType,
  Building,
  TileMap,
  WorldTheme,
  createDefaultTileMap,
  createDefaultTheme,
} from '@/types/world';

interface WorldBuilderState {
  // Current world being edited
  currentWorld: Partial<WorldData> | null;
  
  // Builder state
  selectedTool: 'brush' | 'eraser' | 'building' | 'select';
  selectedBiome: BiomeType;
  selectedBuildingType: string | null;
  selectedColor: string;
  brushSize: number;
  
  // Canvas state
  zoom: number;
  pan: { x: number; y: number };
  
  // Actions
  createNewWorld: (name: string, biome: BiomeType) => void;
  setSelectedTool: (tool: 'brush' | 'eraser' | 'building' | 'select') => void;
  setSelectedBiome: (biome: BiomeType) => void;
  setSelectedBuildingType: (type: string | null) => void;
  setSelectedColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  
  // World editing
  updateTile: (layerId: string, x: number, y: number, value: number | null) => void;
  addBuilding: (building: Building) => void;
  removeBuilding: (buildingId: string) => void;
  updateBuilding: (buildingId: string, updates: Partial<Building>) => void;
  updateTheme: (theme: Partial<WorldTheme>) => void;
  
  // Save/Load
  setCurrentWorld: (world: Partial<WorldData> | null) => void;
}

export const useWorldBuilderStore = create<WorldBuilderState>((set, get) => ({
  currentWorld: null,
  selectedTool: 'brush',
  selectedBiome: 'meadow',
  selectedBuildingType: null,
  selectedColor: '#90EE90',
  brushSize: 1,
  zoom: 1,
  pan: { x: 0, y: 0 },

  createNewWorld: (name, biome) => {
    const tileMap = createDefaultTileMap(biome);
    const theme = createDefaultTheme(biome);
    
    set({
      currentWorld: {
        name,
        biome,
        theme,
        tileMap,
        buildings: [],
        isPublic: false,
        visitCount: 0,
      },
      selectedBiome: biome,
      selectedColor: tileMap.layers[0].tiles[0]?.[0] !== null 
        ? '#90EE90' 
        : '#FFFFFF',
    });
  },

  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setSelectedBiome: (biome) => set({ selectedBiome: biome }),
  setSelectedBuildingType: (type) => set({ selectedBuildingType: type }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setBrushSize: (size) => set({ brushSize: size }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3, zoom)) }),
  setPan: (pan) => set({ pan }),

  updateTile: (layerId, x, y, value) => {
    const { currentWorld } = get();
    if (!currentWorld?.tileMap) return;

    const newTileMap = { ...currentWorld.tileMap };
    const layerIndex = newTileMap.layers.findIndex((l) => l.id === layerId);
    if (layerIndex === -1) return;

    const newLayers = [...newTileMap.layers];
    const newLayer = { ...newLayers[layerIndex] };
    const newTiles = newLayer.tiles.map((row, rowIndex) =>
      rowIndex === y
        ? row.map((cell, cellIndex) => (cellIndex === x ? value : cell))
        : row
    );
    newLayer.tiles = newTiles;
    newLayers[layerIndex] = newLayer;
    newTileMap.layers = newLayers;

    set({
      currentWorld: { ...currentWorld, tileMap: newTileMap },
    });
  },

  addBuilding: (building) => {
    const { currentWorld } = get();
    if (!currentWorld) return;

    const buildings = [...(currentWorld.buildings || []), building];
    set({ currentWorld: { ...currentWorld, buildings } });
  },

  removeBuilding: (buildingId) => {
    const { currentWorld } = get();
    if (!currentWorld) return;

    const buildings = (currentWorld.buildings || []).filter(
      (b) => b.id !== buildingId
    );
    set({ currentWorld: { ...currentWorld, buildings } });
  },

  updateBuilding: (buildingId, updates) => {
    const { currentWorld } = get();
    if (!currentWorld) return;

    const buildings = (currentWorld.buildings || []).map((b) =>
      b.id === buildingId ? { ...b, ...updates } : b
    );
    set({ currentWorld: { ...currentWorld, buildings } });
  },

  updateTheme: (themeUpdates) => {
    const { currentWorld } = get();
    if (!currentWorld?.theme) return;

    set({
      currentWorld: {
        ...currentWorld,
        theme: { ...currentWorld.theme, ...themeUpdates },
      },
    });
  },

  setCurrentWorld: (world) => set({ currentWorld: world }),
}));
