import { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Argus Fin — SANGYAN Investor Resilience',
  description:
    'Evidence-based investor protection, real-time scam claim verification, and yield reality checks grounded in official SEBI/RBI benchmarks.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

