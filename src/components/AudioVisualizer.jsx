import React, { useRef, useEffect } from 'react';

/**
 * Responsive and stylish Audio Visualizer
 * @param {number} level - Current audio peak level (0.0 to 1.0)
 * @param {boolean} isStreaming - Whether audio is active
 * @param {string} color - Primary color for the waveform
 * @param {number} barCount - Number of bars to render (higher = more detailed)
 * @param {'bars' | 'wave' | 'compact'} mode - Visualization style
 */
export function AudioVisualizer({
  level = 0,
  isStreaming = false,
  color = '#60a5fa',
  barCount = 40,
  mode = 'bars',
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const historyRef = useRef(new Array(barCount).fill(0));
  const requestRef = useRef();
  const lastLevelRef = useRef(0);

  // Keep latest level in a ref to avoid extra renders
  useEffect(() => {
    lastLevelRef.current = level;
  }, [level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    const dpr = window.devicePixelRatio || 1;
    let rect = { width: 0, height: 0 };

    const setSize = (entry) => {
      const cr = entry?.contentRect || container.getBoundingClientRect();
      rect = { width: cr.width, height: cr.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    // Initial sizing
    setSize();

    // Observe container size changes
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setSize(entries[0]);
    });
    observer.observe(container);

    const render = () => {
      const { width, height } = rect;
      if (width === 0 || height === 0) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      // Update history based on streaming state
      if (isStreaming) {
        historyRef.current.push(lastLevelRef.current);
        historyRef.current.shift();
      } else {
        historyRef.current.push(0);
        historyRef.current.shift();
      }

      ctx.clearRect(0, 0, width, height);
      const bars = historyRef.current;

      if (mode === 'bars') {
        const barWidth = width / bars.length;
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + '44');
        bars.forEach((val, i) => {
          const visualLevel = Math.sqrt(val) * 1.5;
          const h = Math.max(2, visualLevel * height * 0.8);
          const x = i * barWidth;
          const y = (height - h) / 2;
          ctx.beginPath();
          ctx.fillStyle = gradient;
          if (ctx.roundRect) {
            ctx.roundRect(x + 1, y, Math.max(1, barWidth - 1), h, 1);
          } else {
            ctx.rect(x + 1, y, Math.max(1, barWidth - 1), h);
          }
          ctx.fill();
        });
      } else if (mode === 'wave') {
        const barWidth = width / bars.length;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.moveTo(0, height / 2);
        bars.forEach((val, i) => {
          const visualLevel = Math.sqrt(val) * 1.5;
          const x = i * barWidth;
          const y = (height / 2) + ((visualLevel * height * 0.4) * (i % 2 === 0 ? 1 : -1));
          ctx.lineTo(x, y);
        });
        ctx.stroke();
      } else if (mode === 'compact') {
        const visualLevel = Math.sqrt(lastLevelRef.current) * 1.2;
        const w = Math.min(width, visualLevel * width);
        ctx.fillStyle = color + '22';
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(0, height / 2 - 2, width, 4, 2);
          ctx.fill();
        }
        ctx.fillStyle = color;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(0, height / 2 - 2, w, 4, 2);
          ctx.fill();
        } else {
          ctx.fillRect(0, height / 2 - 2, w, 4);
        }
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(requestRef.current);
      observer.disconnect();
    };
  }, [isStreaming, color, mode]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} className="relative">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
        className="opacity-90 transition-transform"
      />
    </div>
  );
}
