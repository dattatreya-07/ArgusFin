import { EvidenceType, FileValidationResult } from './types';

const ALLOWED_MIME_TYPES: Record<EvidenceType, string[]> = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
  PDF: ['application/pdf'],
  AUDIO: ['audio/webm', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/x-m4a'],
  TEXT: ['text/plain'],
};

const MAX_FILE_SIZES: Record<EvidenceType, number> = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  PDF: 10 * 1024 * 1024, // 10MB
  AUDIO: 10 * 1024 * 1024, // 10MB
  TEXT: 1 * 1024 * 1024, // 1MB
};

const DANGEROUS_EXTENSIONS = [
  '.svg',
  '.exe',
  '.sh',
  '.bat',
  '.cmd',
  '.js',
  '.ts',
  '.html',
  '.htm',
  '.apk',
  '.php',
  '.py',
  '.jar',
  '.vbs',
  '.ps1',
];

/**
 * Validates uploaded evidence file against size, MIME type, and security policies.
 */
export function validateEvidenceFile(
  type: EvidenceType,
  mimeType: string,
  sizeBytes: number,
  filename?: string
): FileValidationResult {
  // 1. Check size limit
  if (sizeBytes <= 0) {
    return {
      valid: false,
      error: {
        code: 'MALFORMED_PAYLOAD',
        message: 'File is empty (0 bytes).',
      },
    };
  }

  const maxSize = MAX_FILE_SIZES[type] || 5 * 1024 * 1024;
  if (sizeBytes > maxSize) {
    return {
      valid: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `File exceeds maximum allowed size of ${(maxSize / (1024 * 1024)).toFixed(0)}MB.`,
      },
    };
  }

  // 2. Reject SVG and executable extensions
  if (filename) {
    const lowerName = filename.toLowerCase();
    for (const ext of DANGEROUS_EXTENSIONS) {
      if (lowerName.endsWith(ext)) {
        return {
          valid: false,
          error: {
            code: 'SECURITY_RISK',
            message: `File extension '${ext}' is not permitted for security reasons.`,
          },
        };
      }
    }
  }

  // 3. Reject SVG MIME
  if (mimeType.toLowerCase().includes('svg') || mimeType.toLowerCase().includes('html') || mimeType.toLowerCase().includes('javascript')) {
    return {
      valid: false,
      error: {
        code: 'SECURITY_RISK',
        message: 'SVG, HTML, or Script payloads are prohibited.',
      },
    };
  }

  // 4. Check allowed MIME types
  const allowed = ALLOWED_MIME_TYPES[type] || [];
  const normalizedMime = mimeType.toLowerCase().split(';')[0].trim();

  if (!allowed.includes(normalizedMime)) {
    return {
      valid: false,
      error: {
        code: 'UNSUPPORTED_FORMAT',
        message: `MIME type '${mimeType}' is not supported for ${type} evidence. Supported: ${allowed.join(', ')}.`,
      },
    };
  }

  return { valid: true };
}
