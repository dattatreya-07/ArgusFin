export interface AuthorityChannel {
  type: 'phone' | 'url' | 'email';
  value: string;
  verified_at: string | null;
  notes?: string;
}

export interface AuthorityRecord {
  id: string;
  name: string;
  jurisdiction?: string;
  scope: string;
  categories: string[];
  channels: AuthorityChannel[];
  verified_at: string | null;
  source_url: string | null;
  languages?: string[];
  description?: string;
}

export interface RoutedAuthorityItem {
  id: string;
  name: string;
  scope: string;
  channels: AuthorityChannel[];
  verified_at: string | null;
  source_url: string | null;
  reason: string;
  actionGuidance: string;
  isEmergency: boolean;
}

export type AuthorityRouteStatus = 'ROUTED' | 'NO_MATCH' | 'UNAVAILABLE';

export interface AuthorityRouteResult {
  status: AuthorityRouteStatus;
  category: string;
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
  jurisdiction?: string;
  lang?: 'en' | 'hi' | 'ta';
}
