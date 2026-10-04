export interface AuthorityChannel {
  type: 'phone' | 'url' | 'email';
  value: string;
  verified_at: string | null;
  notes?: string;
}

export interface AuthorityRecord {
  id: string;
  name: string;
  purpose?: string;
  scope: string;
  jurisdiction: 'IN' | 'UNKNOWN' | string;
  status: 'VERIFIED' | 'UNVERIFIED';
  trust_tier?: string;
  source_title?: string;
  source_url: string | null;
  channels: AuthorityChannel[];
  verified_at: string | null;
}

export interface RoutedAuthorityItem {
  id: string;
  name: string;
  scope: string;
  jurisdiction: string;
  status: 'VERIFIED' | 'UNVERIFIED';
  channels: AuthorityChannel[];
  verified_at: string | null;
  source_url: string | null;
  reason: string;
  actionGuidance: string;
  isEmergency: boolean;
}

export type AuthorityRouteStatus = 'ROUTED' | 'NO_MATCH' | 'UNKNOWN_JURISDICTION' | 'UNAVAILABLE';

export interface AuthorityRouteResult {
  status: AuthorityRouteStatus;
  category: string;
  jurisdiction: 'IN' | 'UNKNOWN' | string;
  authorityIds: string[];
  routes: RoutedAuthorityItem[];
  reasons: string[];
  disclaimer: string;
}

export interface RoutingInput {
  category?: string;
  archetype?: string;
  riskBand?: string;
  situation?: string;
  paymentMethod?: string;
  platform?: string;
  moneySent?: boolean;
  credentialsShared?: boolean;
  otpShared?: boolean;
  remoteAccessGranted?: boolean;
  hoursElapsed?: number;
  jurisdiction?: 'IN' | 'UNKNOWN' | string;
  lang?: 'en' | 'hi' | 'ta';
}
