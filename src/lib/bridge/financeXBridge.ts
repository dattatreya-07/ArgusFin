/**
 * FinanceX <-> ArgusFin Decoupled Bridge
 * 
 * Provides an isolated, typed bridge interface connecting ArgusFin's fraud resilience
 * engine with the FinanceX / FX1 educational and simulation ecosystem without mixing
 * internal schemas, state, or mock datasets into ArgusFin core pages.
 */

export interface FinanceXBridgeConfig {
  hubRoute: string;
  bootVideoUrl: string;
  name: string;
  version: string;
  externalBridgeEnabled: boolean;
}

export const FINANCE_X_BRIDGE: FinanceXBridgeConfig = {
  hubRoute: '/financex',
  bootVideoUrl: '/FinanceX_BootFinal.mp4',
  name: 'FinanceX Unified Platform',
  version: '1.0.0',
  externalBridgeEnabled: true,
};

export interface BridgeLink {
  title: string;
  description: string;
  targetRoute: string;
  badge: string;
}

export const FINANCE_X_BRIDGE_LINKS: BridgeLink[] = [
  {
    title: 'FinanceX Hub & Boot Video',
    description: 'Architecture walkthrough and platform tour video',
    targetRoute: '/financex',
    badge: 'Boot Media',
  },
  {
    title: 'FX1 Masterclass Catalog',
    description: 'NISM derivatives, fixed income, and valuation courses',
    targetRoute: '/financex#courses',
    badge: 'Curriculum',
  },
  {
    title: 'Portfolio & Risk Lab',
    description: 'Paper portfolio simulation and risk sensitivity tests',
    targetRoute: '/financex#portfolio',
    badge: 'Simulator',
  },
];
