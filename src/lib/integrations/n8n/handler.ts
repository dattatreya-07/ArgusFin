import { Lang } from '@/lib/types';
import { maskPII } from '@/lib/mask';
import { extractEvidenceFromImage } from '@/lib/ocr/extract';
import { analyzeScam } from '@/lib/scam/analyze';
import { CanonicalInput, CanonicalSource } from '@/lib/scam/types';
import { formatChannelResponse } from '@/lib/channels/formatters';
import { normalizeChannelInput } from '@/lib/channels/normalize';
import { checkChannelContent } from '@/lib/channels/service';
import { generateRequestId, logAppEvent } from '@/lib/observability';
import {
  N8nIntegrationRequest,
  N8nIntegrationResponse,
  IntegrationErrorCode,
} from './types';
import { buildIdempotencyKey, getCachedResponse, setCachedResponse } from './idempotency';

const MAX_TEXT_LENGTH = 15000;
const MAX_MEDIA_BASE64_LENGTH = 7 * 1024 * 1024; // ~5MB raw binary
const SUPPORTED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const SUPPORTED_LOCALES: Lang[] = ['en', 'hi', 'ta'];

export class IntegrationValidationError extends Error {
  code: IntegrationErrorCode;
  statusCode: number;

  constructor(code: IntegrationErrorCode, message: string, statusCode = 400) {
    super(message);
    this.name = 'IntegrationValidationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function validateN8nRequest(payload: any): N8nIntegrationRequest {
  if (!payload || typeof payload !== 'object') {
    throw new IntegrationValidationError('INVALID_REQUEST', 'Request body must be a valid JSON object.', 400);
  }

  // 1. Channel validation
  const rawChannel = String(payload.channel || '').toUpperCase();
  if (rawChannel !== 'TELEGRAM' && rawChannel !== 'WHATSAPP') {
    throw new IntegrationValidationError(
      'UNSUPPORTED_CHANNEL',
      `Channel "${payload.channel}" is not supported. Supported channels: TELEGRAM, WHATSAPP.`,
      400
    );
  }

  // 2. Message structure validation
  const msg = payload.message;
  if (!msg || typeof msg !== 'object') {
    throw new IntegrationValidationError('INVALID_REQUEST', 'Request must contain a valid "message" object.', 400);
  }

  if (!msg.id || typeof msg.id !== 'string' || !msg.id.trim()) {
    throw new IntegrationValidationError('INVALID_REQUEST', 'Field "message.id" is required.', 400);
  }

  // 3. Text & Caption size bounds check
  const text = msg.text || '';
  const caption = msg.caption || '';
  if (text.length > MAX_TEXT_LENGTH || caption.length > MAX_TEXT_LENGTH) {
    throw new IntegrationValidationError(
      'OVERSIZED_INPUT',
      `Message text or caption exceeds maximum limit of ${MAX_TEXT_LENGTH} characters.`,
      413
    );
  }

  // 4. Media attachments validation
  if (msg.media && Array.isArray(msg.media)) {
    for (const item of msg.media) {
      if (item.mimeType && !SUPPORTED_IMAGE_MIMES.includes(item.mimeType.toLowerCase())) {
        throw new IntegrationValidationError(
          'UNSUPPORTED_MEDIA',
          `Media mimeType "${item.mimeType}" is not supported. Supported image types: ${SUPPORTED_IMAGE_MIMES.join(', ')}.`,
          415
        );
      }
      if (item.data && typeof item.data === 'string' && item.data.length > MAX_MEDIA_BASE64_LENGTH) {
        throw new IntegrationValidationError(
          'OVERSIZED_INPUT',
          'Media attachment size exceeds maximum allowed size (~5MB).',
          413
        );
      }
    }
  }

  // 5. Locale validation
  let locale: Lang = 'en';
  if (payload.locale && typeof payload.locale === 'string') {
    const cleanLoc = payload.locale.toLowerCase().trim() as Lang;
    if (SUPPORTED_LOCALES.includes(cleanLoc)) {
      locale = cleanLoc;
    }
  }

  return {
    channel: rawChannel as 'TELEGRAM' | 'WHATSAPP',
    message: {
      id: msg.id.trim(),
      text: text.trim() || undefined,
      caption: caption.trim() || undefined,
      media: msg.media,
    },
    locale,
    provenance: payload.provenance,
  };
}

export function getDefaultBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && !envUrl.includes('sangyan.in')) {
    return envUrl.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }
  return 'https://argusfin.vercel.app';
}

export async function processN8nAnalysis(
  req: N8nIntegrationRequest,
  requestId: string = generateRequestId(),
  baseUrl?: string
): Promise<N8nIntegrationResponse> {
  const effectiveBaseUrl = baseUrl && !baseUrl.includes('sangyan.in') ? baseUrl.replace(/\/$/, '') : getDefaultBaseUrl();
  // Idempotency check
  const idempotencyKey = buildIdempotencyKey(req.channel, req.message.id);
  const cached = getCachedResponse(idempotencyKey);
  if (cached) {
    logAppEvent({
      name: 'request_completed',
      requestId,
      subsystem: 'n8n_integration',
      status: 'success',
      errorCode: undefined,
    });
    return cached;
  }

  let aggregatedRawTextParts: string[] = [];

  if (req.message.caption) {
    aggregatedRawTextParts.push(req.message.caption);
  }
  if (req.message.text) {
    aggregatedRawTextParts.push(req.message.text);
  }

  // Handle OCR media processing if present
  let ocrExtractedUrls: string[] = [];
  if (req.message.media && req.message.media.length > 0) {
    for (const item of req.message.media) {
      if (item.data) {
        try {
          const buffer = Buffer.from(item.data, 'base64');
          const { validation, evidence } = await extractEvidenceFromImage(buffer, {
            filename: item.filename || 'n8n-attachment.jpg',
            mimeType: item.mimeType || 'image/jpeg',
          });

          if (validation.valid && evidence) {
            if (evidence.ocrText) {
              aggregatedRawTextParts.push(`[OCR Evidence]: ${evidence.ocrText}`);
            }
            if (evidence.extractedUrls && evidence.extractedUrls.length > 0) {
              ocrExtractedUrls.push(...evidence.extractedUrls);
            }
          }
        } catch {
          // Graceful fallback on malformed image buffer
        }
      }
    }
  }

  const rawCombinedText = aggregatedRawTextParts.join('\n\n').trim();
  if (!rawCombinedText) {
    throw new IntegrationValidationError(
      'INVALID_REQUEST',
      'Message must contain non-empty text, caption, or readable OCR image media.',
      400
    );
  }

  // Privacy Masking Gate
  const piiMaskResult = maskPII(rawCombinedText);
  const maskedText = piiMaskResult.masked;

  // Channel Normalization
  const normalizedChannel = req.channel.toLowerCase() as 'telegram' | 'whatsapp';
  const normalizedMsg = normalizeChannelInput({
    channel: normalizedChannel,
    text: maskedText,
    language: req.locale,
  });

  // Execute canonical analysis via shared service
  const canonicalSource: CanonicalSource = req.channel === 'TELEGRAM' ? 'TELEGRAM' : 'WHATSAPP';
  const canonicalInput: CanonicalInput = {
    source: canonicalSource,
    language: normalizedMsg.language,
    text: normalizedMsg.normalizedText,
    urls: Array.from(new Set([...normalizedMsg.urls, ...ocrExtractedUrls])),
    privacyStatus: 'MASKED',
    provenance: {
      timestamp: req.provenance?.timestamp || new Date().toISOString(),
      senderId: req.provenance?.senderId,
      channelId: req.provenance?.channelId,
    },
  };

  const analysisResult = await analyzeScam(canonicalInput);

  // Format channel-ready markdown presentation response
  const channelCheckResult = await checkChannelContent(normalizedMsg);
  const formattedChannelResp = formatChannelResponse(channelCheckResult, effectiveBaseUrl);

  const responseDTO: N8nIntegrationResponse = {
    status: 'SUCCESS',
    decision: {
      band: analysisResult.decision.band,
      archetype: analysisResult.decision.archetype,
      confidence: analysisResult.decision.confidence,
    },
    summary: analysisResult.explanation.summary,
    signals: analysisResult.flags.map((f) => f.ruleId),
    unverified: analysisResult.explanation.whatCouldNotBeVerified,
    nextSteps: analysisResult.explanation.nextSteps.map((s) => ({
      id: s.id,
      label: s.label,
      url: s.url.startsWith('http') ? s.url : `${effectiveBaseUrl}${s.url}`,
    })),
    citations: analysisResult.explanation.citations,
    formattedMessage: formattedChannelResp.formattedMarkdown,
    locale: normalizedMsg.language,
    requestId,
    timestamp: new Date().toISOString(),
  };

  // Cache response safely for idempotency
  setCachedResponse(idempotencyKey, responseDTO);

  return responseDTO;
}
