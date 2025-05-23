import { useState, useRef, useEffect } from 'react';
import { MicrophoneButton } from '../components';
import { ServerResponse, Segment, AudioResponse } from '../types/requests';
import { MainLayout } from '../layouts';  
import { Typography, Space } from 'antd';
import s from './styles.module.scss';
import { AudioQueueManager } from '../helpers/AudioQueueManager';
import AudioVisualizerPlayer from '../components/AudioVisualizerPlayer';

const MAX_WORDS = 25;

export const App = () => {
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [, setSegments] = useState<Segment[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const audioQueueRef = useRef<AudioQueueManager | null>(null);
  const [lastAudio, setLastAudio] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);

  const handleTranscription = (response: ServerResponse) => {
    if ('segments' in response) {
      if (Array.isArray(response.segments)) {
        // Обработка сегментов с текстом
        setSegments(response.segments);
        
        const wordsWithTimestamps = response.segments.flatMap(segment => {
          const words = segment.text.trim().split(/\s+/);
          return words.map(word => ({
            word,
            start: parseFloat(segment.start),
            end: parseFloat(segment.end)
          }));
        });

        if (wordsWithTimestamps.length > MAX_WORDS) {
          const startTime = wordsWithTimestamps[wordsWithTimestamps.length - MAX_WORDS]?.start;
          if (startTime !== undefined) {
            const filteredSegments = response.segments.filter(segment => 
              parseFloat(segment.start) >= startTime
            );
            
            const text = filteredSegments
              .map(segment => segment.text.trim())
              .join(' ');
            setTranscribedText(text);
          }
        } else {
          const text = response.segments
            .map(segment => segment.text.trim())
            .join(' ');
          setTranscribedText(text);
        }
      } else if (typeof response.segments === 'object' && !Array.isArray(response.segments)) {
        if ('audio' in response.segments) {
          // Обработка аудио ответа
          const audioResponse = response as AudioResponse;
          if (!audioQueueRef.current) {
            audioQueueRef.current = new AudioQueueManager(setCurrentLevel);
          }
          audioQueueRef.current.addToQueue(audioResponse.segments.audio);
          setLastAudio(audioResponse.segments.audio);
        } else {
          // Обработка переводов
          setTranslations(response.segments as Record<string, string>);
        }
      }
    }
  };

  return (
    <MainLayout>
      <div className={s.App}>
        <div className={s.App_Answer}>
          <div className={s.App_Answer_Wrapper}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Typography.Text className={s.App_Answer_Wrapper_Text}>
                {transcribedText ? transcribedText : 'Answer ...' }
              </Typography.Text>
              <AudioVisualizerPlayer level={currentLevel} width={200} height={200} />
              
              {Object.entries(translations).map(([lang, text]) => (
                <Typography.Text key={lang} className={s.App_Answer_Wrapper_Text}>
                  <strong>{lang.toUpperCase()}:</strong> {text}
                </Typography.Text>
              ))}
            </Space>
          </div>
        </div>
        <div>
          <MicrophoneButton onTranscription={handleTranscription} />
        </div>
      </div>
    </MainLayout>
  );
}

export default App;
