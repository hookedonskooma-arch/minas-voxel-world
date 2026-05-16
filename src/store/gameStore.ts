import { create } from 'zustand';

export interface PlacedObject {
  id: string;
  x: number;
  y: number;
  type: string;
  emoji: string;
  placedBy: string;
  placedAt: string;
}

export interface InventoryItem {
  id: string;
  type: 'outfit' | 'object' | 'sticker' | 'badge' | 'tile';
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  equipped?: boolean;
}

export interface QuestProgress {
  questId: string;
  treesPlaced: number;
  friendsInvited: number;
  worldNamed: boolean;
  completed: boolean;
  completedAt?: string;
}

interface GameState {
  // Avatar position in tile coordinates
  avatarPosition: { x: number; y: number };
  facing: 'up' | 'down' | 'left' | 'right';
  isWalking: boolean;

  // World objects
  placedObjects: PlacedObject[];

  // Inventory
  inventory: InventoryItem[];
  coins: number;

  // Quests
  activeQuest: QuestProgress | null;

  // Actions
  moveAvatar: (dx: number, dy: number) => void;
  placeObject: (x: number, y: number, type: string, emoji: string, placedBy: string) => void;
  removeObject: (id: string) => void;
  addToInventory: (item: InventoryItem) => void;
  spendCoins: (amount: number) => boolean;
  earnCoins: (amount: number) => void;
  equipItem: (id: string) => void;
  startQuest: (questId: string) => void;
  updateQuestProgress: (updates: Partial<Omit<QuestProgress, 'questId'>>) => void;
  completeQuest: () => void;
  resetGame: () => void;
}

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 'sticker-wave', type: 'sticker', name: 'Wave', emoji: '👋', rarity: 'common', quantity: 99 },
  { id: 'sticker-heart', type: 'sticker', name: 'Heart', emoji: '❤️', rarity: 'common', quantity: 99 },
  { id: 'sticker-star', type: 'sticker', name: 'Star', emoji: '🌟', rarity: 'common', quantity: 99 },
  { id: 'sticker-bow', type: 'sticker', name: 'Bow', emoji: '🎀', rarity: 'common', quantity: 99 },
  { id: 'sticker-flower', type: 'sticker', name: 'Flower', emoji: '🌸', rarity: 'common', quantity: 99 },
  { id: 'sticker-cloud', type: 'sticker', name: 'Cloud', emoji: '☁️', rarity: 'common', quantity: 99 },
  { id: 'sticker-sparkle', type: 'sticker', name: 'Sparkle', emoji: '✨', rarity: 'common', quantity: 99 },
  { id: 'sticker-game', type: 'sticker', name: 'Game', emoji: '🎮', rarity: 'common', quantity: 99 },
];

const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;

export const useGameStore = create<GameState>((set, get) => ({
  avatarPosition: { x: 2, y: 2 },
  facing: 'down',
  isWalking: false,
  placedObjects: [],
  inventory: DEFAULT_INVENTORY,
  coins: 100,
  activeQuest: {
    questId: 'cloud-garden',
    treesPlaced: 0,
    friendsInvited: 0,
    worldNamed: false,
    completed: false,
  },

  moveAvatar: (dx, dy) => {
    const { avatarPosition, placedObjects, isWalking } = get();
    if (isWalking) return;

    const newX = Math.max(0, Math.min(GRID_WIDTH - 1, avatarPosition.x + dx));
    const newY = Math.max(0, Math.min(GRID_HEIGHT - 1, avatarPosition.y + dy));

    // Collision check — can't walk through placed objects
    const blocked = placedObjects.some((obj) => obj.x === newX && obj.y === newY);
    if (blocked) return;

    const facing = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';

    set({
      avatarPosition: { x: newX, y: newY },
      facing,
      isWalking: true,
    });

    setTimeout(() => {
      set({ isWalking: false });
    }, 150);
  },

  placeObject: (x, y, type, emoji, placedBy) => {
    const { placedObjects, activeQuest } = get();

    // Can't place where avatar is
    const { avatarPosition } = get();
    if (avatarPosition.x === x && avatarPosition.y === y) return;

    // Can't place on existing object
    if (placedObjects.some((obj) => obj.x === x && obj.y === y)) return;

    const newObject: PlacedObject = {
      id: `${placedBy}-${Date.now()}`,
      x,
      y,
      type,
      emoji,
      placedBy,
      placedAt: new Date().toISOString(),
    };

    const nextObjects = [...placedObjects, newObject];
    const treeCount = nextObjects.filter((o) => o.type === 'tree').length;

    set({
      placedObjects: nextObjects,
      activeQuest: activeQuest
        ? {
            ...activeQuest,
            treesPlaced: treeCount,
          }
        : null,
    });

    // Check quest completion
    if (activeQuest && treeCount >= 3 && !activeQuest.completed) {
      setTimeout(() => {
        get().completeQuest();
      }, 500);
    }
  },

  removeObject: (id) => {
    set((state) => ({
      placedObjects: state.placedObjects.filter((o) => o.id !== id),
    }));
  },

  addToInventory: (item) => {
    set((state) => {
      const existing = state.inventory.find((i) => i.id === item.id);
      if (existing) {
        return {
          inventory: state.inventory.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      }
      return { inventory: [...state.inventory, item] };
    });
  },

  spendCoins: (amount) => {
    const { coins } = get();
    if (coins < amount) return false;
    set({ coins: coins - amount });
    return true;
  },

  earnCoins: (amount) => {
    set((state) => ({ coins: state.coins + amount }));
  },

  equipItem: (id) => {
    set((state) => ({
      inventory: state.inventory.map((i) =>
        i.id === id ? { ...i, equipped: !i.equipped } : { ...i, equipped: false }
      ),
    }));
  },

  startQuest: (questId) => {
    set({
      activeQuest: {
        questId,
        treesPlaced: 0,
        friendsInvited: 0,
        worldNamed: false,
        completed: false,
      },
    });
  },

  updateQuestProgress: (updates) => {
    set((state) => ({
      activeQuest: state.activeQuest
        ? { ...state.activeQuest, ...updates }
        : null,
    }));
  },

  completeQuest: () => {
    set((state) => {
      if (!state.activeQuest || state.activeQuest.completed) return state;

      // Add reward to inventory
      const reward: InventoryItem = {
        id: `reward-moon-bow-${Date.now()}`,
        type: 'badge',
        name: 'Moon Bow',
        emoji: '🎀',
        rarity: 'rare',
        quantity: 1,
      };

      return {
        activeQuest: {
          ...state.activeQuest,
          completed: true,
          completedAt: new Date().toISOString(),
        },
        inventory: [...state.inventory, reward],
        coins: state.coins + 50,
      };
    });
  },

  resetGame: () => {
    set({
      avatarPosition: { x: 2, y: 2 },
      facing: 'down',
      isWalking: false,
      placedObjects: [],
      inventory: DEFAULT_INVENTORY,
      coins: 100,
      activeQuest: {
        questId: 'cloud-garden',
        treesPlaced: 0,
        friendsInvited: 0,
        worldNamed: false,
        completed: false,
      },
    });
  },
}));
