'use client';

import React, { useEffect, useState, useRef } from 'react';

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  const pos = useRef({ x: -100, y: -100 });
  const trailPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Detect touch device
    if (typeof window !== 'undefined') {
      const touchQuery = window.matchMedia('(pointer: coarse)');
      if (touchQuery.matches || 'ontouchstart' in window) {
        setIsTouch(true);
        return;
      }
      setMounted(true);
      document.documentElement.classList.add('has-custom-cursor');
    }

    const handleMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'a, button, input, textarea, select, [role="button"], .interactive, .cursor-pointer'
        );
        setIsHovered(!!interactive);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth animation loop for trail
    const loop = () => {
      // Smooth interpolation (lerp)
      trailPos.current.x += (pos.current.x - trailPos.current.x) * 0.18;
      trailPos.current.y += (pos.current.y - trailPos.current.y) * 0.18;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }

      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailPos.current.x}px, ${trailPos.current.y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible]);

  if (!mounted || isTouch) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* Ambient trailing golden-orange glow ring */}
      <div
        ref={trailRef}
        className={`fixed top-0 left-0 -ml-5 -mt-5 w-10 h-10 rounded-full border transition-all duration-150 ease-out flex items-center justify-center ${
          isHovered
            ? 'w-14 h-14 -ml-7 -mt-7 border-[#B84E00] dark:border-[#F5A524] bg-[#F5A524]/20 shadow-[0_0_24px_rgba(245,165,36,0.5)] scale-110'
            : 'border-[#B84E00]/40 dark:border-[#F5A524]/40 bg-[#F5A524]/10 shadow-[0_0_14px_rgba(245,165,36,0.25)]'
        } ${isClicked ? 'scale-90 bg-[#F5A524]/40' : ''}`}
        style={{ willChange: 'transform' }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#B84E00] dark:bg-[#F5A524]" />
      </div>

      {/* Main Cursor icon pointer */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 -ml-2 -mt-2 transition-transform duration-75 ease-out select-none ${
          isHovered ? 'scale-125' : 'scale-100'
        } ${isClicked ? 'scale-95' : ''}`}
        style={{ willChange: 'transform' }}
      >
        <img
          src="/assets/icons8-cursor-100.png"
          alt=""
          className="w-6 h-6 object-contain drop-shadow-[0_2px_10px_rgba(245,165,36,0.7)]"
          draggable={false}
        />
      </div>
    </div>
  );
}

