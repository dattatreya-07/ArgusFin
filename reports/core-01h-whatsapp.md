# CORE-01H — WhatsApp Business Adapter, Webhook Verification & Channel Parity Report

## 1. Executive Summary
CORE-01H implements the production-oriented WhatsApp Business Platform / Cloud API transport adapter for the SANGYAN / ArgusFin Investor Resilience Infrastructure. WhatsApp operates strictly as a **thin transport layer** over the single canonical analysis engine (`analyzeScam()`).

---

## 2. WhatsApp Architecture & Pipeline Flow

```
RAW WHATSAPP WEBHOOK POST / GET
       │
       ▼
┌──────────────────────────┐
│ Signature / GET Challenge│ ◄── GET hub.verify_token / POST x-hub-signature-256 (HMAC-SHA256)
└──────────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Event Deduplication      │ ◄── Bounded Sliding LRU Cache (wamid, 10m TTL)
└──────────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Rate & Resource Limiting │ ◄── 15 req/min per Sender Phone limit
└──────────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Media & Image Fetch      │ ◄── Meta Graph API → CORE-01F OCR/QR Pipeline
└──────────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Privacy Boundary (Mask)  │ ◄── maskPII (Phone, Email, UPI, OTP, Tokens)
└──────────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Canonical Engine         │ ◄── analyzeScam(source = 'WHATSAPP')
└──────────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ WhatsApp Outbound API    │ ◄── Meta Cloud API POST /v20.0/<phone_id>/messages
└──────────────────────────┘
```

---

## 3. Configuration & Live Status
- **Environment Variables**:
  - `WHATSAPP_VERIFY_TOKEN`
  - `WHATSAPP_ACCESS_TOKEN`
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `WHATSAPP_APP_SECRET`
- **Live State**: `NOT_CONFIGURED` (in development/eval environment where live credentials are not set).
- **Graceful Dormancy**: When unconfigured, routes return HTTP 503 `NOT_CONFIGURED` without faking operational integration or crashing.

---

## 4. Security & Webhook Protections
- **GET Verification**: Meta `hub.mode === 'subscribe'` and `hub.verify_token` verified using timing-safe comparison returning `hub.challenge`.
- **POST HMAC-SHA256 Signature Verification**: `x-hub-signature-256` header is validated over raw request body prior to JSON parsing using `crypto.timingSafeEqual`.
- **SSRF Boundary**: User content never causes arbitrary server-side fetches. Media retrieval only uses authenticated Meta Graph API.
- **Event Deduplication**: Message IDs (`wamid`) tracked in sliding cache to suppress duplicate delivery retries.

---

## 5. Evaluation & Parity Results

- **Dataset Path**: `data/datasets/whatsapp/cases.json` (14 synthetic webhook cases)
- **Live WhatsApp State**: `NOT_CONFIGURED` (Deterministic evaluation mode)
- **Webhook GET Challenge Verification**: 100.0% PASS
- **HMAC-SHA256 Signature Verification**: 100.0% PASS
- **Transport Parsing Success**: 100.0% (14/14)
- **Triple Channel Parity (Web = Telegram = WhatsApp)**: 100.0% (12/12)
- **Duplicate Event Suppression**: PASS
- **Prompt Injection Defense**: 100.0% PASS
- **PII Scrubbing Protection**: 100.0% PASS

---

## 6. Known Limitations
1. **Live Meta Verification Required**: Production live messaging requires official Meta Business Verification, registered Phone Number ID, and active Cloud API access token.
2. **Text & Image Media Support**: Supports text, captions, and JPEG/PNG images via OCR. Audio/voice notes prompt users to paste text or upload screenshots to web app.
