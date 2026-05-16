export interface TileMap {
  width: number;
  height: number;
  tileSize: number;
  layers: TileLayer[];
}

export interface TileLayer {
  id: string;
  name: string;
  tiles: (number | null)[][];
  tileset: string;
}

export interface Building {
  id: string;
  type: 'house' | 'school' | 'shop' | 'park' | 'fountain' | 'tree' | 'flower';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color?: string;
  interior?: InteriorData;
}

export interface InteriorData {
  walls: Wall[];
  furniture: Furniture[];
  wallpaper: string;
  flooring: string;
}

export interface Wall {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Furniture {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  color: string;
}

export interface WorldTheme {
  primaryColor: string;
  secondaryColor: string;
  skyGradient: [string, string];
  ambientLight: number;
  weather: 'clear' | 'rain' | 'snow' | 'sunny' | 'sunset';
}

export interface WorldData {
  id: string;
  name: string;
  description: string | null;
  biome: BiomeType;
  theme: WorldTheme;
  tileMap: TileMap;
  buildings: Building[];
  ownerId: string;
  isPublic: boolean;
  visitCount: number;
  createdAt: string;
  updatedAt: string;
}

export type BiomeType = 
  | 'meadow'
  | 'city'
  | 'beach'
  | 'forest'
  | 'space'
  | 'candy'
  | 'underwater'
  | 'desert'
  | 'snow';

export const BIOME_OPTIONS: { id: BiomeType; label: string; color: string; icon: string }[] = [
  { id: 'meadow', label: 'Meadow', color: '#90EE90', icon: '🌿' },
  { id: 'city', label: 'City', color: '#A9A9A9', icon: '🏙️' },
  { id: 'beach', label: 'Beach', color: '#F4A460', icon: '🏖️' },
  { id: 'forest', label: 'Forest', color: '#228B22', icon: '🌲' },
  { id: 'space', label: 'Space', color: '#4B0082', icon: '🚀' },
  { id: 'candy', label: 'Candy Land', color: '#FF69B4', icon: '🍬' },
  { id: 'underwater', label: 'Underwater', color: '#00CED1', icon: '🐠' },
  { id: 'desert', label: 'Desert', color: '#F4A460', icon: '🌵' },
  { id: 'snow', label: 'Snow', color: '#E0E0E0', icon: '❄️' },
];

export const DEFAULT_TILE_SIZE = 32;
export const DEFAULT_MAP_WIDTH = 40;
export const DEFAULT_MAP_HEIGHT = 30;

export const TILESET_COLORS: Record<BiomeType, string[]> = {
  meadow: ['#90EE90', '#7CFC00', '#32CD32', '#228B22', '#6B8E23'],
  city: ['#A9A9A9', '#808080', '#696969', '#D3D3D3', '#C0C0C0'],
  beach: ['#F4A460', '#DEB887', '#D2691E', '#FFE4B5', '#FFDEAD'],
  forest: ['#228B22', '#006400', '#556B2F', '#8FBC8F', '#2E8B57'],
  space: ['#000080', '#4B0082', '#191970', '#483D8B', '#6A5ACD'],
  candy: ['#FF69B4', '#FFB6C1', '#FF1493', '#FFC0CB', '#FFE4E1'],
  underwater: ['#00CED1', '#20B2AA', '#48D1CC', '#40E0D0', '#00FFFF'],
  desert: ['#F4A460', '#DEB887', '#D2691E', '#CD853F', '#BC8F8F'],
  snow: ['#FFFFFF', '#F0F8FF', '#E6E6FA', '#D3D3D3', '#C0C0C0'],
};

export const BUILDING_TYPES = [
  { id: 'house', label: 'House', icon: '🏠', width: 3, height: 3, color: '#FFB6C1' },
  { id: 'school', label: 'School', icon: '🏫', width: 4, height: 3, color: '#87CEEB' },
  { id: 'shop', label: 'Shop', icon: '🏪', width: 2, height: 2, color: '#F0E68C' },
  { id: 'park', label: 'Park', icon: '🌳', width: 4, height: 4, color: '#90EE90' },
  { id: 'fountain', label: 'Fountain', icon: '⛲', width: 2, height: 2, color: '#00BFFF' },
  { id: 'tree', label: 'Tree', icon: '🌲', width: 1, height: 1, color: '#228B22' },
  { id: 'flower', label: 'Flowers', icon: '🌸', width: 1, height: 1, color: '#FF69B4' },
] as const;

export function createDefaultTileMap(biome: BiomeType): TileMap {
  const colors = TILESET_COLORS[biome];
  const tiles: (number | null)[][] = [];
  
  for (let y = 0; y < DEFAULT_MAP_HEIGHT; y++) {
    const row: (number | null)[] = [];
    for (let x = 0; x < DEFAULT_MAP_WIDTH; x++) {
      // Create some variation in the ground
      const colorIndex = Math.floor(Math.random() * colors.length);
      row.push(colorIndex);
    }
    tiles.push(row);
  }
  
  return {
    width: DEFAULT_MAP_WIDTH,
    height: DEFAULT_MAP_HEIGHT,
    tileSize: DEFAULT_TILE_SIZE,
    layers: [
      {
        id: 'ground',
        name: 'Ground',
        tiles,
        tileset: biome,
      },
      {
        id: 'objects',
        name: 'Objects',
        tiles: Array(DEFAULT_MAP_HEIGHT).fill(null).map(() => Array(DEFAULT_MAP_WIDTH).fill(null)),
        tileset: biome,
      },
    ],
  };
}

export function createDefaultTheme(biome: BiomeType): WorldTheme {
  const themeMap: Record<BiomeType, WorldTheme> = {
    meadow: {
      primaryColor: '#90EE90',
      secondaryColor: '#FFD700',
      skyGradient: ['#87CEEB', '#E0F6FF'],
      ambientLight: 1,
      weather: 'sunny',
    },
    city: {
      primaryColor: '#A9A9A9',
      secondaryColor: '#FFD700',
      skyGradient: ['#B0C4DE', '#E6E6FA'],
      ambientLight: 0.9,
      weather: 'clear',
    },
    beach: {
      primaryColor: '#F4A460',
      secondaryColor: '#00CED1',
      skyGradient: ['#00BFFF', '#87CEEB'],
      ambientLight: 1.1,
      weather: 'sunny',
    },
    forest: {
      primaryColor: '#228B22',
      secondaryColor: '#8B4513',
      skyGradient: ['#228B22', '#90EE90'],
      ambientLight: 0.7,
      weather: 'clear',
    },
    space: {
      primaryColor: '#4B0082',
      secondaryColor: '#FFD700',
      skyGradient: ['#000080', '#4B0082'],
      ambientLight: 0.5,
      weather: 'clear',
    },
    candy: {
      primaryColor: '#FF69B4',
      secondaryColor: '#FFB6C1',
      skyGradient: ['#FFB6C1', '#FFE4E1'],
      ambientLight: 1.2,
      weather: 'sunny',
    },
    underwater: {
      primaryColor: '#00CED1',
      secondaryColor: '#4682B4',
      skyGradient: ['#006994', '#00CED1'],
      ambientLight: 0.6,
      weather: 'clear',
    },
    desert: {
      primaryColor: '#F4A460',
      secondaryColor: '#DEB887',
      skyGradient: ['#FFD700', '#F4A460'],
      ambientLight: 1.3,
      weather: 'sunny',
    },
    snow: {
      primaryColor: '#FFFFFF',
      secondaryColor: '#87CEEB',
      skyGradient: ['#B0C4DE', '#FFFFFF'],
      ambientLight: 1,
      weather: 'snow',
    },
  };
  
  return themeMap[biome];
}
