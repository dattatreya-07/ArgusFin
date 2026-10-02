export type SignalStatus = 'verified' | 'unverified' | 'unavailable';

export interface Signal {
  id: string;
  label: string;
  value: string;
  sourceUrl?: string;
  asOf?: string;
  confidence?: number;
  status?: SignalStatus;
  details?: Record<string, unknown>;
}

export interface DomainSignals {
  hostname: string;
  domainAgeDays?: number;
  registrationDate?: string;
  rdapStatus: SignalStatus;
  isLookalike: boolean;
  matchedBrand?: string;
  lookalikeReason?: string;
}

export interface ExtractedSignalSet {
  signals: Signal[];
  domainSignals?: DomainSignals[];
  alertMatches: Array<{
    alertId: string;
    title: string;
    sourceUrl: string;
    publishedAt: string;
    matchedAlias: string;
  }>;
}
