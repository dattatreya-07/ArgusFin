import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractAndNormalizeDomain, queryRdap } from './rdap';
import { detectLookalikeDomain, normalizeConfusables, levenshteinDistance } from './lookalike';
import { matchOfficialAlerts } from './alerts';
import { extractAppSignals } from './appSignals';
import { extractAllSignals } from './index';
import { globalDomainCache } from './cache';

describe('Signals Subsystem', () => {
  beforeEach(() => {
    globalDomainCache.clear();
  });

  describe('RDAP Domain Extraction and Normalization', () => {
    it('normalizes various domain and URL formats properly', () => {
      expect(extractAndNormalizeDomain('https://www.google.com/search?q=test')).toBe('google.com');
      expect(extractAndNormalizeDomain('http://zerodha.com')).toBe('zerodha.com');
      expect(extractAndNormalizeDomain('KITE.ZERODHA.COM/')).toBe('kite.zerodha.com');
      expect(extractAndNormalizeDomain('not a domain')).toBeNull();
      expect(extractAndNormalizeDomain('')).toBeNull();
    });

    it('handles queryRdap gracefully on network failure or unavailable RDAP server', async () => {
      const result = await queryRdap('invalid-non-existent-xyz-98273.tld', 500);
      expect(result.status).toBe('unavailable');
      expect(result.hostname).toBe('invalid-non-existent-xyz-98273.tld');
    });
  });

  describe('Lookalike Detection', () => {
    it('recognizes official legitimate domains as NOT lookalikes', () => {
      const zerodha = detectLookalikeDomain('https://zerodha.com/login');
      expect(zerodha.isLookalike).toBe(false);
      expect(zerodha.matchedBrand).toBe('Zerodha');

      const sebi = detectLookalikeDomain('scores.sebi.gov.in');
      expect(sebi.isLookalike).toBe(false);
    });

    it('detects typosquatting and keyword injection lookalikes', () => {
      const fakeZerodha = detectLookalikeDomain('zerodha-trading-app.xyz');
      expect(fakeZerodha.isLookalike).toBe(true);
      expect(fakeZerodha.matchedBrand).toBe('Zerodha');

      const fakeGroww = detectLookalikeDomain('gr0ww-invest.com');
      expect(fakeGroww.isLookalike).toBe(true);
      expect(fakeGroww.matchedBrand).toBe('Groww');
    });

    it('returns isLookalike: false for completely unrelated domains', () => {
      const random = detectLookalikeDomain('myphotosblog.org');
      expect(random.isLookalike).toBe(false);
    });
  });

  describe('Official Alerts Matching', () => {
    it('matches official SEBI copy-trading alert on keyword trigger', () => {
      const matches = matchOfficialAlerts('Earn high profits with automated copy trading bot');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].publisher).toContain('SEBI');
      expect(matches[0].sourceUrl).toContain('sebi.gov.in');
    });

    it('returns empty array when text matches no alerts', () => {
      const matches = matchOfficialAlerts('Just bought some groceries from the supermarket.');
      expect(matches).toEqual([]);
    });
  });

  describe('App Signals Extraction', () => {
    it('detects remote access applications like AnyDesk and TeamViewer', () => {
      const sigs = extractAppSignals('Please install AnyDesk so our executive can assist you with your KYC');
      expect(sigs.length).toBe(1);
      expect(sigs[0].id).toBe('sig-app-remote-anydesk');
      expect(sigs[0].status).toBe('verified');
    });

    it('detects APK sideloading requests across English and Hindi', () => {
      const sigsEn = extractAppSignals('Download our special VIP trading app.apk now');
      expect(sigsEn.length).toBe(1);
      expect(sigsEn[0].id).toBe('sig-app-apk-download');

      const sigsHi = extractAppSignals('तुरंत ऐप डाउनलोड करें और ट्रेडिंग शुरू करें');
      expect(sigsHi.length).toBe(1);
    });
  });

  describe('Unified Signal Extractor', () => {
    it('extracts combined alerts, lookalikes, and app signals', async () => {
      const input = 'Install Anydesk and visit zerodha-profit.top for copy trading strategies';
      const result = await extractAllSignals(input, { enableRdap: false });
      
      expect(result.signals.length).toBeGreaterThanOrEqual(3);
      expect(result.domainSignals?.length).toBe(1);
      expect(result.domainSignals?.[0].isLookalike).toBe(true);
      expect(result.alertMatches.length).toBeGreaterThanOrEqual(1);
    });
  });
});
