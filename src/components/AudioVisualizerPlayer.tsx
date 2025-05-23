import { useEffect, useRef } from 'react';

interface AudioVisualizerPlayerProps {
	level: number; // 0..1
	width?: number;
	height?: number;
}

const barsCount = 64;
const wavePoints = 128;

export const AudioVisualizerPlayer = ({
	level,
	width = 300,
	height = 300,
}: AudioVisualizerPlayerProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const lastLevel = useRef<any>(level);

	useEffect(() => {
		lastLevel.current = level;
	}, [level]);

	useEffect(() => {
		let running = true;
		let phase = 0;
		const barLevels = new Array(barsCount).fill(0);

		const draw = () => {
			if (!canvasRef.current) return;
			const ctx = canvasRef.current.getContext('2d')!;
			ctx.clearRect(0, 0, width, height);

			const centerX = width / 2;
			const centerY = height / 2;
			const minRadius = width * 0.32;
			const maxBarLen = width * 0.18;
			const waveRadius = width * 0.36;
			phase += 0.04 + lastLevel.current * 0.08;

			// --- Bars ---
			for (let i = 0; i < barsCount; i++) {
				// имитируем спектр, но реагируем на общий level
				const noise = 0.7 + 0.3 * Math.sin(phase * 2 + i * 2.3);
				const target = Math.pow(lastLevel.current, 1.2) * noise;
				barLevels[i] += (target - barLevels[i]) * 0.18;

				const angle = (i / barsCount) * 2 * Math.PI - Math.PI / 2;
				const barLen = maxBarLen * barLevels[i];

				const x0 = centerX + Math.cos(angle) * minRadius;
				const y0 = centerY + Math.sin(angle) * minRadius;
				const x1 = centerX + Math.cos(angle) * (minRadius + barLen);
				const y1 = centerY + Math.sin(angle) * (minRadius + barLen);

				ctx.save();
				ctx.beginPath();
				ctx.moveTo(x0, y0);
				ctx.lineTo(x1, y1);
				ctx.strokeStyle = 'white';
				ctx.shadowColor = 'white';
				ctx.shadowBlur = 8 + 24 * barLevels[i];
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
				const wave =
					Math.sin(angle * barsCount / 8 + phase * 2.2) *
					(10 + 32 * Math.pow(lastLevel.current, 1.5));
				const r = waveRadius + wave;
				const x = centerX + Math.cos(angle) * r;
				const y = centerY + Math.sin(angle) * r;
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.strokeStyle = 'white';
			ctx.shadowColor = '#00fff7';
			ctx.shadowBlur = 16 + 32 * lastLevel.current;
			ctx.lineWidth = 2.5;
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
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			style={{
				background: 'black',
				display: 'block',
				margin: '0 auto',
				borderRadius: '50%',
				boxShadow: '0 0 32px #000',
			}}
		/>
	);
};

export default AudioVisualizerPlayer; 