import { useRef, useEffect } from "react";

const WaveCircle = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 500;
    canvas.width = size;
    canvas.height = size;
  
    const center = size / 2;
    const radius = size / 2;
  
    const lines = 25;
    const points = 100;
    let time = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);
  
      // Clip to circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.clip();
  
      ctx.lineWidth = 0.5;
  
      const startX = center - radius;
      const endX = center + radius;
      const width = endX - startX;
  
      for (let i = 0; i < lines; i++) {
        const y = center - (lines / 2) * 8 + i * 8;
        const wavePoints: [number, number][] = [];
  
        // Верх волны
        for (let j = 0; j <= points; j++) {
          const x = startX + (j / points) * width;
          const wave = Math.sin((j / points) * Math.PI * 2 + i * 0.4 + time);
          const amplitude = 10 + Math.sin(i * 0.3 + time) * 15;
          const zOffset = Math.cos((i / lines) * Math.PI) * 10;
  
          const newY = y + wave * amplitude + zOffset;
          wavePoints.push([x, newY]);
        }
  
        ctx.beginPath();
        ctx.moveTo(wavePoints[0][0], wavePoints[0][1]);
  
        for (let k = 1; k < wavePoints.length; k++) {
          ctx.lineTo(wavePoints[k][0], wavePoints[k][1]);
        }
  
        // Низ полосы
        const thickness = 2;
        for (let k = wavePoints.length - 1; k >= 0; k--) {
          const [x, yTop] = wavePoints[k];
          ctx.lineTo(x, yTop + thickness);
        }
  
        ctx.closePath();
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fill();
      }
  
      // === МЯГКОЕ ЗАТУХАНИЕ ПО КРАЯМ ===
      const fadeGradient = ctx.createLinearGradient(startX, 0, endX, 0);
      fadeGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      fadeGradient.addColorStop(0.1, "rgba(255, 255, 255, 1)");
      fadeGradient.addColorStop(0.9, "rgba(255, 255, 255, 1)");
      fadeGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = fadeGradient;
      ctx.fillRect(startX, 0, width, size);
      ctx.globalCompositeOperation = "source-over";
      // === /КОНЕЦ ЗАТУХАНИЯ ===
  
      ctx.restore();
      time += 0.02;
      requestAnimationFrame(draw);
    }
  
    draw();

    return () => {
      
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: 300,
        height: 300,
        backgroundColor: "black",
        borderRadius: "50%",
        display: "block",
        margin: "0 auto",
      }}
    />
  );
};

export default WaveCircle;