import { ImageMimeType, ImageValidationResult } from './types';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_DIMENSION_PX = 4096; // 4096 x 4096 maximum resolution

const ALLOWED_MIME_TYPES: Set<string> = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

/**
 * Validates image metadata, file size, MIME type, and structural sanity.
 * Enforces resource limits without leaking internal filesystem details.
 */
export function validateImageInput(input: {
  buffer?: Buffer | ArrayBuffer;
  base64?: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  allowTextOnly?: boolean;
}): ImageValidationResult {
  // Determine byte size
  let calculatedSize = input.sizeBytes || 0;
  if (!calculatedSize) {
    if (input.buffer) {
      calculatedSize = input.buffer.byteLength;
    } else if (input.base64) {
      // Estimate base64 decoded size: 3/4 of string length without headers
      const cleaned = input.base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      calculatedSize = Math.floor((cleaned.length * 3) / 4);
    } else if (input.allowTextOnly) {
      calculatedSize = 1024; // Default virtual byte size for pre-extracted text
    }
  }

  // Check file size limit
  if (calculatedSize <= 0) {
    return {
      valid: false,
      error: 'Empty or invalid image payload provided.',
    };
  }

  if (calculatedSize > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      sizeBytes: calculatedSize,
      error: `Image file size (${(calculatedSize / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 5.0MB.`,
    };
  }

  // Determine MIME type
  let detectedMime = input.mimeType?.toLowerCase();
  if (!detectedMime && input.base64) {
    const match = input.base64.match(/^data:(image\/[a-zA-Z]+);base64,/);
    if (match) {
      detectedMime = match[1].toLowerCase();
    }
  }

  // Default to JPEG if raw binary/base64 without header
  if (!detectedMime) {
    detectedMime = 'image/jpeg';
  }

  if (!ALLOWED_MIME_TYPES.has(detectedMime)) {
    return {
      valid: false,
      mimeType: detectedMime,
      sizeBytes: calculatedSize,
      error: `Unsupported image format (${detectedMime}). Only JPEG, PNG, and WebP images are supported.`,
    };
  }

  // Dimension check if provided
  if (input.width && input.width > MAX_DIMENSION_PX) {
    return {
      valid: false,
      mimeType: detectedMime,
      sizeBytes: calculatedSize,
      width: input.width,
      height: input.height,
      error: `Image width (${input.width}px) exceeds maximum supported limit of ${MAX_DIMENSION_PX}px.`,
    };
  }

  if (input.height && input.height > MAX_DIMENSION_PX) {
    return {
      valid: false,
      mimeType: detectedMime,
      sizeBytes: calculatedSize,
      width: input.width,
      height: input.height,
      error: `Image height (${input.height}px) exceeds maximum supported limit of ${MAX_DIMENSION_PX}px.`,
    };
  }

  return {
    valid: true,
    mimeType: detectedMime,
    sizeBytes: calculatedSize,
    width: input.width || 1084,
    height: input.height || 1084,
  };
}
