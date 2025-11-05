import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DEFAULT_TIME_STEP,
  DB_MAX_THRESHOLD,
} from './audioTimelineConfig';
import { AudioTimelineHelper } from './audioTimelineHelper';

interface AudioTimelineProps {
  mediaStream?: MediaStream | null;
  classes?: string;
  showControls?: boolean;
}

export const AudioTimeline = ({
  mediaStream,
  classes,
  showControls = true,
}: AudioTimelineProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const helperRef = useRef<AudioTimelineHelper | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  // WebRTC constraints state
  const [autoGainControl, setAutoGainControl] = useState<boolean>(false);
  const [echoCancellation, setEchoCancellation] = useState<boolean>(false);
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(false);

  // Initialize constraints state from mediaStream
  useEffect(() => {
    if (mediaStream) {
      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const settings = audioTracks[0].getSettings();
        setAutoGainControl(settings.autoGainControl ?? false);
        setEchoCancellation(settings.echoCancellation ?? false);
        setNoiseSuppression(settings.noiseSuppression ?? false);
      }
    }
  }, [mediaStream]);

  // Auto-start timeline when mediaStream becomes available
  useEffect(() => {
    if (mediaStream && !isActive) {
      setIsActive(true);
    }
  }, [mediaStream]);

  // Apply sensitivity when DB_MAX_THRESHOLD changes
  useEffect(() => {
    if (helperRef.current) {
      helperRef.current.setSensitivity(DB_MAX_THRESHOLD);
    }
  }, [DB_MAX_THRESHOLD]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d') as CanvasRenderingContext2D;

      if (mediaStream && isActive) {
        // Create helper and start rendering
        helperRef.current = new AudioTimelineHelper(context, mediaStream, DEFAULT_TIME_STEP);
        const frameId = helperRef.current.initRenderLoop();
        animationFrameIdRef.current = frameId;
      } else {
        // Render initial state
        AudioTimelineHelper.renderInitialState(context);
      }
    }

    // Cleanup
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      helperRef.current = null;
    };
  }, [mediaStream, isActive]);

  // Apply sensitivity when DB_MAX_THRESHOLD changes
  useEffect(() => {
    if (helperRef.current) {
      helperRef.current.setSensitivityFromThreshold();
    }
  }, [DB_MAX_THRESHOLD]);

  // Apply WebRTC constraints to the media stream
  const applyConstraints = async () => {
    if (mediaStream) {
      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length > 0) {
        try {
          await audioTracks[0].applyConstraints({
            autoGainControl,
            echoCancellation,
            noiseSuppression,
          });
        } catch (error) {
          console.error('Failed to apply constraints:', error);
        }
      }
    }
  };

  // Handle constraint toggle changes
  const handleAutoGainControlToggle = () => {
    const newValue = !autoGainControl;
    setAutoGainControl(newValue);
  };

  const handleEchoCancellationToggle = () => {
    const newValue = !echoCancellation;
    setEchoCancellation(newValue);
  };

  const handleNoiseSuppressionToggle = () => {
    const newValue = !noiseSuppression;
    setNoiseSuppression(newValue);
  };

  // Apply constraints whenever they change
  useEffect(() => {
    applyConstraints();
  }, [autoGainControl, echoCancellation, noiseSuppression, mediaStream]);

  return (
    <div className={clsx('flex flex-col items-center gap-4 w-full p-4', classes)}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded-lg shadow-lg bg-[#1a1a1a]"
      />

      {showControls && (
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <div className="flex items-center bg-[#2a2a2a] px-4 py-2 rounded border border-[#444]">
            <label className="text-white text-sm flex items-center gap-2 cursor-pointer">
              <span>Auto Gain Control</span>
              <input
                type="checkbox"
                checked={autoGainControl}
                onChange={handleAutoGainControlToggle}
                disabled={!mediaStream}
                className="w-[18px] h-[18px] cursor-pointer"
              />
            </label>
          </div>

          <div className="flex items-center bg-[#2a2a2a] px-4 py-2 rounded border border-[#444]">
            <label className="text-white text-sm flex items-center gap-2 cursor-pointer">
              <span>Echo Cancellation</span>
              <input
                type="checkbox"
                checked={echoCancellation}
                onChange={handleEchoCancellationToggle}
                disabled={!mediaStream}
                className="w-[18px] h-[18px] cursor-pointer"
              />
            </label>
          </div>

          <div className="flex items-center bg-[#2a2a2a] px-4 py-2 rounded border border-[#444]">
            <label className="text-white text-sm flex items-center gap-2 cursor-pointer">
              <span>Noise Suppression</span>
              <input
                type="checkbox"
                checked={noiseSuppression}
                onChange={handleNoiseSuppressionToggle}
                disabled={!mediaStream}
                className="w-[18px] h-[18px] cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
