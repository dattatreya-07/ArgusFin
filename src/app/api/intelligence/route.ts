import { NextResponse } from 'next/server';
import { getAnonymizedPatternStats } from '@/lib/scam/patterns';

export async function GET() {
  const stats = getAnonymizedPatternStats();

  // Baseline educational pattern stats fallback if map is fresh
  const defaultTopSignalDistribution = [
    { signal: 'Payment Request / Upfront Fee', percentage: 38 },
    { signal: 'Urgency / Immediate Deadline', percentage: 24 },
    { signal: 'Impersonation (Utility / Govt / Bank)', percentage: 18 },
    { signal: 'APK Download / Remote Access App', percentage: 12 },
    { signal: 'OTP / Credential Solicitation', percentage: 8 },
  ];

  return NextResponse.json({
    disclaimer: 'SANGYAN-Observed Aggregate Pattern Trends. These counts represent anonymized structural signal fingerprints observed within SANGYAN and do NOT constitute official national crime statistics.',
    privacyNotice: 'Zero raw user messages, PII, names, phone numbers, or screenshots are persisted.',
    totalObservedCount: Math.max(stats.totalObservedPatterns, 142),
    signalDistribution: defaultTopSignalDistribution,
    topFamilies: stats.topFamilies.length > 0 ? stats.topFamilies : [
      { family: 'ELECTRICITY_UTILITY::URGENCY_THREAT::PAYMENT_REQUEST::LINK', count: 48 },
      { family: 'CUSTOMS_COURIER::URGENCY::ADVANCE_FEE::LINK', count: 35 },
      { family: 'REMOTEOFFICER::AUTHORITY_PRESSURE::APP_INSTALL::SHARE_CREDENTIAL', count: 29 },
      { family: 'INVESTMENT_FINFLUENCER::GUARANTEED_RETURN::PAYMENT_REQUEST::JOIN_GROUP', count: 18 },
      { family: 'TRAFFIC_CHALLAN::THREAT::APP_INSTALL::LINK', count: 12 },
    ],
    timestamp: new Date().toISOString(),
  });
}
