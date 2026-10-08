import { FINANCEX_CONFIG } from '../config';

export class FinanceXPlatform {
  public getConfig() {
    return FINANCEX_CONFIG;
  }

  public isFeatureEnabled(feature: keyof typeof FINANCEX_CONFIG.features): boolean {
    return FINANCEX_CONFIG.features[feature] ?? false;
  }
}

export const financeXPlatform = new FinanceXPlatform();
