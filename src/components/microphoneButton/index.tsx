import {Button} from 'antd';
import {AudioOutlined, AudioMutedOutlined} from '@ant-design/icons';
import {AudioWorkletManager} from "../../helpers/audioWorkletProcessor";
import {useCallback, useEffect, useRef, useState} from "react";
import {requests} from "../../axios";
import {WebSocketConnection} from "../../helpers/WebSocketConnection";
import { ServerResponse } from '../../types/requests';
import AudioVisualizer from './AudioVisualizer';
import s from './styles.module.scss';

interface MicrophoneButtonProps {
  onTranscription: (response: ServerResponse) => void;
  setIsSocketActive: (active: boolean) => void;
  language: string;
  prompt: string;
}

export const MicrophoneButton = ({ 
  onTranscription, 
  setIsSocketActive,
  language,
  prompt 
}: MicrophoneButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const [loading, setLoading] = useState(false);
  const audioManagerRef = useRef<AudioWorkletManager | null>(null);
  const wsConnectionRef = useRef<WebSocketConnection | null>(null);

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
          noiseSuppression: false,
          echoCancellation: false
        }
      });

      if (!audioManagerRef.current) {
        audioManagerRef.current = new AudioWorkletManager({
          onAudioData: (base64Data) => {
            wsConnectionRef.current?.sendAudioData(base64Data);
          },
          onError: (error) => {
            console.error('Audio processing error:', error);
            setIsRecording(false);
          },
          onLevel: setLevel,
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
        const wsUrl = await getFreeMachine();
        if (!wsUrl) return;

        if (!wsConnectionRef.current) {
          wsConnectionRef.current = new WebSocketConnection(language, prompt);
        }
        
        await wsConnectionRef.current.initSocket(wsUrl, startRecording, onTranscription);
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
      {isRecording && <AudioVisualizer level={level} />}
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