import {
  AudioQueueManager,
  AudioWorkletManager,
} from "@/features/_audio_demo_old";
import { WebSocketConnection } from "@/features/_websocket_demo_old";
import { requests } from "@/shared/api";
import { MainLayout } from "@/shared/layouts/main-layout";
import { testAudio } from "@/shared/mock/internal";
import { defaultLanguage } from "@/shared/mock/languages";
import { defaultPrompt } from "@/shared/mock/prompt";
import type {
  AudioSegmentResponse,
  ServerResponse,
} from "@/shared/model/websocket";
import { AudioVisualizerPlayer } from "@/shared/ui/audio-visualizer-player";
import { Button } from "@/shared/ui/kit/button";
import { MicrophoneButton } from "@/shared/ui/microphone-button";
import { ThemeProvider } from "@/shared/ui/theme-provider";
import { useCallback, useEffect, useRef, useState } from "react";

const DemoPage = () => {
  const audioQueueRef = useRef<AudioQueueManager | null>(null);
  const wsConnectionRef = useRef<WebSocketConnection | null>(null);
  const audioManagerRef = useRef<AudioWorkletManager | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [audioText, setAudioText] = useState<string>("");
  const [language, setLanguage] = useState<string>(defaultLanguage || "en");
  const [prompt, setPrompt] = useState<string>(defaultPrompt || "qa");
  const [isSocketActive, setIsSocketActive] = useState(false);
  const [startPlayRandom, setStartPlayRandom] = useState(false);
  const [isShowSubtitles, setIsShowSubtitles] = useState(false);
  const [level, setLevel] = useState(0);
  const [wsUrl, setWsUrl] = useState<string>("");

  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const getFreeMachine = useCallback(async () => {
    try {
      const req = await requests.getFreeMachine()
      setLoading(true);
      return `wss://${req.data.dns}:${req.data.port}`;
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startRecording = async () => {
    console.log(isSocketActive);
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
          onLevel: setLevel,
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

  const handleMicButtonClick = async () => {
    if (isRecording) {
      audioManagerRef.current?.stop();
      wsConnectionRef.current?.stopStreaming();
      setIsRecording(false);
      setIsSocketActive(false);
    } else {
      try {
        let url = wsUrl;
        if (!url) {
          const newUrl = await getFreeMachine();
          if (!newUrl) return;
          url = newUrl;
          setWsUrl(newUrl);
        }

        if (!wsConnectionRef.current) {
          wsConnectionRef.current = new WebSocketConnection(language, prompt);
        }

        await wsConnectionRef.current.initSocket(
          url,
          startRecording,
          handleTranscription
        );
        setIsSocketActive(true);
      } catch (error) {
        console.error("Failed to start recording:", error);
        setIsSocketActive(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      audioManagerRef.current?.stop();
      wsConnectionRef.current?.closeConnection();
      setIsSocketActive(false);
    };
  }, [setIsSocketActive]);

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    if (wsUrl) {
      if (wsConnectionRef.current) {
        wsConnectionRef.current.stopStreaming();
      }
      wsConnectionRef.current = new WebSocketConnection(newLanguage, prompt);
      await wsConnectionRef.current.initSocket(
        wsUrl,
        () => {},
        handleTranscription
      );
    }
  };

  const handleTranscription = (response: ServerResponse) => {
    if ("segments" in response) {
      if (
        typeof response.segments === "object" &&
        !Array.isArray(response.segments)
      ) {
        if ("audio" in response.segments) {
          // Обработка аудио ответа
          const audioResponse = response as AudioSegmentResponse;
          if (!audioQueueRef.current) {
            audioQueueRef.current = new AudioQueueManager(setCurrentLevel);
          }
          audioQueueRef.current.addToQueue(audioResponse.segments.audio);
        }
        if ("text" in response.segments) {
          // Обработка текстового ответа
          setAudioText(response.segments["text"] || "");
        }
      }
    }
  };

  const onHandleShowSubtitles = () => {
    setIsShowSubtitles((prev) => !prev);
  };

  useEffect(() => {
    if (startPlayRandom) {
      const interval = setInterval(() => {
        if (!audioQueueRef.current) {
          audioQueueRef.current = new AudioQueueManager(setCurrentLevel);
        }
        audioQueueRef?.current?.addToQueue(testAudio);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startPlayRandom]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <MainLayout
        language={language}
        prompt={prompt}
        onLanguageChange={handleLanguageChange}
        onPromptChange={setPrompt}
        isShowSubtitles={isShowSubtitles}
        onHandleShowSubtitles={onHandleShowSubtitles}
      >
        <div className="w-full h-full flex flex-col [&>div]:text-white">
          <div className="h-full flex-1 flex justify-center items-center">
            <div className="w-[95%]">
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <AudioVisualizerPlayer
                  level={currentLevel}
                  width={500}
                  height={500}
                  micLevel={level}
                >
                  <MicrophoneButton
                    isRecording={isRecording}
                    isLoading={loading}
                    handleClick={handleMicButtonClick}
                  />
                </AudioVisualizerPlayer>
                {isShowSubtitles && (
                  <p className="block text-white text-center text-lg">
                    {audioText || ""}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div>
            {/*<AudioVisualizer level={level} />*/}
            <Button
              className="opacity-0"
              size="sm"
              onClick={() => setStartPlayRandom((prev) => !prev)}
            />
          </div>
        </div>
      </MainLayout>
    </ThemeProvider>
  );
};

export const Component = DemoPage;
