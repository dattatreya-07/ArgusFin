import { CanonicalSource, PrivacyStatus } from '../scam/types';

export type EmailProvenanceType =
  | 'EMAIL_SUBJECT'
  | 'EMAIL_SENDER'
  | 'EMAIL_REPLY_TO'
  | 'EMAIL_BODY_TEXT'
  | 'EMAIL_BODY_HTML'
  | 'EMAIL_HEADER'
  | 'EMAIL_URL'
  | 'EMAIL_ATTACHMENT'
  | 'EMAIL_ATTACHMENT_TEXT'
  | 'EMAIL_IMAGE'
  | 'EMAIL_OCR'
  | 'EMAIL_QR';

export type EmailAuthStatus = 'PASS' | 'FAIL' | 'NONE' | 'UNKNOWN';

export interface EmailAuthResults {
  spf?: EmailAuthStatus;
  dkim?: EmailAuthStatus;
  dmarc?: EmailAuthStatus;
  rawHeader?: string;
}

export interface EmailAttachment {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  contentBase64?: string;
  contentBuffer?: Buffer;
  untrustedContent: true;
}

export interface EmailLink {
  visibleText: string;
  href: string;
  isMismatch: boolean;
}

export interface ParsedEmail {
  id: string;
  subject: string;
  sender: {
    displayName?: string;
    address: string;
    raw: string;
  };
  replyTo?: {
    displayName?: string;
    address: string;
    raw: string;
  };
  recipients: string[];
  plainText: string;
  htmlText: string;
  extractedText: string;
  headers: Record<string, string>;
  authResults: EmailAuthResults;
  links: EmailLink[];
  urls: string[];
  attachments: EmailAttachment[];
  senderMismatch: boolean;
  replyToMismatch: boolean;
  privacyStatus: PrivacyStatus;
}
