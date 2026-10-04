'use client';

import React, { useEffect, useRef } from 'react';

export function HeroWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio || 500);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio || 350);

    let step = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio || 500;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio || 350;
    };

    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle background coordinate grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40 * window.devicePixelRatio;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw flowing wave 1 (Electric Cyan - Mathematical Truth)
      ctx.beginPath();
      ctx.lineWidth = 2 * window.devicePixelRatio;
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.75)';
      ctx.shadowColor = 'rgba(0, 242, 254, 0.6)';
      ctx.shadowBlur = 12;

      for (let x = 0; x < width; x += 5) {
        const y =
          height * 0.55 +
          Math.sin(x * 0.008 + step * 0.02) * (24 * window.devicePixelRatio) +
          Math.cos(x * 0.015 - step * 0.015) * (14 * window.devicePixelRatio);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 3. Draw flowing wave 2 (Golden Amber - Sovereign Ceilings)
      ctx.beginPath();
      ctx.lineWidth = 1.5 * window.devicePixelRatio;
      ctx.strokeStyle = 'rgba(245, 165, 36, 0.65)';
      ctx.shadowColor = 'rgba(245, 165, 36, 0.5)';
      ctx.shadowBlur = 10;

      for (let x = 0; x < width; x += 5) {
        const y =
          height * 0.45 +
          Math.sin(x * 0.006 - step * 0.018) * (20 * window.devicePixelRatio) +
          Math.sin(x * 0.012 + step * 0.025) * (10 * window.devicePixelRatio);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 4. Reset shadow
      ctx.shadowBlur = 0;

      // 5. Draw pulse benchmark nodes
      const nodeX1 = (width * 0.3 + Math.sin(step * 0.01) * 30) % width;
      const nodeY1 = height * 0.55 + Math.sin(nodeX1 * 0.008 + step * 0.02) * (24 * window.devicePixelRatio);

      ctx.fillStyle = '#00F2FE';
      ctx.beginPath();
      ctx.arc(nodeX1, nodeY1, 4 * window.devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();

      // Node ring
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.beginPath();
      ctx.arc(nodeX1, nodeY1, 9 * window.devicePixelRatio, 0, Math.PI * 2);
      ctx.stroke();

      step += 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-[280px] sm:h-[340px] rounded-xl overflow-hidden border border-border/70 bg-[#0A0A0D]/90 shadow-soft">
      {/* Grid badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="tag-bracket text-[10px]">
          REAL-TIME REALITY MATRIX
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 font-mono text-[10px] text-ink-dim px-2 py-0.5 bg-surface-sunken/80 rounded border border-border/40">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>SEBI / RBI SPREAD: ACTIVE</span>
      </div>

      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Bottom overlay indicators */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between font-mono text-[10px] text-ink-muted border-t border-border/40 pt-2 bg-surface/60 backdrop-blur-sm px-2 rounded">
        <span>SOVEREIGN CEILINGS (PPF/G-SEC: ~7-8%)</span>
        <span className="text-accent font-bold">100% EVIDENCE GROUNDED</span>
      </div>
    </div>
  );
}
