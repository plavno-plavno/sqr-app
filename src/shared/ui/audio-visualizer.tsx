import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  level: number;
}

const LINES = 8;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 400;
const CSS_WIDTH = '100%';
const CSS_HEIGHT = '200px';

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ level }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayedLevel = useRef(level);

  useEffect(() => {
    let frameId: number;
    const animate = () => {
      displayedLevel.current += (level - displayedLevel.current) * 0.15;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Плавное затухание
      ctx.globalAlpha = 0.09;
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;

      const w = CANVAS_WIDTH;
      const h = CANVAS_HEIGHT;
      const midY = h / 2;
      const margin = h * 0.1; // 10% отступ сверху и снизу
      const maxPossibleAmp = (h / 2) - margin;
      const minAmp = 8;
      const normLevel = Math.pow(displayedLevel.current, 0.27);
      const maxAmp = Math.min(minAmp + h * 0.7 * normLevel, maxPossibleAmp);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255,255,255)';

      for (let i = 0; i < LINES; i++) {
        const t = i / (LINES - 1);
        ctx.beginPath();

        for (let x = 0; x <= w; x += 1) {
          const normX = x / w;
          const amp = maxAmp * (1 - t * 0.01);
          const window = Math.sin(Math.PI * normX);
          const y =
            midY +
            Math.sin(normX * Math.PI * 2 + t * Math.PI) *
            amp *
            window;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, [level]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{
        width: CSS_WIDTH,
        height: CSS_HEIGHT,
        display: 'block',
      }}
    />
  );
};

export default AudioVisualizer; 