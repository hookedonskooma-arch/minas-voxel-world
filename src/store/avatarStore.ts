import { create } from 'zustand';
import { AvatarAppearance, DEFAULT_AVATAR } from '@/types/avatar';

interface AvatarState {
  name: string;
  appearance: AvatarAppearance;
  selectedCategory: string;
  setName: (name: string) => void;
  setAppearance: (appearance: AvatarAppearance) => void;
  updatePart: (part: string, value: unknown) => void;
  setSelectedCategory: (category: string) => void;
  resetToDefault: () => void;
}

export const useAvatarStore = create<AvatarState>((set) => ({
  name: 'Mina',
  appearance: DEFAULT_AVATAR,
  selectedCategory: 'body',
  setName: (name) => set({ name }),
  setAppearance: (appearance) => set({ appearance }),
  updatePart: (part, value) =>
    set((state) => ({
      appearance: {
        ...state.appearance,
        [part]: value,
      },
    })),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  resetToDefault: () => set({ appearance: DEFAULT_AVATAR, name: 'Mina' }),
}));
