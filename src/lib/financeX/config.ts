export const FINANCEX_CONFIG = {
  name: 'FinanceX',
  tagline: 'Learn. Protect. Prove.',
  version: '1.0.0-phase0',
  environment: process.env.NODE_ENV || 'development',
  shieldName: 'ArgusFin Shield',
  features: {
    academy: true,
    shield: true,
    prove: true, // Foundation page enabled, on-chain execution disabled until Phase 2
  },
  supportedLanguages: ['en', 'ta', 'hi'] as const,
  defaultLanguage: 'en' as const,
};
