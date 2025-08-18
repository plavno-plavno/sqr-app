import { createSelectors } from "@/shared/lib/js/zustand";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface State {
  isAudioEnabled: boolean;
}

interface Actions {
  setAudioEnabled: (enabled: boolean) => void;
  toggleAudio: () => void;
}

type Store = State & Actions;

const useSettingsStoreBase = create<Store>()(
  persist(
    immer((set) => ({
      isAudioEnabled: true,

      setAudioEnabled: (enabled: boolean) =>
        set((state) => {
          state.isAudioEnabled = enabled;
        }),

      toggleAudio: () =>
        set((state) => {
          state.isAudioEnabled = !state.isAudioEnabled;
        }),
    })),
    {
      name: "settings-store",
    }
  )
);

export const useSettingsStore = createSelectors(useSettingsStoreBase);