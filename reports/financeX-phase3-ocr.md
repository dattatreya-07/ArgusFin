# Workstream B: Multilingual OCR Technical Report

## 1. Architecture & Pipeline

The FinanceX OCR pipeline (`src/lib/ocr/`) replaces monolithic text extraction with a robust multi-stage architecture:

```
INPUT IMAGE (Base64 Data URL / File)
   ↓
1. Validation Gate (MIME verification, max size bounds ~5MB)
   ↓
2. Canvas Image Preprocessing (Grayscale conversion, luminance S-curve contrast enhancement, thresholding)
   ↓
3. Script Detection & Language Selection (Unicode block matching: Latin, Tamil, Devanagari, Malayalam)
   ↓
4. Multi-Language OCR Execution (Tesseract v5 multi-script traineddata: eng, tam+eng, hin+eng, mal+eng)
   ↓
5. Confidence & Quality Guard (flags confidence <60%, emits low-confidence warnings)
   ↓
6. Privacy & PII Scrubbing (On-device PII masking via maskPII())
   ↓
7. Editable Text UI (allows user to verify/edit text before triggering Shield scan)
```

---

## 2. OCR Language Support Matrix

| Script / Language | Traineddata Code | Combined Mode | Script Unicode Range |
|---|---|---|---|
| **English (Latin)** | `eng` | `eng` | `U+0000`–`U+007F` |
| **Tamil** | `tam` | `tam+eng` | `U+0B80`–`U+0BFF` |
| **Hindi (Devanagari)** | `hin` | `hin+eng` | `U+0900`–`U+097F` |
| **Malayalam** | `mal` | `mal+eng` | `U+0D00`–`U+0D7F` |

---

## 3. Privacy & Safety Invariants

1. **Client-Side Text Scrubbing:** Raw OCR output is processed through `maskPII()` before sending to any server analysis endpoint.
2. **Confidence Warnings:** Low confidence extractions explicitly notify the user: *"Some text could not be read reliably. Please verify the extracted message."*
3. **No Phantom Extractions:** Empty or non-text images produce structured low-confidence results without fabricating scam signals.
