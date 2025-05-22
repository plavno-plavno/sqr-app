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
}

export const MicrophoneButton = ({ onTranscription }: MicrophoneButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [, setAudioStream] = useState<MediaStream | null>(null);
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
      setAudioStream(stream);

      if (!audioManagerRef.current) {
        audioManagerRef.current = new AudioWorkletManager({
          onAudioData: (base64Data) => {
            wsConnectionRef.current?.sendAudioData(base64Data);
          },
          onError: (error) => {
            console.error('Audio processing error:', error);
            setIsRecording(false);
            setAudioStream(null);
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
      setAudioStream(null);
      setIsRecording(false);
    } else {
      try {
        const wsUrl = await getFreeMachine();
        if (!wsUrl) return;

        if (!wsConnectionRef.current) {
          wsConnectionRef.current = new WebSocketConnection();
        }
        
        await wsConnectionRef.current.initSocket(wsUrl, startRecording, onTranscription);
      } catch (error) {
        console.error('Failed to start recording:', error);
      }
    }
  };

  useEffect(() => {
    return () => {
      audioManagerRef.current?.stop();
      wsConnectionRef.current?.closeConnection();
      setAudioStream(null);
    };
  }, []);

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