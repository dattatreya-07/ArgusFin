'use client';

import React, { useState, useRef, useCallback } from 'react';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';

interface ScrambleTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p';
}

export function ScrambleText({ text, className = '', as: Component = 'span' }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const isScrambling = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = useCallback(() => {
    // Disable under prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (isScrambling.current) return;
    isScrambling.current = true;
    let iteration = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

    // Target resolve duration: ~180ms (9 steps at 20ms)
    const stepIncrement = Math.max(0.5, text.length / 9);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        isScrambling.current = false;
        setDisplayText(text);
      }

      iteration += stepIncrement;
    }, 20);
  }, [text]);

  const stopScramble = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    isScrambling.current = false;
    setDisplayText(text);
  }, [text]);

  return (
    <Component
      onMouseEnter={startScramble}
      onMouseLeave={stopScramble}
      onFocus={startScramble}
      onBlur={stopScramble}
      className={`inline-block cursor-default select-none ${className}`}
    >
      {displayText}
    </Component>
  );
}
