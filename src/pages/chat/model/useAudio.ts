import { AudioQueueManager, AudioWorkletManager } from "@/features/audio";
import type { WebSocketConnection } from "@/features/websocket";
import { useRef, useState } from "react";

export const useAudio = (
  wsConnectionRef: React.RefObject<WebSocketConnection | null>,
  audioQueueRef: React.RefObject<AudioQueueManager | null>,
  onMicLevelChange?: (level: number) => void
) => {
  const audioManagerRef = useRef<AudioWorkletManager | null>(null);

  const [isRecording, setIsRecording] = useState(false);

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
          onAudioData: (base64Data, voicestop) => {
            wsConnectionRef.current?.sendAudioData(base64Data, voicestop);
          },
          onError: (error) => {
            console.error("Audio processing error:", error);
            setIsRecording(false);
          },
          onLevel: onMicLevelChange,
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
    startRecording,
    stopRecording,
  };
};
