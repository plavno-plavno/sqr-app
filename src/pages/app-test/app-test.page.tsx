import { useState, useEffect, useRef } from "react";
import { AudioWorkletManager } from "@/shared/lib/audio/audio-worklet-processor";
import { AudioQueueManager } from "@/shared/lib/audio/audio-queue-manager";
import type { AudioResponse } from "@/shared/model/websocket";
import voice from "@/shared/assets/animations/voice.json";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

const AppTestPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<string>(
    "Click Start to initialize audio"
  );
  const [playbackLevel, setPlaybackLevel] = useState(0);

  const audioWorkletRef = useRef<AudioWorkletManager | null>(null);
  const audioQueueRef = useRef<AudioQueueManager | null>(null);
  const mockAudioDataRef = useRef<string | null>(null);
  const streamIdRef = useRef<number>(0);
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  useEffect(() => {
    const generateMockAudioData = () => {
      // Generate 6 seconds of 22050Hz sine wave at 440Hz (A note)
      const sampleRate = 22050;
      const duration = 6; // seconds
      const frequency = 440; // Hz
      const samples = sampleRate * duration;

      const audioBuffer = new Int16Array(samples);

      for (let i = 0; i < samples; i++) {
        const value = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
        audioBuffer[i] = Math.floor(value * 32767 * 0.3); // 30% volume
      }

      // Convert to base64
      const uint8Array = new Uint8Array(audioBuffer.buffer);
      let binaryString = "";
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      mockAudioDataRef.current = btoa(binaryString);
    };

    const cleanup = async () => {
      if (audioWorkletRef.current) {
        await audioWorkletRef.current.stop();
      }
      if (audioQueueRef.current) {
        await audioQueueRef.current.destroy();
      }
    };

    generateMockAudioData();

    return () => {
      cleanup();
    };
  }, []);

  const handleVoiceEnd = async () => {
    setStatus("Voice ended - playing mock response");

    // Play mock audio response
    if (mockAudioDataRef.current && audioQueueRef.current) {
      const currentStreamId = streamIdRef.current++;

      // Split mock audio into chunks (simulate server chunking)
      const chunkSize = 64 * 1024; // 64KB chunks as per protocol
      const audioData = mockAudioDataRef.current;

      if (audioData.length <= chunkSize) {
        // Single chunk
        const audioResponse: AudioResponse = {
          audio: audioData,
          chunk_id: 0,
          stream_id: currentStreamId,
        };
        await audioQueueRef.current.addToQueue(audioResponse);

        // Send termination chunk
        const terminationChunk: AudioResponse = {
          audio: null,
          chunk_id: -1,
          stream_id: currentStreamId,
        };
        await audioQueueRef.current.addToQueue(terminationChunk);
      } else {
        // Multiple chunks
        let chunkId = 0;
        for (let i = 0; i < audioData.length; i += chunkSize) {
          const chunk = audioData.slice(i, i + chunkSize);
          const audioResponse: AudioResponse = {
            audio: chunk,
            chunk_id: chunkId++,
            stream_id: currentStreamId,
          };
          await audioQueueRef.current.addToQueue(audioResponse);
        }

        // Send termination chunk
        const terminationChunk: AudioResponse = {
          audio: null,
          chunk_id: -1,
          stream_id: currentStreamId,
        };
        await audioQueueRef.current.addToQueue(terminationChunk);
      }
    }

    setTimeout(() => setStatus("Ready to test"), 2000);
  };

  const initializeAudio = async () => {
    try {
      setStatus("Initializing audio...");

      // Initialize AudioQueueManager for playback
      audioQueueRef.current = new AudioQueueManager({
        onAudioLevel: (level) => setPlaybackLevel(level),
      });
      await audioQueueRef.current.initializeAudioContext();

      // Initialize AudioWorkletManager for recording
      audioWorkletRef.current = new AudioWorkletManager({
        onAudioData: () => {
          // In a real app, this would send data to WebSocket server
        },
        onVoiceEnd: handleVoiceEnd,
        onVoiceLevel: (level) => {
          // Update Lottie animation based on audio level
          if (lottieRef.current) {
            const totalFrames = lottieRef.current.getDuration(true);
            if (totalFrames) {
              const frame = Math.floor(level * 2 * totalFrames);
              lottieRef.current.goToAndStop(frame, true);
            }
          }
        },
        onError: (error) => setStatus(`Error: ${error.message}`),
        onStopAudioQueue: () => {
          // Stop audio playback when user starts speaking
          if (audioQueueRef.current) {
            audioQueueRef.current.stop();
            setStatus("Audio stopped - user speaking");
          }
        },
      });

      await audioWorkletRef.current.initialize();
      setStatus("Audio initialized successfully");
      return true;
    } catch (error) {
      setStatus(
        `Initialization error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return false;
    }
  };

  const toggleRecording = async () => {
    try {
      // Initialize audio on first interaction if not already done
      if (!audioWorkletRef.current || !audioQueueRef.current) {
        const success = await initializeAudio();
        if (!success) return;
      }

      if (isRecording) {
        await audioWorkletRef.current!.stop();
        setStatus("Recording stopped");
      } else {
        await audioWorkletRef.current!.start();
        setStatus("Recording started - speak now");
      }
      setIsRecording(!isRecording);
    } catch (error) {
      setStatus(
        `Toggle error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const getVolumeBar = (level: number) => {
    const bars = 20;
    const filledBars = Math.floor(level * bars * 100);
    return (
      "█".repeat(Math.min(filledBars, bars)) +
      "░".repeat(Math.max(0, bars - filledBars))
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 font-mono">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-8">App Test</h1>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Status</p>
            <p className="text-lg font-semibold">{status}</p>
          </div>

          {isRecording ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-64 h-64">
                  <Lottie
                    animationData={voice}
                    lottieRef={lottieRef}
                    autoplay={false}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              </div>
              <button
                onClick={toggleRecording}
                className="w-full py-4 px-6 rounded-lg font-semibold transition-colors bg-red-500 hover:bg-red-600 text-white"
              >
                Stop Recording
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={toggleRecording}
                className="w-full py-4 px-6 rounded-lg font-semibold transition-colors bg-green-500 hover:bg-green-600 text-white"
              >
                Start Recording
              </button>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600 mb-1">Playback Level</p>
            <div className="bg-gray-200 h-6 rounded flex items-center px-2 text-xs">
              {getVolumeBar(playbackLevel)}
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Speak into microphone</p>
            <p>• Voice Activity Detection will trigger</p>
            <p>• After silence, mock audio will play</p>
            <p>• Uses existing VAD and AudioQueue systems</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Component = AppTestPage;
