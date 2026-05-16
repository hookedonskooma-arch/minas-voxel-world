import { create } from 'zustand';
import { AvatarAppearance, DEFAULT_AVATAR } from '@/types/avatar';

interface AvatarState {
  appearance: AvatarAppearance;
  selectedCategory: string;
  setAppearance: (appearance: AvatarAppearance) => void;
  updatePart: (part: string, value: unknown) => void;
  setSelectedCategory: (category: string) => void;
  resetToDefault: () => void;
}

export const useAvatarStore = create<AvatarState>((set) => ({
  appearance: DEFAULT_AVATAR,
  selectedCategory: 'body',
  setAppearance: (appearance) => set({ appearance }),
  updatePart: (part, value) =>
    set((state) => ({
      appearance: {
        ...state.appearance,
        [part]: value,
      },
    })),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  resetToDefault: () => set({ appearance: DEFAULT_AVATAR }),
}));
