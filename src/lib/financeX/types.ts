import { Lang, Archetype, RiskBand, Decision, InvestorProtectionSession } from '../types';

export type FinanceXModule = 'LEARN' | 'PROTECT' | 'PROVE';

export interface FinanceXUser {
  id: string;
  email?: string;
  walletAddress?: string;
  preferredLanguage: Lang;
  createdAt: string;
}

export interface LearningModule {
  id: string;
  slug: string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  category: 'SCAM_RECOGNITION' | 'COMPOUNDING_MATHS' | 'REGULATORY_VERIFICATION';
  estimatedMinutes: number;
  orderIndex: number;
}

export interface LearningProgress {
  userId: string;
  moduleId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  completionPercentage: number;
  completedAt?: string;
}

export interface ShieldAnalysis {
  id: string;
  timestamp: string;
  language: Lang;
  archetype: Archetype;
  riskBand: RiskBand;
  confidence: number;
  session?: InvestorProtectionSession;
}

export interface EvidenceRecord {
  id: string;
  evidenceHash: string;
  targetAuthority: string;
  status: 'DRAFT' | 'READY_FOR_SUBMISSION' | 'SUBMITTED';
  createdAt: string;
}

export interface CredentialRecord {
  id: string;
  userId: string;
  credentialType: string;
  credentialHash: string;
  tokenId?: string;
  txHash?: string;
  issuedAt: string;
}

export interface WalletConnection {
  address: string;
  chainId: number;
  connected: boolean;
}

// Re-export core scam types so downstream modules have one consistent import seam if needed
export type { Lang, Archetype, RiskBand, Decision, InvestorProtectionSession };
