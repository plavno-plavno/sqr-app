import { AudioWorkletManager } from "@/shared/lib/audio/audio-worklet-processor";
import type { WebSocketConnection } from "@/shared/lib/websocket/websocket-connection";
import { useCallback } from "react";
import { useAudioStore } from "./audio-store";
import { useWebSocketStore } from "./websocket-store";

interface UseAudioProps {
  onVoiceLevel?: (level: number) => void;
}

export const useAudio = (config?: UseAudioProps) => {
  const { onVoiceLevel } = config || {};

  const connection = useWebSocketStore.use.connection();

  const isRecording = useAudioStore.use.isRecording();
  const audioManager = useAudioStore.use.audioManager();
  const audioError = useAudioStore.use.audioError();
  const mediaStream = useAudioStore.use.mediaStream();

  const setAudioManager = useAudioStore.use.setAudioManager();
  const setIsRecording = useAudioStore.use.setIsRecording();
  const setAudioError = useAudioStore.use.setAudioError();
  const setMediaStream = useAudioStore.use.setMediaStream();
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

  const onVoiceEnd = useCallback(() => {
    console.log("VOICE END");
  }, []);

  const startRecording = useCallback(async () => {
    try {
      if (!connection) throw new Error("Socket is not connected");
      if (!connection.isSocketOpen()) return;
      if (isRecording) return;

      let newAudioManager;

      if (!audioManager) {
        newAudioManager = new AudioWorkletManager({
          onAudioData,
          onError,
          onVoiceLevel,
          onVoiceEnd,
          onStopAudioQueue: () => {
            useAudioStore.getState().audioQueue?.stop();
          },
        });
        setAudioManager(newAudioManager);

        await newAudioManager.initialize();
        await newAudioManager.start();

        // Set mediaStream from the new audio manager
        const stream = newAudioManager.getMediaStream();
        setMediaStream(stream);

        // Link AudioWorkletManager with AudioQueueManager for microphone sensitivity control
        const audioQueue = useAudioStore.getState().audioQueue;
        if (audioQueue) {
          audioQueue.setAudioWorkletManager(newAudioManager);
        }
      } else {
        await audioManager.start();

        // Update mediaStream if it changed
        const stream = audioManager.getMediaStream();
        setMediaStream(stream);
      }

      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      onError(error as Error);
    }
  }, [
    connection,
    isRecording,
    audioManager,
    setIsRecording,
    setMediaStream,
    onAudioData,
    onError,
    onVoiceLevel,
    onVoiceEnd,
    setAudioManager,
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
    mediaStream,
    setAudioError,
    startRecording,
    stopRecording,
    toggleMute,
  };
};
