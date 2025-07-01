import { useAudioStore } from "./audio-store";
import { useWebSocketStore } from "./websocket-store";
import { AudioWorkletManager } from "@/shared/lib/audio/audio-worklet-processor";

interface UseAudioProps {
  onMicLevelChange?: (level: number) => void;
}

export const useAudio = (config: UseAudioProps) => {
  const { onMicLevelChange } = config;

  const connection = useWebSocketStore.use.connection();

  const isRecording = useAudioStore.use.isRecording();
  const audioQueue = useAudioStore.use.audioQueue();
  const audioManager = useAudioStore.use.audioManager();
  const audioError = useAudioStore.use.audioError();
  const audioVoiceError = useAudioStore.use.audioVoiceError();

  const setAudioManager = useAudioStore.use.setAudioManager();
  const setIsRecording = useAudioStore.use.setIsRecording();
  const setAudioError = useAudioStore.use.setAudioError();
  const setAudioVoiceError = useAudioStore.use.setAudioVoiceError();
  const clearAudio = useAudioStore.use.clearAudio();

  const onAudioData = (base64Data: string, voicestop: boolean) => {
    try {
      connection?.sendAudioData(base64Data, voicestop);
    } catch (error) {
      setAudioVoiceError((error as Error)?.message);
    }
  };

  const onVoiceEnd = (isActive: boolean) => {
    if (isActive) return;

    try {
      connection?.sendVoiceEndCommand();
    } catch (error) {
      setAudioVoiceError((error as Error)?.message);
    }
  };

  const onError = (error: Error) => {
    setIsRecording(false);
    setAudioError(error.message);
  };

  const cleanAudioErrors = () => {
    setAudioError(null);
    setAudioVoiceError(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          channelCount: 1, // Используем только один канал
          sampleRate: 16000, // Устанавливаем частоту дискретизации
        },
      });

      let newAudioManager;

      if (!audioManager) {
        newAudioManager = new AudioWorkletManager({
          onAudioData: onAudioData,
          onError: onError,
          onLevel: onMicLevelChange,
          onVoiceActivity: onVoiceEnd,
          audioQueue: audioQueue,
        });
        setAudioManager(newAudioManager);
      } else {
        newAudioManager = audioManager;
      }

      await newAudioManager?.initialize(stream);
      await newAudioManager?.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = () => {
    audioManager?.stop();
    clearAudio();
  };

  return {
    isRecording,
    audioQueue,
    audioManager,
    audioError,
    audioVoiceError,
    cleanAudioErrors,
    startRecording,
    stopRecording,
  };
};
