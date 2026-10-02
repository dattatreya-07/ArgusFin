import { AuthorityRouteResult } from '../authorities/types';

export type IncidentLanguage = 'en' | 'hi' | 'ta';

export type IncidentCategory =
  | 'PROMISED_RETURN'
  | 'TRADING_PLATFORM'
  | 'IMPERSONATION'
  | 'FAKE_ADVISORY'
  | 'PAYMENT_REQUEST'
  | 'REMOTE_ACCESS'
  | 'OTP_CREDENTIAL'
  | 'CRYPTO_STAKING'
  | 'IPO_ALLOTMENT'
  | 'COURSE_MENTORSHIP'
  | 'GROUP_SOLICITATION'
  | 'OTHER';

export interface IncidentTransaction {
  id?: string;
  utrNumber?: string;
  amount: number;
  beneficiaryAccountOrUpi?: string;
  date?: string;
  paymentMethod?: string;
  sourceBank?: string;
}

export interface IncidentRecord {
  language: IncidentLanguage;
  category?: string;

  whatHappened?: string;
  when?: string;
  promisedReturn?: string;
  requestedAction?: string;

  platform?: string;
  domain?: string;
  entityName?: string;

  paymentMethod?: string;
  amount?: number;
  transactions?: IncidentTransaction[];

  credentialsShared?: boolean;
  otpShared?: boolean;
  remoteAccessGranted?: boolean;

  currentStatus?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  evidenceNotes?: string;
  userConfirmed?: boolean;
}

export interface FieldProvenance<T> {
  value?: T;
  source: 'USER' | 'EXTRACTED' | 'SYSTEM';
  verified: boolean;
}

export interface ConsistencyIssue {
  field: string;
  severity: 'INFO' | 'WARNING';
  description: string;
  conflictingValues: string[];
}

export interface ConsistencyCheckResult {
  consistent: boolean;
  issues: ConsistencyIssue[];
  warnings: string[];
}

export interface IncidentReportDraft {
  header: {
    documentType: string;
    generatedAt: string;
    guidanceNotice: string;
    disclaimer: string;
    language: IncidentLanguage;
  };
  incidentDetails: {
    incidentDate: string;
    platformUsed: string;
    claimedEntityOrAdvisor: string;
    websiteOrDomain?: string;
    totalClaimedLoss: string;
    category: string;
    credentialsCompromised: boolean;
    remoteAccessGranted: boolean;
  };
  fieldProvenance: Record<string, 'USER' | 'EXTRACTED' | 'SYSTEM'>;
  transactions: IncidentTransaction[];
  narrative: string;
  consistency: ConsistencyCheckResult;
  routedAuthorities: AuthorityRouteResult;
  immediateActionDirectives: string[];
}
