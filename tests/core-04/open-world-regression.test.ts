import { describe, it, expect } from 'vitest';
import { analyzeScam } from '@/lib/scam/analyze';

describe('CORE-04 — Open-World Regression Suite', () => {
  const novelScams = [
    'New AI automated quantum bot guarantee 2.5% daily yield in USDT deposit now to private wallet 9876543210',
    'Pre-market private placement allocation 1000 shares guaranteed 5x listing profit pay advance via UPI admin@paytm',
    'Urgent CBI clearance required your Aadhaar linked to drug parcel transfer all savings to RBI escrow account now',
    'Exclusive VIP trading signal group win rate 100% send ₹15000 subscription to personal account 9876543210',
    'Earn ₹3000 daily rating products on web portal pay ₹5000 task deposit to unlock level 2 withdrawal'
  ];

  novelScams.forEach((text, idx) => {
    it(`open-world regression case #${idx + 1} evaluates as HIGH or MEDIUM risk`, async () => {
      const res = await analyzeScam({ source: 'WEB_TEXT', text: text });
      expect(['HIGH', 'MEDIUM']).toContain(res.decision.band);
    });
  });
});
