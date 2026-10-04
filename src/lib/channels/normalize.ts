import { ChannelInput, NormalizedChannelMessage, ChannelType } from './types';
import { Lang } from '../types';

const FORWARDED_PATTERNS = [
  /^\[Forwarded from [^\]]+\]\s*/i,
  /^---------- Forwarded message ---------\s*/i,
  /^Forwarded message\s*:\s*/i,
  /^(?:Fwd|FWD|Fw|FW)\s*:\s*/i,
  /^Forwarded\s*\n+/i,
  /^மீட்டனுப்பப்பட்ட செய்தி\s*:\s*/i, // Tamil "Forwarded message"
  /^फारवर्ड किया गया संदेश\s*:\s*/i, // Hindi "Forwarded message"
];

const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`]+[^\s<>"'{}|\\^`.,;:?!]/gi;

/**
 * Deterministic language detection or fallback to English.
 */
function resolveLanguage(langStr?: string, text?: string): Lang {
  if (text) {
    // Priority 1: Direct script detection from message text
    if (/[\u0900-\u097F]/.test(text)) {
      return 'hi';
    }
    if (/[\u0B80-\u0BFF]/.test(text)) {
      return 'ta';
    }
  }

  if (langStr) {
    const clean = langStr.toLowerCase().trim();
    if (clean.startsWith('hi')) return 'hi';
    if (clean.startsWith('ta')) return 'ta';
    if (clean.startsWith('en')) return 'en';
  }

  return 'en';
}

/**
 * Normalizes raw input from various transport channels (PWA Share Target, Telegram, Web).
 * Preserves user-visible intent without altering semantic meaning.
 */
export function normalizeChannelInput(input: ChannelInput): NormalizedChannelMessage {
  const parts: string[] = [];

  if (input.title && input.title.trim().length > 0) {
    parts.push(input.title.trim());
  }

  if (input.text && input.text.trim().length > 0) {
    parts.push(input.text.trim());
  }

  if (input.url && input.url.trim().length > 0) {
    // Only append URL if not already contained in title or text
    const urlTrimmed = input.url.trim();
    const joinedSoFar = parts.join(' ');
    if (!joinedSoFar.includes(urlTrimmed)) {
      parts.push(urlTrimmed);
    }
  }

  const rawText = parts.join('\n').trim();

  // 1. Detect and strip forwarded message banners
  let workingText = rawText;
  let isForwarded = false;

  for (const pat of FORWARDED_PATTERNS) {
    if (pat.test(workingText)) {
      isForwarded = true;
      workingText = workingText.replace(pat, '');
    }
  }

  // 2. Normalize whitespace and newlines
  workingText = workingText
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 3. Extract all URLs
  const urlMatches = workingText.match(URL_REGEX) || [];
  const urls = Array.from(new Set(urlMatches));

  // 4. Resolve language
  const resolvedLang = resolveLanguage(input.language, workingText);

  return {
    channel: input.channel,
    rawText,
    normalizedText: workingText,
    title: input.title?.trim() || undefined,
    urls,
    language: resolvedLang,
    isForwarded,
    provenance: {
      source: input.channel,
      receivedAt: new Date().toISOString(),
    },
  };
}
