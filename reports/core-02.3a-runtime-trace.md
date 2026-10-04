# CORE-02.3A — Production API & UI Open-World Runtime Trace

## Executive Overview

This report documents the exact end-to-end execution paths across all four user-facing integration entry points in SANGYAN:
1. **Website Scam Check** (`/check` → `/api/check`)
2. **Website Educational / Content Ask** (`/ask` → `/api/ask`)
3. **n8n Messaging Integration** (n8n → `/api/integrations/n8n/analyze`)
4. **Screenshot / Image OCR Pipeline** (Upload → `/api/ocr`)

---

## 1. Production Execution Traces

### Path A: Website Check (`/check` → `/api/check`)

```
User (Browser)
  ↓ Enters text / clicks preset
Client-side PII Masking (maskPII in src/app/[locale]/check/page.tsx)
  ↓ POST /api/check { maskedText, lang }
API Route Handler (src/app/api/check/route.ts)
  ↓ Constructs CanonicalInput { source: 'WEB_TEXT', text: maskedText, language: lang, privacyStatus: 'MASKED' }
analyzeScam() Canonical Engine (src/lib/scam/analyze.ts)
  ↓ Extract Open-World Behavioral Analysis (src/lib/detector/openWorld.ts)
  ↓ Fuse Evidence & Signals (Compositional Engine: src/lib/detector/compositional.ts)
  ↓ Map Known Archetype (Optional; defaults to OTHER_SUSPICIOUS_FINANCIAL_PATTERN / UNKNOWN)
  ↓ Attach Optional Educational Grounding (askRag - stability guaranteed whether ON or OFF)
  ↓ Observe Anonymous Behavioral Fingerprint (src/lib/scam/patterns.ts)
Response JSON { band, archetype, confidence, flags, signals, explanation, citations, nextSteps }
  ↓ Rendered in Check UI (RiskGauge, BandBadge, Signals Grid, Action Steps)
```

- **JSON Dataset Dependency at Runtime**: ZERO. Input is evaluated dynamically via semantic event extraction.
- **RAG Dependency for Detection**: ZERO. Disabling RAG does not change `band` or `confidence`.

---

### Path B: Website Ask (`/ask` → `/api/ask`)

```
User (Browser)
  ↓ Enters prompt (e.g., "Someone sent me this message: ... Is it a scam?")
Client-side / API PII Masking (maskPII)
  ↓ POST /api/ask { query, lang }
API Route Handler (src/app/api/ask/route.ts)
  ↓ Classify Intent (classifyQueryIntent in src/lib/detector/intent.ts)
  ├── IF Intent === 'CONTENT_ANALYSIS':
  │     ↓ Invokes analyzeScam({ source: 'WEB_TEXT', text: sanitizedQuery, language: lang })
  │     ↓ Evaluates Open-World Behavioral Signals
  │     ↓ Returns JSON { intent: 'CONTENT_ANALYSIS', status: 'ANSWERED', answer, decision, flags }
  └── IF Intent === 'EDUCATIONAL_QA' | 'CALCULATOR_NUMERIC' | 'REPORTING':
        ↓ Invokes askRag(sanitizedQuery, lang)
        ↓ Returns Grounded Educational Answer with citations from data/authorities.json
```

- **Intent Routing Guarantee**: Whenever user content contains scam claims or requests risk analysis, intent classifier assigns `CONTENT_ANALYSIS`, routing execution directly into `analyzeScam()`.
- **RAG Dependency**: Educational QA uses RAG for verified citations; Content Analysis uses `analyzeScam()` and is detection-independent of RAG.

---

### Path C: n8n Messaging Integration (`/api/integrations/n8n/analyze`)

```
n8n Workflow (Telegram / WhatsApp Webhook)
  ↓ POST /api/integrations/n8n/analyze with Header `x-n8n-secret`
API Secret Verification & Rate Limiter (src/app/api/integrations/n8n/analyze/route.ts)
  ↓ validateN8nRequest() (src/lib/integrations/n8n/handler.ts)
processN8nAnalysis()
  ↓ Maps Telegram/WhatsApp message to CanonicalInput { source: 'TELEGRAM' | 'WHATSAPP', text }
analyzeScam() Canonical Engine (src/lib/scam/analyze.ts)
  ↓ Same Open-World Behavioral Analysis, Signal Fusion, & Privacy Protection
formatN8nResponseDTO()
  ↓ Converts AnalysisResult to Canonical N8n Analysis DTO
Response JSON { ok: true, data: { riskBand, archetype, score, summary, signals, actionables } }
  ↓ n8n formats markdown response back to Telegram / WhatsApp user
```

- **Decision Parity Guarantee**: Shares exact same `analyzeScam()` invocation as `/api/check`.

---

### Path D: Image / Screenshot OCR Pipeline (`/api/ocr`)

```
User / Integration
  ↓ Uploads PNG / JPEG screenshot or sends base64 payload
POST /api/ocr (src/app/api/ocr/route.ts)
  ↓ extractEvidenceFromImage() (src/lib/ocr/extract.ts)
  ├── Performs OCR text block extraction
  ├── Extracts embedded QR codes and URLs
  └── Constructs ImageEvidence object
analyzeImageScam() Adapter (src/lib/scam/adapters/image.ts)
  ↓ Maps ImageEvidence to CanonicalInput { source: 'IMAGE', text: aggregatedText, urls }
analyzeScam() Canonical Engine (src/lib/scam/analyze.ts)
  ↓ Processes OCR text + QR URLs in unified Open-World Analyzer
Returns JSON { requestId, validation, evidence, analysis: AnalysisResult }
```

- **Unified Brain Guarantee**: Image evidence is transformed into `CanonicalInput` and analyzed by the exact same open-world detection pipeline.

---

## 2. Verification Summary Table

| Path | Input Source | Entry API Route | Detection Engine Invoked | JSON Dataset Required? | Decision Parity Verified? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Web Check** | Text / Link | `POST /api/check` | `analyzeScam()` | **NO** | **YES** |
| **Web Ask** | Prompt | `POST /api/ask` | `analyzeScam()` (if CONTENT_ANALYSIS) | **NO** | **YES** |
| **n8n Integration**| Telegram / WhatsApp | `POST /api/integrations/n8n/analyze` | `analyzeScam()` | **NO** | **YES** |
| **Screenshot OCR**| PNG / JPEG / WEBP | `POST /api/ocr` | `analyzeScam()` via `analyzeImageScam()` | **NO** | **YES** |
