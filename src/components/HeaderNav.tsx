'use client';

import React, { useState, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

export function HeaderNav() {
  const tNav = useTranslations('nav');
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: tNav('home'), exact: true },
    { href: '/learn', label: tNav('learn') },
    { href: '/check', label: tNav('protect'), badge: true },
    { href: '/calculator', label: tNav('calculator') },
    { href: '/prove', label: tNav('prove') },
    { href: '/dashboard', label: tNav('dashboard') },
    { href: '/report', label: tNav('report') },
  ];

  const isActiveRoute = (href: string, exact: boolean = false) => {
    if (exact || href === '/') {
      return pathname === '/' || pathname === '';
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-surface/95 backdrop-blur-md border-b border-border shadow-soft'
          : 'bg-canvas/40 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Brand Logo & Mobile Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg p-1"
          >
            {/* Branded Logo Mark */}
            <div className="relative flex items-center justify-center">
              <img
                src="/assets/logo.png"
                alt="FinanceX Logo"
                className="w-8 h-8 object-contain rounded-md shadow-soft group-hover:scale-105 transition-transform"
              />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            {/* FinanceX Branding & ArgusFin Shield Sub-tag */}
            <div className="flex items-center">
              <span className="text-xl font-black tracking-tight text-ink font-inktrap">
                Finance
              </span>
              <span className="text-xl font-black tracking-tight text-accent font-inktrap ml-0.5">
                X
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-surface-sunken text-accent border border-border rounded">
                ArgusFin Shield
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

        {/* Matrix-Style Navigation Bar (No Scrollbar, 6 Clean Links) */}
        <nav
          aria-label="Main navigation"
          className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-ink-muted"
        >
          {navLinks.map((link) => {
            const active = isActiveRoute(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-center px-2.5 py-1.5 rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent flex items-center justify-center gap-1.5 ${
                  active
                    ? 'font-bold text-accent border-b-2 border-accent bg-accent-soft/40 shadow-xs'
                    : 'font-semibold border-b-2 border-transparent hover:border-border hover:bg-surface-sunken hover:text-ink'
                }`}
              >
                {link.badge && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Controls */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="https://t.me/ArgusFin_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30 rounded-lg font-semibold text-xs transition-all shadow-xs"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S17.63 0 12 0zm5.56 8.16l-2.02 9.51c-.15.68-.55.84-1.12.52l-3.1-2.28-1.5 1.44c-.17.17-.31.31-.63.31l.22-3.16 5.76-5.2c.25-.22-.05-.34-.35-.15l-7.12 4.48-3.06-.96c-.67-.21-.68-.67.14-.99l11.96-4.61c.55-.2 1.04.14.82.99z"/>
            </svg>
            <span>Telegram Bot</span>
          </a>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
