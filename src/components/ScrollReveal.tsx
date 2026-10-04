'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollRevealProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal, .underlined, .tag').forEach((el) => {
        el.classList.add('active', 'animate');
      });
      return;
    }

    // Intersection Observer for .reveal elements
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.revealDelay ? parseInt(el.dataset.revealDelay) : 0;
            setTimeout(() => {
              el.classList.add('active');
            }, delay);
            revealObserver.unobserve(el);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    // Intersection Observer for .underlined animated dividers
    const underlineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.animationDelay ? parseInt(el.dataset.animationDelay) : 0;
            setTimeout(() => {
              el.classList.add('animate');
            }, delay);
            underlineObserver.unobserve(el);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    // Observe all matching elements
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
    document.querySelectorAll('.underlined').forEach((el) => underlineObserver.observe(el));

    // Cleanup
    return () => {
      revealObserver.disconnect();
      underlineObserver.disconnect();
    };
  }, [pathname]);

  return <>{children}</>;
}
