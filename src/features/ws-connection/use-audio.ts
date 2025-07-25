import type { WebSocketConnection } from "@/shared/lib/websocket/websocket-connection";
import { useAudioStore } from "./audio-store";
import { useWebSocketStore } from "./websocket-store";
import { AudioWorkletManager } from "@/shared/lib/audio/audio-worklet-processor";
import { useCallback } from "react";

interface UseAudioProps {
  onMicLevelChange?: (level: number) => void;
}

export const useAudio = (config?: UseAudioProps) => {
  const { onMicLevelChange } = config || {};

  const connection = useWebSocketStore.use.connection();

  const isRecording = useAudioStore.use.isRecording();
  const audioManager = useAudioStore.use.audioManager();
  const audioError = useAudioStore.use.audioError();

  const setAudioManager = useAudioStore.use.setAudioManager();
  const setIsRecording = useAudioStore.use.setIsRecording();
  const setAudioError = useAudioStore.use.setAudioError();
  const clearAudio = useAudioStore.use.clearAudio();

  const onError = useCallback(
    (error: Error) => {
      setIsRecording(false);
      setAudioError(error.message);
    },
    [setIsRecording, setAudioError]
  );

  const send = useCallback(
    (command: (connection: WebSocketConnection) => void) => {
      try {
        if (!connection) throw new Error("Socket is not connected");
        command(connection);
      } catch (error) {
        onError(error as Error);
      }
    },
    [connection, onError]
  );

  const onAudioData = useCallback(
    (base64Data: string, voicestop: boolean) => {
      send((connection) => connection.sendAudioData(base64Data, voicestop));
    },
    [send]
  );

  const onVoiceEnd = useCallback(
    (isActive: boolean) => {
      if (isActive) return;
      send((connection) => connection.sendVoiceEndCommand());
    },
    [send]
  );

  const startRecording = useCallback(async () => {
    try {
      if (!connection) throw new Error("Socket is not connected");
      if (isRecording) return;

      let newAudioManager;

      if (!audioManager) {
        newAudioManager = new AudioWorkletManager({
          onAudioData: onAudioData,
          onError: onError,
          onLevel: onMicLevelChange,
          onVoiceActivity: onVoiceEnd,
          onStopAudioQueue: () => {
            useAudioStore.getState().audioQueue?.stop();
          },
        });
        setAudioManager(newAudioManager);

        await newAudioManager.initialize();
        await newAudioManager.start();
      } else {
        await audioManager.start();
      }

      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      onError(error as Error);
    }
  }, [
    connection,
    audioManager,
    isRecording,
    setAudioManager,
    onAudioData,
    onError,
    onMicLevelChange,
    onVoiceEnd,
    setIsRecording,
  ]);

  const stopRecording = useCallback(async () => {
    await audioManager?.stop();
    clearAudio();
  }, [audioManager, clearAudio]);

  const toggleMute = useCallback(
    (mute: boolean) => {
      audioManager?.toggleMute(mute);
    },
    [audioManager]
  );

  return {
    isRecording,
    audioError,
    setAudioError,
    startRecording,
    stopRecording,
    toggleMute,
  };
};
