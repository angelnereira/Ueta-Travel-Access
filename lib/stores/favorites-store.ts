import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

interface FavoritesState {
  favorites: Product[];
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (product: Product) => {
        set((state) => {
          const exists = state.favorites.some((fav) => fav.id === product.id);
          if (exists) return state;

          return {
            favorites: [...state.favorites, product],
          };
        });
      },

      removeFavorite: (productId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.id !== productId),
        }));
      },

      isFavorite: (productId: string) => {
        return get().favorites.some((fav) => fav.id === productId);
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'ueta-favorites-storage',
    }
  )
);
