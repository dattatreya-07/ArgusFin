import { describe, it, expect } from 'vitest';
import { createCanonicalReportPacket } from '@/lib/report/packet';
import { exportToHtml, exportToPlainText, exportToJson } from '@/lib/report/export';

describe('CORE-05 — Report Packet & Export Suite', () => {
  it('1. builds canonical report packet distinguishing observed facts, user statements, and analysis', () => {
    const packet = createCanonicalReportPacket({
      locale: 'en',
      jurisdiction: 'IN',
      rawUserInput: 'My phone number is 9876543210 and UPI is fraud@paytm. They promised 20% daily return.',
      platform: 'WhatsApp',
      claimedEntityOrAdvisor: 'VIP Stock Academy',
      websiteOrDomain: 'http://vip-invest.top',
      totalClaimedLoss: 25000,
    });

    expect(packet.reportVersion).toBe('1.0');
    expect(packet.submissionNotice).toBe('Prepared for your review — not automatically submitted.');
    expect(packet.observedFacts.length).toBeGreaterThan(0);
    expect(packet.observedClaims.length).toBeGreaterThan(0);
    expect(packet.userStatements[0]).not.toContain('9876543210'); // PII masked
    expect(packet.userStatements[0]).toContain('[PHONE]');
    expect(packet.userStatements[0]).toContain('[UPI]');
    expect(packet.exportIntegrityHash).toBeDefined();
    expect(packet.exportIntegrityHash.length).toBe(64);
  });

  it('2. exports safe HTML format with prominent non-automatic submission banner', () => {
    const packet = createCanonicalReportPacket({
      locale: 'en',
      jurisdiction: 'IN',
      narrative: 'Test narrative <script>alert("xss")</script>',
    });

    const html = exportToHtml(packet);
    expect(html).toContain('Prepared for your review — not automatically submitted.');
    expect(html).not.toContain('<script>alert("xss")</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('3. exports structured plaintext and JSON formats correctly', () => {
    const packet = createCanonicalReportPacket({
      locale: 'en',
      jurisdiction: 'IN',
      narrative: 'Plaintext report test narrative.',
    });

    const txt = exportToPlainText(packet);
    expect(txt).toContain('SANGYAN CITIZEN INCIDENT REVIEW PACKET');
    expect(txt).toContain('PREPARED FOR YOUR REVIEW — NOT AUTOMATICALLY SUBMITTED');

    const jsonStr = exportToJson(packet);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.submissionNotice).toBe('Prepared for your review — not automatically submitted.');
  });
});
