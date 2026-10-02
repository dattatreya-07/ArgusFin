import { NextRequest, NextResponse } from 'next/server';
import authoritiesData from '../../../../data/authorities.json';

export interface AuthorityChannel {
  type: string;
  value: string;
  verified_at: string | null;
  notes?: string;
}

export interface AuthorityItem {
  id: string;
  name: string;
  scope: string;
  channels: AuthorityChannel[];
  verified_at: string | null;
  source_url: string | null;
}

const SITUATION_AUTHORITY_MAP: Record<string, string[]> = {
  offer_only: ['sebi_scores', 'rbi_sachet', 'telecom_fraud_reporting'],
  money_lost_recent: ['national_cyber_helpline', 'cybercrime_portal', 'user_bank'],
  unregistered_adviser: ['sebi_scores', 'rbi_sachet'],
  social_media_fraud: ['telecom_fraud_reporting', 'cybercrime_portal', 'sebi_scores'],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const situation = searchParams.get('situation') || 'money_lost_recent';

  const allAuthorities = authoritiesData as AuthorityItem[];
  const targetIds = SITUATION_AUTHORITY_MAP[situation] || SITUATION_AUTHORITY_MAP.money_lost_recent;

  const relevant = allAuthorities.filter((auth) => targetIds.includes(auth.id));

  return NextResponse.json(
    {
      situation,
      authorities: relevant,
      allAuthorities,
    },
    { status: 200 }
  );
}
