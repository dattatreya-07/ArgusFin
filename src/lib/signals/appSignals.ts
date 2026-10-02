import { Signal } from './types';

const REMOTE_ACCESS_APPS = [
  'anydesk',
  'teamviewer',
  'rustdesk',
  'quicksupport',
  'ultraviewer',
  'airdroid',
  'zoho assist',
];

const APK_PATTERNS = [
  /\b[\w-]+\.apk\b/i,
  /\bapk\s+(download|install|link|file)\b/i,
  /\bdownload\s+(the\s+)?(app|apk)\b/i,
  /\b(install|sideload)\s+app\b/i,
  /ऐप\s+डाउनलोड/i,
  /एपीके/i,
  /செயலியை\s+பதிவிறக்க/i,
];

export function extractAppSignals(text: string): Signal[] {
  if (!text || typeof text !== 'string') return [];
  const lower = text.toLowerCase();
  const signals: Signal[] = [];

  // Check for remote access applications
  for (const app of REMOTE_ACCESS_APPS) {
    if (lower.includes(app)) {
      signals.push({
        id: `sig-app-remote-${app.replace(/\s+/g, '-')}`,
        label: 'Remote Access App Mentioned',
        value: app,
        status: 'verified',
        confidence: 0.95,
        details: {
          appType: 'remote_access',
          riskNote: 'Scammers frequently instruct victims to install remote access tools to seize device control or monitor OTPs.',
        },
      });
    }
  }

  // Check for APK / App Sideloading
  for (const pattern of APK_PATTERNS) {
    if (pattern.test(text)) {
      signals.push({
        id: 'sig-app-apk-download',
        label: 'Direct APK / App Installation Request',
        value: 'APK or external app download prompt detected',
        status: 'verified',
        confidence: 0.9,
        details: {
          appType: 'sideloading',
          riskNote: 'Installing apps from untrusted links or direct APKs bypasses app store security checks.',
        },
      });
      break;
    }
  }

  return signals;
}
