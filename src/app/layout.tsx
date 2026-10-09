import { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'FinanceX — AI-Guided Investor Intelligence & Fraud Defense (ArgusFin Shield)',
  description:
    'FinanceX unified platform: Learn market essentials, verify claims with ArgusFin Shield AI, and anchor tamper-proof credentials on Web3.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

