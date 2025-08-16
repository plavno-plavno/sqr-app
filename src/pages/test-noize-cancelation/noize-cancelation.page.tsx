import { AudioWorkletManager } from "@/shared/lib/audio/audio-worklet-processor";
import { MainLayout } from "@/shared/layouts/main-layout";
import { Button } from "@/shared/ui/kit/button";
import { MicrophoneButton } from "@/shared/ui/microphone-button";
import { ThemeProvider } from "@/shared/ui/theme-provider";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";

interface RecordedAudio {
  blob: Blob;
  url: string;
  base64Data: string[];
}

const MicrophoneTestPage = () => {
  const audioManagerRef = useRef<AudioWorkletManager | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<RecordedAudio | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioChunks, setAudioChunks] = useState<string[]>([]);

  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Create WAV file with proper headers
  const createWavBlob = useCallback(
    (audioData: Float32Array, sampleRate: number = 16000) => {
      const length = audioData.length;
      const buffer = new ArrayBuffer(44 + length * 2);
      const view = new DataView(buffer);

      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, "RIFF");
      view.setUint32(4, 36 + length * 2, true);
      writeString(8, "WAVE");
      writeString(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, "data");
      view.setUint32(40, length * 2, true);

      // Convert float32 to int16
      let offset = 44;
      for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        view.setInt16(offset, sample * 0x7fff, true);
        offset += 2;
      }

      return new Blob([buffer], { type: "audio/wav" });
    },
    []
  );

  // Convert base64 audio chunks to WAV blob
  const convertBase64ToBlob = useCallback(
    (base64Chunks: string[]) => {
      // Convert base64 chunks to Float32Array
      const audioData = base64Chunks.map((base64) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return new Float32Array(bytes.buffer);
      });

      // Concatenate all audio data
      const totalLength = audioData.reduce(
        (sum, chunk) => sum + chunk.length,
        0
      );
      const concatenated = new Float32Array(totalLength);

      let offset = 0;
      audioData.forEach((chunk) => {
        concatenated.set(chunk, offset);
        offset += chunk.length;
      });

      return createWavBlob(concatenated, 16000);
    },
    [createWavBlob]
  );

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setIsLoading(true);
      setAudioChunks([]);

      if (!audioManagerRef.current) {
        audioManagerRef.current = new AudioWorkletManager({
          onAudioData: (base64Data: string) => {
            setAudioChunks((prev) => [...prev, base64Data]);
          },
          onError: (error) => {
            console.error("Audio processing error:", error);
            setIsRecording(false);
            setIsLoading(false);
          },
          onLevel: setMicLevel,
          onVoiceEnd: () => {
            console.log("Voice end");
          },
        });
      }

      await audioManagerRef.current.initialize();
      await audioManagerRef.current.start();

      setIsRecording(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsLoading(false);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (audioManagerRef.current) {
      audioManagerRef.current.stop();

      // Convert recorded chunks to blob
      if (audioChunks.length > 0) {
        const blob = convertBase64ToBlob(audioChunks);
        const url = URL.createObjectURL(blob);

        setRecordedAudio({
          blob,
          url,
          base64Data: audioChunks,
        });
      }
    }

    setIsRecording(false);
    setMicLevel(0);
  }, [audioChunks, convertBase64ToBlob]);

  // Handle mic button click
  const handleMicButtonClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Play recorded audio
  const playRecordedAudio = useCallback(() => {
    if (!recordedAudio) return;

    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
      playbackAudioRef.current = null;
    }

    const audio = new Audio(recordedAudio.url);
    playbackAudioRef.current = audio;

    audio.onplay = () => {
      setIsPlaying(true);
    };

    audio.onended = () => {
      setIsPlaying(false);
    };

    audio.onerror = (error) => {
      console.error("Audio playback error:", error);
      setIsPlaying(false);
    };

    audio.oncanplaythrough = () => {
      console.log("Audio can play through");
    };

    audio.play().catch((error) => {
      console.error("Failed to play audio:", error);
      setIsPlaying(false);
    });
  }, [recordedAudio]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
      playbackAudioRef.current.currentTime = 0;
      playbackAudioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Handle playback button click
  const handlePlaybackClick = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playRecordedAudio();
    }
  }, [isPlaying, playRecordedAudio, stopPlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioManagerRef.current) {
        audioManagerRef.current.stop();
      }
      if (playbackAudioRef.current) {
        playbackAudioRef.current.pause();
        playbackAudioRef.current = null;
      }
      if (recordedAudio) {
        URL.revokeObjectURL(recordedAudio.url);
      }
    };
  }, [recordedAudio]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <MainLayout
        language="en"
        prompt="qa"
        isShowSubtitles={false}
        onLanguageChange={() => {}}
        onPromptChange={() => {}}
        onHandleShowSubtitles={() => {}}
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-white">Microphone Test</h1>
            <p className="text-gray-400">
              Test your microphone with recording, playback, and echo
              cancellation
            </p>
          </div>

          {/* Recording Controls */}
          <div className="flex flex-col items-center space-y-6">
            {/* Microphone Level Visualizer */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-2 border-gray-600 flex items-center justify-center relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent rounded-full transition-all duration-100"
                  style={{
                    height: `${Math.min(micLevel * 100, 100)}%`,
                    bottom: 0,
                    top: "auto",
                  }}
                />
                <MicrophoneButton
                  isRecording={isRecording}
                  isLoading={isLoading}
                  handleClick={handleMicButtonClick}
                />
              </div>

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>

            {/* Recording time */}
            {isRecording && (
              <div className="text-white font-mono text-lg">
                {formatTime(recordingTime)}
              </div>
            )}

            {/* Microphone level indicator */}
            <div className="text-gray-400 text-sm">
              Mic Level: {Math.round(micLevel * 100)}%
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={handlePlaybackClick}
              disabled={!recordedAudio}
              className="flex items-center space-x-2"
              variant={isPlaying ? "destructive" : "default"}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4" />
                  <span>Stop Playback</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Play Recording</span>
                </>
              )}
            </Button>

            {!recordedAudio && (
              <p className="text-gray-500 text-sm">
                No recording available. Record something first.
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="max-w-md text-center space-y-2 text-sm text-gray-400">
            <p>
              <strong>How to test echo cancellation:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-left">
              <li>Record your voice with echo cancellation enabled</li>
              <li>Play the recording through your speakers</li>
              <li>Hold the microphone near the speakers</li>
              <li>The system should filter out the speaker audio</li>
            </ol>
          </div>
        </div>
      </MainLayout>
    </ThemeProvider>
  );
};

export const Component = MicrophoneTestPage;
