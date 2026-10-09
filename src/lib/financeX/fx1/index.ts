/**
 * FinanceX FX1 Integration Bridge
 * Connects legacy and extended FinLearnAI / FX1 rich educational modules,
 * Tamil translations, mock portfolio data, and video assets to FinanceX.
 */

export * from './schema';
export * from './mockData';
export * from './tamilContent';

export const FX1_ASSETS = {
  bootVideoUrl: '/FinanceX_BootFinal.mp4',
  brandLogo: '/favicon.png',
};

/**
 * Returns FX1 courses formatted for the FinanceX Academy catalog
 */
export function getFx1Courses() {
  return import('./mockData').then((m) => m.MOCK_COURSES);
}

/**
 * Returns FX1 demo holdings for practical portfolio risk simulations
 */
export function getFx1DemoHoldings() {
  return import('./mockData').then((m) => m.MOCK_DEMO_HOLDINGS);
}
