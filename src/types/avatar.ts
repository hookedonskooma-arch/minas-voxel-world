export interface AvatarAppearance {
  version: number;
  body: {
    size: 'tiny' | 'small' | 'medium';
    skinTone: string;
  };
  face: {
    eyeShape: 'thin' | 'big' | 'sparkly' | 'sleepy';
    eyeColor: string;
    blush: 'none' | 'soft' | 'rosy' | 'dramatic';
  };
  hair: {
    length: 'short' | 'medium' | 'long' | 'extra_long';
    style: 'straight' | 'curly' | 'pigtails' | 'spiky' | 'bob';
    color: string;
    highlightColor?: string;
  };
  clothing: {
    top: 'dress' | 'shirt' | 'hoodie' | 'kimono';
    bottom?: 'skirt' | 'pants' | 'shorts' | 'none';
    material: 'lace' | 'leather' | 'cotton' | 'silk' | 'denim';
    primaryColor: string;
    secondaryColor?: string;
    pattern?: 'solid' | 'stripes' | 'dots' | 'floral' | 'checkered';
  };
  accessories: string[];
}

export interface Avatar {
  id: string;
  user_id: string;
  name: string;
  appearance: AvatarAppearance;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_AVATAR: AvatarAppearance = {
  version: 1,
  body: {
    size: 'small',
    skinTone: '#FFDBAC',
  },
  face: {
    eyeShape: 'big',
    eyeColor: '#00B398',
    blush: 'soft',
  },
  hair: {
    length: 'long',
    style: 'pigtails',
    color: '#F2A900',
    highlightColor: '#FFD700',
  },
  clothing: {
    top: 'dress',
    material: 'lace',
    primaryColor: '#FFFFFF',
    secondaryColor: '#FFB6C1',
    pattern: 'dots',
  },
  accessories: ['bow'],
};

export const AVATAR_OPTIONS = {
  body: {
    size: ['tiny', 'small', 'medium'] as const,
    skinTones: ['#FFDBAC', '#F1C27D', '#E0AC69', '#8D5524', '#C68642', '#FFDFC4'],
  },
  face: {
    eyeShape: ['thin', 'big', 'sparkly', 'sleepy'] as const,
    eyeColors: ['#00B398', '#004F71', '#CF4520', '#F2A900', '#8B4513', '#4B0082', '#FF1493'],
    blush: ['none', 'soft', 'rosy', 'dramatic'] as const,
  },
  hair: {
    length: ['short', 'medium', 'long', 'extra_long'] as const,
    style: ['straight', 'curly', 'pigtails', 'spiky', 'bob'] as const,
    colors: ['#F2A900', '#FF1493', '#00B398', '#004F71', '#CF4520', '#8B4513', '#000000', '#FFD700', '#C0C0C0'],
  },
  clothing: {
    top: ['dress', 'shirt', 'hoodie', 'kimono'] as const,
    bottom: ['skirt', 'pants', 'shorts', 'none'] as const,
    material: ['lace', 'leather', 'cotton', 'silk', 'denim'] as const,
    colors: ['#FFFFFF', '#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C', '#000000', '#FF6347'],
    pattern: ['solid', 'stripes', 'dots', 'floral', 'checkered'] as const,
  },
  accessories: ['glasses', 'hat', 'wings', 'tail', 'backpack', 'pet_cat', 'pet_dog', 'bow'] as const,
};
