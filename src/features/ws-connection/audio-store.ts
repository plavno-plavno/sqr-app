import type { AudioQueueManager } from "@/shared/lib/audio/audio-queue-manager";
import type { AudioWorkletManager } from "@/shared/lib/audio/audio-worklet-processor";
import { createSelectors } from "@/shared/lib/js/zustand";
import { create } from "zustand";

interface State {
  audioManager: AudioWorkletManager | null;
  audioQueue: AudioQueueManager | null;

  isRecording: boolean;
  audioError: string | null;
}

interface Actions {
  setAudioManager: (audioManager: AudioWorkletManager | null) => void;
  setAudioQueue: (audioQueue: AudioQueueManager | null) => void;
  setIsRecording: (isRecording: boolean) => void;
  setAudioError: (audioError: string | null) => void;
  clearAudio: () => void;
}

type Store = State & Actions;

const useAudioStoreBase = create<Store>()((set) => ({
  audioManager: null,
  audioQueue: null,
  isRecording: false,
  audioError: null,

  setIsRecording: (isRecording) => set({ isRecording }),
  setAudioError: (audioError) => set({ audioError }),
  setAudioManager: (audioManager) => set({ audioManager }),
  setAudioQueue: (audioQueue) => set({ audioQueue }),
  clearAudio: () =>
    set({
      audioManager: null,
      isRecording: false,
      audioError: null,
    }),
}));

export const useAudioStore = createSelectors(useAudioStoreBase);
