import { useState, useRef, useEffect } from "react";
import { Button, Typography } from "antd";
import s from "./styles.module.scss";
import { AudioQueueManager, AudioWorkletManager } from "@/features/audio";
import { defaultPrompt } from "@/shared/config/prompt";
import { WebSocketConnection } from "@/features/websocket";
import { defaultLanguage } from "@/shared/config/languages";
import { AudioResponse } from "@/shared/models/requests";
import { ServerResponse } from "@/shared/models/requests";
import { MainLayout } from "@/shared/layouts/main-layout";
import { testAudio } from "@/shared/config/internal";
import { MicrophoneButton } from "@/shared/ui/microphone-button";
import { AudioVisualizerPlayer } from "@/shared/ui/audio-visualizer-player";

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
  const [level, setLevel] = useState(0);
  const [wsUrl, setWsUrl] = useState<string>("");

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
          const audioResponse = response as AudioResponse;
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
    <MainLayout
      language={language}
      prompt={prompt}
      onLanguageChange={handleLanguageChange}
      onPromptChange={setPrompt}
    >
      <div className={s.App}>
        <div className={s.App_Answer}>
          <div className={s.App_Answer_Wrapper}>
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
                  onTranscription={handleTranscription}
                  setIsSocketActive={setIsSocketActive}
                  language={language}
                  prompt={prompt}
                  setLevel={setLevel}
                  level={level}
                  audioQueue={audioQueueRef}
                  wsUrl={wsUrl}
                  setWsUrl={setWsUrl}
                  wsConnectionRef={wsConnectionRef}
                  audioManagerRef={audioManagerRef}
                />
              </AudioVisualizerPlayer>
              <Typography.Text className={s.App_Answer_Wrapper_Text}>
                {audioText || ""}
              </Typography.Text>
            </div>
          </div>
        </div>
        <div>
          {/*<AudioVisualizer level={level} />*/}
          <Button
            size={"small"}
            onClick={() => setStartPlayRandom((prev) => !prev)}
          />
          {startPlayRandom.toString()}
        </div>
      </div>
    </MainLayout>
  );
};

export const Component = DemoPage;
