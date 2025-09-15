import { createSelectors } from "@/shared/lib/js/zustand";
import { PromptType, VocalizerType } from "@/shared/model/websocket";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface State {
  isAudioEnabled: boolean;
  vocalizerType: VocalizerType;
  promptType: PromptType;
  sameOutputTreshhold: number;
  intentDetection: boolean;
}

interface Actions {
  setAudioEnabled: (enabled: boolean) => void;
  toggleAudio: () => void;
  setVocalizerType: (type: VocalizerType) => void;
  setPromptType: (type: PromptType) => void;
  setSameOutputTreshhold: (treshhold: number) => void;
  setIntentDetection: (enabled: boolean) => void;
  toggleIntentDetection: () => void;
}

type Store = State & Actions;

const useSettingsStoreBase = create<Store>()(
  persist(
    immer((set) => ({
      isAudioEnabled: true,
      vocalizerType: VocalizerType.ELEVENLABS,
      promptType: PromptType.LOGISTICS,
      sameOutputTreshhold: 2,
      intentDetection: false,

      setAudioEnabled: (enabled: boolean) =>
        set((state) => {
          state.isAudioEnabled = enabled;
        }),

      toggleAudio: () =>
        set((state) => {
          state.isAudioEnabled = !state.isAudioEnabled;
        }),

      setVocalizerType: (type: VocalizerType) =>
        set((state) => {
          state.vocalizerType = type;
        }),

      setPromptType: (type: PromptType) =>
        set((state) => {
          state.promptType = type;
        }),

      setSameOutputTreshhold: (treshhold: number) =>
        set((state) => {
          state.sameOutputTreshhold = treshhold;
        }),

      setIntentDetection: (enabled: boolean) =>
        set((state) => {
          state.intentDetection = enabled;
        }),

      toggleIntentDetection: () =>
        set((state) => {
          state.intentDetection = !state.intentDetection;
        }),
    })),
    {
      name: "settings-store",
    }
  )
);

export const useSettingsStore = createSelectors(useSettingsStoreBase);
