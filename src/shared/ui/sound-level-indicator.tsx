import React, { useRef, useEffect } from 'react';

type Props = {
  level: number;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const SoundLevelIndicator: React.FC<Props> = ({ level }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    // Затухающая тень
    ctx.globalAlpha = 0.8; // степень затухания (чем меньше — тем дольше тень)
    
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    // Градиент для первой линии
    const grad1 = ctx.createLinearGradient(0, 0, w, 0);
    grad1.addColorStop(0, '#00f2fe');
    grad1.addColorStop(0.5, '#4facfe');
    grad1.addColorStop(1, '#f77062');

    // Градиент для второй линии
    const grad2 = ctx.createLinearGradient(0, 0, w, 0);
    grad2.addColorStop(0, '#f77062');
    grad2.addColorStop(0.5, '#4facfe');
    grad2.addColorStop(1, '#00f2fe');

    // Градиент для третьей линии
    const grad3 = ctx.createLinearGradient(0, 0, w, 0);
    grad3.addColorStop(0, '#4facfe');
    grad3.addColorStop(0.5, '#00f2fe');
    grad3.addColorStop(1, '#f77062');

    ctx.lineWidth = 2;
    ctx.shadowColor = '#4facfe';

    // Первая линия (движется вверх)
    ctx.strokeStyle = grad1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const t = x / w;
      const sensitivity = 5;
      const boostedLevel = Math.pow(level, 0.5);
      const amp = lerp(0, h / 2 - 10, Math.min(boostedLevel * sensitivity, 1));
      const y = h / 2 + (amp === 0 ? 0 : Math.sin(t * Math.PI * 2 * 6 + level * 10) * amp * Math.sin(t * Math.PI) * 0.8);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Вторая линия (движется вниз)
    ctx.strokeStyle = grad2;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const t = x / w;
      const sensitivity = -10;
      const boostedLevel = Math.pow(level, 0.5);
      const amp = lerp(0, h / 2 - 10, Math.min(boostedLevel * sensitivity, 1));
      const y = h / 2 + (amp === 0 ? 0 : Math.sin(t * Math.PI * 2 * 6 - level * 10) * amp * Math.sin(t * Math.PI) * 0.8);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Третья линия (движется в противоположном направлении)
    ctx.strokeStyle = grad3;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const t = x / w;
      const sensitivity = -5;
      const boostedLevel = Math.pow(level, 0.5);
      const amp = lerp(0, h / 2 - 10, Math.min(boostedLevel * sensitivity, 1));
      const y = h / 2 + (amp === 0 ? 0 : Math.sin(t * Math.PI * 2 * 6 + level * 20) * amp * Math.sin(t * Math.PI) * 0.8);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [level]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={220}
      style={{ width: '100%', height: 120}}
    />
  );
}

export { SoundLevelIndicator };
