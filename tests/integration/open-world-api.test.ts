import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as checkPost } from '@/app/api/check/route';
import { POST as askPost } from '@/app/api/ask/route';
import { POST as n8nPost } from '@/app/api/integrations/n8n/analyze/route';
import { POST as ocrPost } from '@/app/api/ocr/route';

describe('CORE-02.3A — Production API Open-World Integration Suite', () => {

  const NOVEL_SCAM_SAMPLES = [
    // Mandatory 10 Examples
    {
      category: 'courier',
      input: 'Your package is waiting for customs clearance. Pay ₹1840 within 30 minutes using the link below or the shipment will be returned.',
    },
    {
      category: 'electricity',
      input: 'FINAL NOTICE: Electricity supply will be disconnected tonight because your bill has not been updated. Complete the ₹799 verification payment immediately.',
    },
    {
      category: 'employment',
      input: 'You have been selected for remote work. Deposit ₹1,200 for account activation and you can start earning ₹4,000 per day.',
    },
    {
      category: 'fake refund',
      input: 'Your online purchase qualifies for a ₹6,850 refund. Confirm your bank details through this link within 15 minutes.',
    },
    {
      category: 'government impersonation',
      input: 'Your subsidy application is approved. Pay ₹399 processing charges to release the amount today.',
    },
    {
      category: 'social engineering',
      input: "Your friend's phone has been damaged. Please urgently send ₹12,000 to this new UPI ID. Do not call because the phone is unavailable.",
    },
    {
      category: 'fake support',
      input: 'Your wallet account has been flagged. Contact our security officer on this number and install the verification application.',
    },
    {
      category: 'crypto',
      input: 'Your staking account generated ₹72,000. Pay the release tax first to unlock your balance.',
    },
    {
      category: 'fake legal threat',
      input: 'A legal notice has been issued against your mobile number. Pay the settlement amount immediately to avoid further action.',
    },
    {
      category: 'fake travel refund',
      input: 'Your cancelled flight refund is pending. Pay ₹249 verification charges to receive ₹18,500.',
    },
    // Additional 10 Novel Categories
    {
      category: 'digital arrest',
      input: 'Customs department alert: A parcel containing illegal items was seized under your name. Pay ₹25,000 verification bail via UPI immediately.',
    },
    {
      category: 'traffic challan apk',
      input: 'E-challan pending: Your vehicle recorded 2 speeding violations. Download the official challan pay app from http://echallan-vahan.xyz/pay.apk to avoid court summons.',
    },
    {
      category: 'rental deposit scam',
      input: 'Spacious 2BHK flat available for rent at ₹15,000. Pay ₹5,000 gate pass deposit before visiting to reserve flat.',
    },
    {
      category: 'medical emergency scam',
      input: 'Urgent: Your nephew was admitted to hospital following an accident. Send ₹15,000 immediately to hospital counter UPI emergency-care@upi for operation.',
    },
    {
      category: 'fake pension update',
      input: 'EPFO Alert: Your monthly pension will be suspended due to pending digital life certificate. Submit OTP and pay ₹199 update fee.',
    },
    {
      category: 'fake social media verification',
      input: 'Instagram badge approval: Your account is verified for blue tick. Pay ₹499 badge fee via link within 2 hours or verification expires.',
    },
    {
      category: 'fake loyalty rewards',
      input: 'Credit Card Reward Points expiring: Redeem 14,500 points worth ₹7,250 now. Enter credit card number and OTP at http://card-rewards-claim.xyz.',
    },
    {
      category: 'fake telecom kyc',
      input: 'Jio SIM alert: Your SIM card will be deactivated within 2 hours due to unverified KYC. Call customer care 9876543210 immediately.',
    },
    {
      category: 'task scam / telegram vip group',
      input: 'Earn money by rating Google maps places. Complete 3 tasks to earn ₹1,500. Transfer ₹2,000 deposit to enter VIP payout channel.',
    },
    {
      category: 'fake loan waiver',
      input: 'PM Mudra Loan Waiver scheme: Your outstanding loan of ₹2,00,000 is 100% waived off. Pay ₹1,499 registration fee to download clearance certificate.',
    },
  ];

  const BENIGN_SAMPLES = [
    'How does electricity billing work in India?',
    'What should I check before paying a customs fee for an international package?',
    'Can a courier company legitimately charge customs duty upon delivery?',
    'My bank sent me a KYC reminder. What does KYC mean?',
    'How does crypto staking work and what are the legitimate risks?',
    'I received a job offer. What standard things should I verify before accepting?',
    'How do government subsidies normally work for agricultural equipment?',
  ];

  describe('1. /api/check Endpoint Open-World Verification', () => {
    it('analyzes all 20 novel unseen messages through HTTP API as HIGH or MEDIUM risk', async () => {
      for (let i = 0; i < NOVEL_SCAM_SAMPLES.length; i++) {
        const sample = NOVEL_SCAM_SAMPLES[i];
        const req = new NextRequest('http://localhost:3000/api/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': `10.1.0.${i + 1}`,
          },
          body: JSON.stringify({ maskedText: sample.input, lang: 'en' }),
        });

        const res = await checkPost(req);
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(['HIGH', 'MEDIUM'].includes(data.band)).toBe(true);
        expect(data.requestId).toBeDefined();
        expect(data.explanation).toBeDefined();
        expect(data.signals).toBeDefined();
        expect(Array.isArray(data.signals)).toBe(true);
      }
    });

    it('evaluates benign questions through HTTP API as LOW_SIGNALS risk', async () => {
      for (let i = 0; i < BENIGN_SAMPLES.length; i++) {
        const query = BENIGN_SAMPLES[i];
        const req = new NextRequest('http://localhost:3000/api/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': `10.2.0.${i + 1}`,
          },
          body: JSON.stringify({ maskedText: query, lang: 'en' }),
        });

        const res = await checkPost(req);
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.band).toBe('LOW_SIGNALS');
      }
    });
  });

  describe('2. /api/ask Endpoint Intent Routing & Open-World Verification', () => {
    it('correctly routes scam messages as CONTENT_ANALYSIS and returns high/medium risk', async () => {
      const sample = NOVEL_SCAM_SAMPLES[0]; // Customs scam
      const req = new NextRequest('http://localhost:3000/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.3.0.1',
        },
        body: JSON.stringify({ query: sample.input, lang: 'en' }),
      });

      const res = await askPost(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.intent).toBe('CONTENT_ANALYSIS');
      expect(['HIGH', 'MEDIUM'].includes(data.decision.band)).toBe(true);
      expect(data.answer).toBeDefined();
    });

    it('routes benign educational queries to RAG without false positive scam alarm', async () => {
      const query = BENIGN_SAMPLES[0];
      const req = new NextRequest('http://localhost:3000/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.3.0.2',
        },
        body: JSON.stringify({ query, lang: 'en' }),
      });

      const res = await askPost(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.intent).toBe('EDUCATIONAL_QA');
      expect(data.answer).toBeDefined();
    });
  });

  describe('3. /api/integrations/n8n/analyze n8n Decision Parity Verification', () => {
    it('produces decision parity with /api/check across all 20 novel messages', async () => {
      for (let i = 0; i < NOVEL_SCAM_SAMPLES.length; i++) {
        const sample = NOVEL_SCAM_SAMPLES[i];

        // 1. Call /api/check
        const checkReq = new NextRequest('http://localhost:3000/api/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': `10.4.0.${i + 1}`,
          },
          body: JSON.stringify({ maskedText: sample.input, lang: 'en' }),
        });
        const checkRes = await checkPost(checkReq);
        expect(checkRes.status).toBe(200);
        const checkData = await checkRes.json();
        expect(checkData.band).toBeDefined();

        // 2. Call /api/integrations/n8n/analyze
        const n8nReq = new NextRequest('http://localhost:3000/api/integrations/n8n/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-n8n-secret': 'dev_secret_n8n_sangyan_2026',
            'x-forwarded-for': `10.5.0.${i + 1}`,
          },
          body: JSON.stringify({
            channel: 'TELEGRAM',
            message: {
              id: `msg_n8n_test_${i}`,
              text: sample.input,
            },
            locale: 'en',
          }),
        });
        const n8nRes = await n8nPost(n8nReq);
        expect(n8nRes.status).toBe(200);

        const n8nData = await n8nRes.json();
        expect(n8nData.status).toBe('SUCCESS');
        expect(n8nData.decision).toBeDefined();
        expect(n8nData.decision.band).toBe(checkData.band);
      }
    });
  });

  describe('4. /api/ocr Image OCR Evidence Pipeline Verification', () => {
    it('processes image OCR payload and evaluates behavioral risk', async () => {
      const ocrPayload = {
        ocrText: 'URGENT NOTICE: Your electricity will be cut off tonight at 9:30 PM. Pay ₹1,299 via http://bescom-pay.xyz immediately.',
        filename: 'screenshot_electricity_scam.png',
        mimeType: 'image/png',
      };

      const req = new NextRequest('http://localhost:3000/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.6.0.1',
        },
        body: JSON.stringify(ocrPayload),
      });

      const res = await ocrPost(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.validation.valid).toBe(true);
      expect(data.analysis).toBeDefined();
      expect(['HIGH', 'MEDIUM'].includes(data.analysis.decision.band)).toBe(true);
    });
  });
});
