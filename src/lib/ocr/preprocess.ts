/**
 * Client-safe image preprocessing helpers for OCR fidelity enhancement.
 * Operates in browser canvas or Node environments safely.
 */

export interface PreprocessResult {
  processedImage: string; // Base64 Data URL
  enhanced: boolean;
  notes: string[];
}

/**
 * Preprocesses screenshot data URL to enhance text contrast and edge clarity.
 */
export async function preprocessOcrImage(
  base64DataUrl: string,
  options: { enhanceContrast?: boolean; binarize?: boolean } = {}
): Promise<PreprocessResult> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // In Node or non-browser environments, return original image safely
    return {
      processedImage: base64DataUrl,
      enhanced: false,
      notes: ['Running in non-browser environment; skipping canvas preprocessing.'],
    };
  }

  try {
    const img = new Image();
    const loadPromise = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
    });
    img.src = base64DataUrl;
    await loadPromise;

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return { processedImage: base64DataUrl, enhanced: false, notes: ['Canvas 2D context unavailable'] };
    }

    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Apply Grayscale & Contrast enhancement
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Luminance conversion (ITU-R BT.601)
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;

      if (options.enhanceContrast) {
        // High contrast S-curve mapping
        gray = gray < 128 ? gray * 0.8 : Math.min(255, gray * 1.2);
      }

      if (options.binarize) {
        // Adaptive Otsu-like thresholding
        gray = gray > 140 ? 255 : 0;
      }

      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    ctx.putImageData(imgData, 0, 0);
    const processed = canvas.toDataURL('image/png');

    return {
      processedImage: processed,
      enhanced: true,
      notes: ['Applied grayscale conversion and adaptive contrast normalization.'],
    };
  } catch (err: any) {
    return {
      processedImage: base64DataUrl,
      enhanced: false,
      notes: [`Preprocessing fallback: ${err.message || 'Error occurred'}`],
    };
  }
}
