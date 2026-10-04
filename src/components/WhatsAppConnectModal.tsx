'use client';

import React from 'react';
import { Button } from './ui';

interface WhatsAppConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppConnectModal({ isOpen, onClose }: WhatsAppConnectModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-lg p-6 sm:p-8 bg-surface border border-border rounded-2xl shadow-2xl space-y-6 text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-ink-muted hover:text-ink hover:bg-surface-sunken transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Title */}
        <div className="text-center space-y-1.5">
          <h3 id="modal-title" className="text-2xl font-black tracking-tight text-ink font-inktrap">
            Connect on WhatsApp
          </h3>
          <p className="text-xs sm:text-sm text-ink-muted">
            Choose your preferred way to start scanning scams directly on WhatsApp
          </p>
        </div>

        {/* Options Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center pt-2">
          {/* Left Column: QR Code */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-surface-sunken border border-border text-center space-y-3">
            <div className="p-3 bg-white rounded-lg shadow-md border border-border">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://wa.me/?text=Hi%20SANGYAN%20Scam%20Check"
                alt="Scan WhatsApp QR Code"
                className="w-36 h-36 object-contain"
              />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-ink block">Scan QR Code</span>
              <span className="text-[11px] text-ink-muted leading-tight block">
                Open phone camera to scan and start chatting instantly
              </span>
            </div>
          </div>

          {/* Right Column: WhatsApp Web Button */}
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z" />
                <path d="M6 10h12v4H6z" />
              </svg>
            </div>
            <div className="space-y-1">
              <a
                href="https://wa.me/?text=Hi%20SANGYAN%20Scam%20Check"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Continue to WhatsApp Web
              </a>
              <span className="text-[11px] text-ink-muted block pt-1">
                Opens chat directly in a new browser tab
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-border/60 text-center">
          <p className="text-[11px] text-ink-muted font-mono">
            ● 100% On-Device PII Scrubbing · Zero Message Storage
          </p>
        </div>
      </div>
    </div>
  );
}
