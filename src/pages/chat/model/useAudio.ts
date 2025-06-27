import { AudioQueueManager, AudioWorkletManager } from "@/features/audio";
import type { WebSocketConnection } from "@/features/websocket";
import { useState } from "react";

interface UseAudioProps {
  audioManagerRef: React.RefObject<AudioWorkletManager | null>;
  wsConnectionRef: React.RefObject<WebSocketConnection | null>;
  audioQueueRef: React.RefObject<AudioQueueManager | null>;
  onMicLevelChange?: (level: number) => void;
}

export const useAudio = (config: UseAudioProps) => {
  const { audioManagerRef, wsConnectionRef, audioQueueRef, onMicLevelChange } =
    config;

  const [isRecording, setIsRecording] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioVoiceError, setAudioVoiceError] = useState<string | null>(null);

  const onAudioData = (base64Data: string, voicestop: boolean) => {
    try {
      wsConnectionRef.current?.sendAudioData(base64Data, voicestop);
    } catch (error) {
      setAudioVoiceError((error as Error)?.message);
    }
  };

  const onVoiceEnd = (isActive: boolean) => {
    if (isActive) return;

    try {
      wsConnectionRef.current?.sendVoiceEndCommand();
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

      if (!audioManagerRef.current) {
        audioManagerRef.current = new AudioWorkletManager({
          onAudioData: onAudioData,
          onError: onError,
          onLevel: onMicLevelChange,
          onVoiceActivity: onVoiceEnd,
          audioQueue: audioQueueRef,
        });
      }

      await audioManagerRef.current.initialize(stream);
      await audioManagerRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = () => {
    audioManagerRef.current?.stop();
    setIsRecording(false);
  };

  return {
    isRecording,
    audioError,
    audioVoiceError,
    cleanAudioErrors,
    startRecording,
    stopRecording,
  };
};
