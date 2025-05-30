import {PropsWithChildren, useEffect, useRef} from 'react';

interface AudioVisualizerPlayerProps {
  level: number; // 0..1
  micLevel: number;
  width?: number;
  height?: number;
}

const barsCount = 64;
const wavePoints = 128;

export const AudioVisualizerPlayer = ({
                                        level,
                                        width = 300,
                                        height = 300,
                                        children,
                                        micLevel,
                                      }: PropsWithChildren<AudioVisualizerPlayerProps>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastLevel = useRef<any>(level);
  const lastMicLevel = useRef<any>(micLevel);

  useEffect(() => {
    lastLevel.current = level;
  }, [level]);

  useEffect(() => {
    lastMicLevel.current = micLevel;
  }, [micLevel]);

  useEffect(() => {
    let running = true;
    let phase = 0;
    let micPhase = 0;
    const barLevels = new Array(barsCount).fill(0);

    const draw = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d')!;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const minRadius = width * 0.0577; // 0.32 // радиус кружка внутри палочек
      const maxBarLen = width * 0.8418; // 0.18 // динна палочек
      const waveRadius = width * 0.19; // 0.36
      phase += 0.004 + lastLevel.current * 0.11; // 0.08
      micPhase += 0.004 + lastMicLevel.current * 2; // 0.08

      // --- Bars ---
      for (let i = 0; i < barsCount; i++) {
        // имитируем спектр, но реагируем на общий level
        const noise = 0.9 + 0.3 * Math.sin(phase * 0.2 + i * 0.3);
        const target = Math.pow(lastLevel.current, 1.2) * noise;
        barLevels[i] += (target - barLevels[i]) * 0.18;

        const angle = (i / barsCount) * 2 * Math.PI - Math.PI / 2;
        const barLen = maxBarLen * barLevels[i];

        const x0 = centerX + Math.cos(angle) * minRadius;
        const y0 = centerY + Math.sin(angle) * minRadius;
        const x1 = centerX + Math.cos(angle) * (minRadius + barLen);
        const y1 = centerY + Math.sin(angle) * (minRadius + barLen + 1);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = 'white';
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 8 + 2 * barLevels[i];
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();
      }

      // --- Wave ---
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i <= wavePoints; i++) {
        const t = i / wavePoints;
        const angle = t * 2 * Math.PI - Math.PI / 2;
        // волна по радиусу
        const wave = Math.sin(angle * barsCount / 8 + micPhase * 2) * 
                    (4 + 20 * Math.pow(lastMicLevel.current, 1.5)) * 
                    (2 + Math.sin(micPhase * 5) * 0.7);
        const r = waveRadius + wave;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'white';
      ctx.shadowColor = '#00fff7';
      ctx.shadowBlur = 16 + 32 * lastMicLevel.current;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // --- Fading Waves ---
      for (let wave = 1; wave <= 3; wave++) {
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i <= wavePoints; i++) {
          const t = i / wavePoints;
          const angle = t * 2 * Math.PI - Math.PI / 2;
          const fadeWave = Math.sin(angle * barsCount / 8 + micPhase * 2) * 
                          (4 + 20 * Math.pow(lastMicLevel.current, 1.5)) * 
                          (2 + Math.sin(micPhase * 5) * 0.7);
          const direction = lastMicLevel.current > 0.1 ? -1 : 1;
          const fadeR = waveRadius + fadeWave + direction * 30 * wave * Math.sin(micPhase * 3);
          const x = centerX + Math.cos(angle) * fadeR;
          const y = centerY + Math.sin(angle) * fadeR;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 / wave})`;
        ctx.shadowColor = '#00fff7';
        ctx.shadowBlur = (8 + 16 * lastMicLevel.current) / wave;
        ctx.lineWidth = 1.5 / wave;
        ctx.stroke();
        ctx.restore();
      }

      // --- Inward Wave ---
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i <= wavePoints; i++) {
        const t = i / wavePoints;
        const angle = t * 2 * Math.PI - Math.PI / 2;
        const inwardWave = Math.sin(angle * barsCount / 8 + micPhase * 2) * 
                          (4 + 20 * Math.pow(lastMicLevel.current, 1.5)) * 
                          (2 + Math.sin(micPhase * 5) * 0.7);
        const direction = lastMicLevel.current > 0.1 ? -1 : 1;
        const inwardR = waveRadius + inwardWave + direction * 40 * Math.sin(micPhase * 3);
        const x = centerX + Math.cos(angle) * inwardR;
        const y = centerY + Math.sin(angle) * inwardR;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowColor = '#00fff7';
      ctx.shadowBlur = 12 + 24 * lastMicLevel.current;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      if (running) requestAnimationFrame(draw);
    };

    draw();
    return () => {
      running = false;
    };
    // eslint-disable-next-line
  }, [width, height]);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '46%',
          right: '46%',
        }}
      >
        {children}
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
      />
    </div>

  );
};

export default AudioVisualizerPlayer;