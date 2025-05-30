import {Button} from 'antd';
import {AudioOutlined, AudioMutedOutlined} from '@ant-design/icons';
import {AudioWorkletManager} from "../../helpers/audioWorkletProcessor";
import {Dispatch, SetStateAction, useCallback, useEffect, useState, RefObject} from "react";
import {requests} from "../../axios";
import {WebSocketConnection} from "../../helpers/WebSocketConnection";
import { ServerResponse } from '../../types/requests';
import s from './styles.module.scss';

interface MicrophoneButtonProps {
  onTranscription: (response: ServerResponse) => void;
  setIsSocketActive: (active: boolean) => void;
  language: string;
  prompt: string;
  setLevel: Dispatch<SetStateAction<number>>;
  level: number;
  audioQueue: any;
  wsUrl: string;
  setWsUrl: (url: string) => void;
  wsConnectionRef: RefObject<WebSocketConnection | null>;
  audioManagerRef: RefObject<AudioWorkletManager | null>;
}

export const MicrophoneButton = ({
  onTranscription,
  setIsSocketActive,
  language,
  prompt,
  setLevel,
  audioQueue,
  wsUrl,
  setWsUrl,
  wsConnectionRef,
  audioManagerRef,
}: MicrophoneButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const getFreeMachine = useCallback(async ()=> {
    try {
      const req = await requests.getFreeMachine();
      setLoading(true);
      return `wss://${req.data.dns}:${req.data.port}`;
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          channelCount: 1, // Используем только один канал
          sampleRate: 16000 // Устанавливаем частоту дискретизации
        }
      });

      if (!audioManagerRef.current) {
        audioManagerRef.current = new AudioWorkletManager({
          onAudioData: (base64Data, voicestop) => {
            wsConnectionRef.current?.sendAudioData(
              base64Data, 
              voicestop, 
              audioManagerRef.current?.speechDuration,
              audioManagerRef?.current?.isVoiceActive
            );
          },
          onError: (error) => {
            console.error('Audio processing error:', error);
            setIsRecording(false);
          },
          onLevel: setLevel,
          audioQueue,
        });
      }

      await audioManagerRef.current.initialize(stream);
      await audioManagerRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleClick = async () => {
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
        
        await wsConnectionRef.current.initSocket(url, startRecording, onTranscription);
        setIsSocketActive(true);
      } catch (error) {
        console.error('Failed to start recording:', error);
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

  return (
    <div className={s.container}>
      {/* {`${audioManagerRef?.current?.speechDuration}`} */}
      {/* {audioManagerRef?.current?.isVoiceActive ? <h1>Voice is active</h1> : <h1>Voice is not active</h1>} */}
      <Button
        size='large'
        shape="circle"
        className={isRecording ? s.mic_button_recording : s.mic_button_mute}
        onClick={handleClick}
        type={isRecording ? "primary" : "default"}
        danger={isRecording}
        icon={isRecording ? <AudioOutlined/> : <AudioMutedOutlined/>}
        loading={loading}
      />
    </div>
  )
}