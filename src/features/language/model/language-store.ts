import { createSelectors } from "@/shared/lib/js/zustand";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { availableLanguages, type LanguageOption } from "./language";

interface State {
  language: LanguageOption;
  allLanguages: LanguageOption[];
}

interface Actions {
  setLanguage: (language: LanguageOption) => void;
}

type Store = State & Actions;

const useLanguageStoreBase = create<Store>()(
  persist(
    immer((set) => ({
      language: availableLanguages[0],
      allLanguages: availableLanguages,

      setLanguage: (language: LanguageOption) =>
        set((state) => {
          state.language = language;
        }),
    })),
    {
      name: "language-store",
    }
  )
);

export const useLanguageStore = createSelectors(useLanguageStoreBase);
