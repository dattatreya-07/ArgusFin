import { describe, it, expect } from 'vitest';
import { routeAuthorities, getVerifiedAuthorities, getAuthorityById } from './index';

describe('Verified Authority Router', () => {
  it('loads all verified authorities from repository data', () => {
    const authorities = getVerifiedAuthorities();
    expect(authorities.length).toBeGreaterThanOrEqual(5);

    // Verify critical authorities exist
    const helpline = authorities.find((a) => a.id === 'national_cyber_helpline');
    expect(helpline).toBeDefined();
    expect(helpline?.channels[0].value).toBe('1930');
    expect(helpline?.channels[0].verified_at).not.toBeNull();

    const scores = authorities.find((a) => a.id === 'sebi_scores');
    expect(scores).toBeDefined();
    expect(scores?.source_url).toBe('https://scores.gov.in');
  });

  it('routes recent financial loss to 1930 helpline, bank, and cybercrime portal', () => {
    const result = routeAuthorities({
      situation: 'money_lost_recent',
      moneySent: true,
      hoursElapsed: 4,
    });

    expect(result.status).toBe('ROUTED');
    expect(result.authorityIds).toContain('national_cyber_helpline');
    expect(result.authorityIds).toContain('user_bank');
    expect(result.authorityIds).toContain('cybercrime_portal');
    expect(result.routes[0].isEmergency).toBe(true);
  });

  it('routes securities and unregistered advisory claims to SEBI SCORES and RBI Sachet', () => {
    const result = routeAuthorities({
      category: 'UNREGISTERED_ADVISORY',
      archetype: 'UNREGISTERED_ADVISORY',
    });

    expect(result.status).toBe('ROUTED');
    expect(result.authorityIds).toContain('sebi_scores');
    expect(result.authorityIds).toContain('rbi_sachet');
    expect(result.authorityIds).not.toContain('national_cyber_helpline');
  });

  it('routes deposit schemes and Ponzi patterns to RBI Sachet', () => {
    const result = routeAuthorities({
      category: 'DEPOSIT_SCHEME',
      archetype: 'PONZI_PYRAMID',
    });

    expect(result.status).toBe('ROUTED');
    expect(result.authorityIds).toContain('rbi_sachet');
  });

  it('routes messaging/social media fraud to DoT Chakshu', () => {
    const result = routeAuthorities({
      situation: 'social_media_fraud',
      platform: 'WhatsApp',
    });

    expect(result.status).toBe('ROUTED');
    expect(result.authorityIds).toContain('telecom_fraud_reporting');
  });

  it('routes remote access compromise to user bank and national cyber helpline', () => {
    const result = routeAuthorities({
      remoteAccessGranted: true,
      otpShared: true,
    });

    expect(result.status).toBe('ROUTED');
    expect(result.authorityIds).toContain('national_cyber_helpline');
    expect(result.authorityIds).toContain('user_bank');
  });

  it('returns NO_MATCH when no recognized situation, category, or platform is provided', () => {
    const result = routeAuthorities({});
    expect(result.status).toBe('NO_MATCH');
    expect(result.authorityIds).toHaveLength(0);
  });

  it('only routes verified project authorities without fabricated external URLs', () => {
    const result = routeAuthorities({
      situation: 'money_lost_recent',
    });

    for (const route of result.routes) {
      if (route.source_url) {
        expect(route.source_url).toMatch(/^https:\/\/(cybercrime\.gov\.in|scores\.gov\.in|sachet\.rbi\.org\.in|sancharsaathi\.gov\.in)/);
      }
    }
  });
});
