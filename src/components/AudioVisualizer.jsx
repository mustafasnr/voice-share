import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';

export function AudioVisualizer() {
  const canvasRef = useRef(null);
  const audioLevel = useStore(state => state.audioLevel);
  const isStreaming = useStore(state => state.isStreaming);

  // History of levels (last 60 frames)
  const historyRef = useRef(new Array(60).fill(0));

  // Use a ref to capture the latest level without triggering re-renders
  const lastLevelRef = useRef(0);
  useEffect(() => {
    lastLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let animationId;
    let lastFrameTime = 0;
    const frameInterval = 1000 / 24; // ~24 FPS (41.6ms per frame)

    const render = (timestamp) => {
      animationId = requestAnimationFrame(render);

      // Frame rate limiting: only update if enough time has passed
      const elapsed = timestamp - lastFrameTime;
      if (elapsed < frameInterval) return;

      lastFrameTime = timestamp - (elapsed % frameInterval);

      if (isStreaming) {
        historyRef.current.push(lastLevelRef.current);
        historyRef.current.shift();
      } else {
        historyRef.current.fill(0);
      }

      ctx.clearRect(0, 0, width, height);

      const barWidth = width / historyRef.current.length;
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#60a5fa');
      gradient.addColorStop(1, '#2563eb');

      ctx.fillStyle = gradient;

      historyRef.current.forEach((level, i) => {
        const visualBoost = Math.sqrt(level) * 1.5;
        const normalizedLevel = Math.max(0.05, Math.min(visualBoost, 1.0));

        const barHeight = normalizedLevel * height * 0.8;
        const x = i * barWidth;
        const y = (height - barHeight) / 2;

        const radius = 2;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x + 1, y, barWidth - 2, barHeight, radius);
        } else {
          ctx.rect(x + 1, y, barWidth - 2, barHeight);
        }
        ctx.fill();
      });
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [isStreaming]);

  return (
    <div className="w-full bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden p-4 h-24 flex items-center justify-center relative">
      <canvas
        ref={canvasRef}
        width={400}
        height={60}
        className="w-full h-full opacity-80"
      />
      {!isStreaming && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          Ses bekleniyor...
        </div>
      )}
      {isStreaming && (
        <div className="absolute top-2 left-3 text-[9px] uppercase font-black text-primary/50 tracking-tighter">
          Live Waveform
        </div>
      )}
    </div>
  );
}
