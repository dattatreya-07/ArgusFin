# CORE-01K — n8n Integration Architecture & Canonical Boundary Report

**Project**: SANGYAN / FinanceX: Investor Resilience  
**Task**: CORE-01K Remove Obsolete Direct Provider Transports & Establish Secure Canonical n8n API Boundary  
**Date**: October 4, 2026  
**Status**: IMPLEMENTED & VERIFIED PASS

---

## 1. Architectural Transformation & Decision Log

Prior to CORE-01K, SANGYAN contained direct webhook endpoints and transport adapter code for Telegram (`/api/channels/telegram`) and Meta WhatsApp Cloud API (`/api/channels/whatsapp`).

Under the **CORE-01K final architecture**:
- **n8n** is established as the **Channel Integration & Orchestration Layer**. It handles Telegram Bot API webhooks, WhatsApp Business Cloud API webhooks, provider credentials, event deduplication, retry policies, and outbound chat message formatting.
- **SANGYAN** remains the **Analysis Engine & Intelligence Authority**. SANGYAN provides a single secure, provider-neutral API boundary (`POST /api/integrations/n8n/analyze`) that accepts canonical integration payloads, executes PII scrubbing, runs OCR, evaluates deterministic rules, retrieves grounded RAG context, and returns a presentation-safe `N8nIntegrationResponse`.

```
Telegram User / WhatsApp User
            │
            ▼
┌──────────────────────────────┐
│     n8n Workflow Layer       │  ◄── Provider Credentials (Bot Tokens, Cloud API)
│  (Trigger, Extract, Format)  │
└──────────────┬───────────────┘
               │
               │ HTTP POST /api/integrations/n8n/analyze
               │ (x-n8n-secret: <N8N_INTEGRATION_SECRET>)
               ▼
┌──────────────────────────────┐
│    SANGYAN Integration API   │  ◄── Validation, Authentication & Idempotency
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       analyzeScam()          │  ◄── Canonical Scam Engine Authority
└──────────────┬───────────────┘
               │
   ┌───────────┴───────────┐
   ▼                       ▼
Deterministic        Grounded RAG /
  Rules & OCR        URL Intelligence
```

---

## 2. Inventory of Removed & Retained Components

### 2.1 Removed Components (`REMOVE_PROVIDER_TRANSPORT` & `REMOVE_SCREEN_RECORDING_ANALYSIS`)
- `src/components/ScreenRecordCaseStudy.tsx`: Removed obsolete screen recording analysis component.
- `public/assets/error.mp4`: Removed 5.8MB video asset used by screen recording case study.
- `src/app/api/channels/telegram/route.ts`: Removed obsolete direct Telegram webhook endpoint.
- `src/app/api/channels/telegram/webhook/route.ts`: Removed redundant Telegram webhook route.
- `src/app/api/channels/whatsapp/route.ts`: Removed obsolete direct Meta WhatsApp Cloud API webhook endpoint.
- `src/lib/channels/telegram.ts`: Removed direct Telegram Bot API HTTP sender (`sendTelegramMessage`), Telegram File API photo fetcher (`processTelegramPhoto`), and webhook verification.
- `src/lib/channels/whatsapp.ts`: Removed direct Meta Cloud API HTTP sender (`sendWhatsAppMessage`), Meta Graph API media fetcher (`processWhatsAppImage`), and HMAC-SHA256 signature verification.

### 2.2 Retained & Core Capabilities (`KEEP_CORE`)
- `analyzeScam()` (`src/lib/scam/analyze.ts`): Sole authoritative scam detection entry point.
- Canonical Types (`src/lib/channels/types.ts`, `src/lib/scam/types.ts`): Canonical channels, input types, and analysis result schemas.
- Text Normalization & Forwarded Stripping (`src/lib/channels/normalize.ts`): Strips forwarded message banners across English, Hindi, and Tamil.
- Privacy Boundary (`src/lib/mask.ts`): Zero-knowledge client/edge PII masking for phone numbers, UPI IDs, emails, bank accounts, and OTPs.
- Grounded RAG Corpus (`src/lib/rag/`): TF-IDF vector & lexical retrieval over verified SEBI/RBI alerts.
- OCR & QR Pipeline (`src/lib/ocr/extract.ts`): Tesseract.js text and QR code extraction.
- URL Intelligence (`src/lib/scam/url/`): Punycode, homoglyph, lookalike domain matching, and SSRF boundary protection.

---

## 3. Canonical n8n Integration API Specification

### 3.1 Endpoint Details
- **Route**: `POST /api/integrations/n8n/analyze` (Diagnostic probe: `GET /api/integrations/n8n/analyze`)
- **Authentication**: `x-n8n-secret: <N8N_INTEGRATION_SECRET>` OR `Authorization: Bearer <N8N_INTEGRATION_SECRET>`
- **Constant-Time Verification**: `crypto.timingSafeEqual` prevents timing side-channel attacks.

### 3.2 Request Schema
```typescript
export interface N8nIntegrationRequest {
  channel: 'TELEGRAM' | 'WHATSAPP';
  message: {
    id: string; // Required message/event identifier for idempotency
    text?: string;
    caption?: string;
    media?: Array<{
      type?: 'image' | 'audio' | 'document';
      mimeType?: string;
      data?: string; // Base64 encoded image string
      filename?: string;
    }>;
  };
  locale?: 'en' | 'hi' | 'ta';
  provenance?: {
    senderId?: string;
    timestamp?: string;
    channelId?: string;
  };
}
```

### 3.3 Response DTO Schema
```typescript
export interface N8nIntegrationResponse {
  status: 'SUCCESS';
  decision: {
    band: 'HIGH' | 'MEDIUM' | 'LOW_SIGNALS' | 'CANNOT_VERIFY';
    archetype: {
      top: Archetype;
      prob: number;
    };
    confidence: number;
  };
  summary: string;
  signals: string[];
  unverified: string[];
  nextSteps: Array<{ id: string; label: string; url: string }>;
  citations: Array<{ title: string; sourceUrl: string; publisher?: string }>;
  formattedMessage: string;
  locale: 'en' | 'hi' | 'ta';
  requestId: string;
  timestamp: string;
}
```

### 3.4 Error Codes & Boundaries
- `UNAUTHORIZED` (401): Missing or invalid n8n secret token.
- `INVALID_REQUEST` (400): Malformed JSON, missing message object, or missing `message.id`.
- `UNSUPPORTED_CHANNEL` (400): Channel is not `TELEGRAM` or `WHATSAPP`.
- `OVERSIZED_INPUT` (413): Text >15,000 characters or media base64 >5MB.
- `UNSUPPORTED_MEDIA` (415): Media MIME type not in supported list (`image/jpeg`, `image/png`, `image/webp`).
- `RATE_LIMITED` (429): Exceeds 60 req/min limit.
- `INTERNAL_ERROR` (500): Server error without exposing internal stack trace.

---

## 4. Idempotency & Privacy Strategy

- **Idempotency**: Requests are cached in an in-memory sliding cache keyed on `${channel}:${messageId}` with a 10-minute TTL (max 1000 items). Retried requests receive the cached presentation-safe response DTO directly without re-executing OCR or LLM calls.
- **Privacy Boundary**: Raw user input is passed through `maskPII()` before downstream RAG, rule evaluation, or LLM explanation. Zero raw PII, phone numbers, UPI IDs, or raw message text are stored in the server process or returned to n8n.

---

## 5. Media & OCR Handling

- When n8n receives a Telegram photo or WhatsApp image, n8n sends the Base64 image payload in `message.media[].data`.
- SANGYAN decodes the buffer in memory, executes Tesseract.js OCR and QR code parsing (`extractEvidenceFromImage`), appends extracted text to the claims pipeline, and runs `analyzeScam()`.
- SANGYAN does NOT fetch arbitrary user-provided image URLs over the public internet, preventing SSRF vulnerabilities.

---

## 6. Provider Credential Ownership

- **n8n** owns all Telegram bot tokens, Meta Cloud API access tokens, phone number IDs, and app secrets. Zero provider tokens exist in the SANGYAN application codebase.
- **SANGYAN** only requires the `N8N_INTEGRATION_SECRET` environment variable to authenticate trusted n8n orchestration calls.

---

## 7. Workflow Documentation & Export Templates Created

Under `docs/n8n/`:
- `docs/n8n/README.md`: Complete architectural guide, API reference, and deployment setup.
- `docs/n8n/telegram-sangyan-analysis.json`: Importable n8n workflow template for Telegram Bot integration.
- `docs/n8n/whatsapp-sangyan-analysis.json`: Importable n8n workflow template for WhatsApp Business Cloud API integration.

---

## 8. Empirical Verification Results

| Quality Gate / Test Suite | Result | Details |
|---|---|---|
| `npm test` | **PASS** (31/31 files) | 253 unit tests passing, including n8n validation, auth, and idempotency tests. |
| `npm run eval` | **PASS** (100.0%) | 30/30 frozen decision cases matching expected archetype and risk band. |
| `npm run eval:core` | **PASS** | 341 multi-dimensional dataset cases executed cleanly. |
| `npm run eval:telegram` | **PASS** (100.0%) | 15/15 Telegram cases parsed and analyzed with 100% Web parity. |
| `npm run eval:whatsapp` | **PASS** (100.0%) | 14/14 WhatsApp cases parsed and analyzed with 100% Web parity. |
| `npm run typecheck` | **PASS** (0 errors) | TypeScript compilation clean across whole workspace. |
| `npm run lint` | **PASS** (0 errors) | ESLint clean across all Next.js routes and lib components. |
| `npm run guardrails` | **PASS** (0 violations) | Static compliance scanner verified 199 files. |
| `npm run smoke` | **PASS** (17/17) | Production smoke test suite 100% clean. |
| `npm run build` | **PASS** | Next.js production build compiled cleanly (including `/api/integrations/n8n/analyze`). |

---

## 9. Integration Status Summary

- **Telegram Provider Transport**: REMOVED from SANGYAN codebase. n8n integration architecture IMPLEMENTED.
- **WhatsApp Provider Transport**: REMOVED from SANGYAN codebase. n8n integration architecture IMPLEMENTED.
- **Scam Screen Recording Analysis & Video**: REMOVED from SANGYAN codebase.
