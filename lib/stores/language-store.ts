import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@/types';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',

      setLanguage: (language: Language) => {
        set({ language });
      },

      toggleLanguage: () => {
        const newLanguage = get().language === 'en' ? 'es' : 'en';
        set({ language: newLanguage });
      },
    }),
    {
      name: 'ueta-language-storage',
    }
  )
);
