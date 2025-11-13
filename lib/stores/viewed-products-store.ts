import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

interface ViewedProductsState {
  viewedProducts: Product[];
  addViewedProduct: (product: Product) => void;
  clearViewed: () => void;
}

const MAX_VIEWED_PRODUCTS = 20;

export const useViewedProductsStore = create<ViewedProductsState>()(
  persist(
    (set, get) => ({
      viewedProducts: [],

      addViewedProduct: (product: Product) => {
        set((state) => {
          // Remove if already exists
          const filtered = state.viewedProducts.filter((p) => p.id !== product.id);

          // Add to beginning
          const updated = [product, ...filtered];

          // Keep only last MAX_VIEWED_PRODUCTS
          return {
            viewedProducts: updated.slice(0, MAX_VIEWED_PRODUCTS),
          };
        });
      },

      clearViewed: () => {
        set({ viewedProducts: [] });
      },
    }),
    {
      name: 'ueta-viewed-products-storage',
    }
  )
);
