# CORE-02.3 Image and Screenshot Open-World Analysis Report

## 1. Overview

Image and screenshot analysis in SANGYAN follows a single unified pipeline:

```
[IMAGE INPUT] (Upload, Telegram photo, WhatsApp image, OCR payload)
   │
   ▼
[Privacy Gate & Boundary Enforcement]
   │
   ▼
[Tesseract OCR Engine & Vision Feature Extraction] (`src/lib/ocr/extract.ts`)
   │
   ▼
[Extracted Text & Embedded URLs / QR Code Extraction]
   │
   ▼
[Canonical Input Construction] (`source: 'OCR'` or `'IMAGE'`)
   │
   ▼
[Open-World General Behavioral Analyzer] (`analyzeScam()`)
```

---

## 2. Technical Convergence Principle

Image payloads do **NOT** use a separate or disconnected scam classifier.

The extracted text, URLs, and QR code targets from images are normalized and passed into `analyzeOpenWorldBehavior()`.

This ensures that:
- Screenshots of bank impersonations
- Screenshots of courier customs tax SMS
- Screenshots of WhatsApp fake job offers
- Screenshots of QR payment requests
- Screenshots containing Hindi/Tamil/English mixed text

all receive the exact same compositional open-world behavioral risk analysis as direct text inputs.

---

## 3. OCR Uncertainty Safeguards

- If OCR text extraction yields low confidence or noisy UI artifacts without clear behavioral signals, the system assigns `CANNOT_VERIFY` or `LOW_SIGNALS` with explicit limitations (`"Image text quality was insufficient to verify sender claims"`).
- OCR processing redacts PII locally before any external or RAG call.
