# CORE-01G — Telegram Production Hardening, Channel Parity & Operational Safety Report

## 1. Executive Summary
CORE-01G hardens the Telegram transport adapter for the SANGYAN / ArgusFin Investor Resilience Infrastructure. Telegram operates strictly as a **thin transport layer** over the single, authoritative canonical analysis engine (`analyzeScam()`).

---

## 2. Telegram Architecture & Pipeline Flow

```
TELEGRAM WEBHOOK PAYLOAD
       │
       ▼
┌──────────────────────────┐
│  Secret Header Check     │ ◄── x-telegram-bot-api-secret-token (Timing-Safe)
└──────────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│  Update Deduplication    │ ◄── Bounded Sliding LRU Cache (update_id, 10m TTL)
└──────────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Rate & Resource Limiting │ ◄── 15 req/min per Chat ID limit
└──────────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Media & Photo Download   │ ◄── Telegram File API → CORE-01F OCR/QR Pipeline
└──────────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Privacy Boundary (Mask)  │ ◄── maskPII (Phone, Email, UPI, OTP, Tokens)
└──────────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Canonical Engine         │ ◄── analyzeScam(source = 'TELEGRAM')
└──────────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Telegram Safe Response   │ ◄── Markdown v1 with Plaintext Fallback
└──────────────────────────┘
```

---

## 3. Strict Operational & Safety Boundary Rules

1. **No Duplicate Classifier**: Telegram has ZERO independent classification logic. All decisions delegate to `analyzeScam()`.
2. **No Separate RAG Engine**: Explanations and citations come strictly from CORE-01D grounded knowledge sources.
3. **No Financial Recommendations**: Commands like `/buy`, `/sell`, `/trade`, `/signals`, or `/picks` are strictly forbidden. Supported commands are `/start` and `/help`.
4. **No Auto-Navigation**: URLs extracted from Telegram messages, captions, photos, or QR codes are passed to CORE-01E URL intelligence with `untrustedExtraction = true`. No links are auto-opened or navigated.
5. **No Persistent User Profiling**: Server is 100% stateless with zero message storage or user contact database.

---

## 4. Webhook Authentication & Security
- **Header Token**: `x-telegram-bot-api-secret-token`
- **Timing-Safe Comparison**: Prevents timing side-channel attacks by comparing secrets in constant-time.
- **Environment Configuration**: `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET`.
- **Live Status Reporting**: Route GET `/api/channels/telegram` returns `CONFIGURED` or `NOT_CONFIGURED` without exposing secrets.

---

## 5. Evaluation & Parity Results

- **Dataset Path**: `data/datasets/telegram/cases.json` (15 synthetic update cases)
- **Live Configuration Status**: `NOT_CONFIGURED` (Deterministic evaluation mode)
- **Webhook Authentication Verification**: 100.0% PASS
- **Update Parsing Success**: 100.0% (15/15)
- **Channel Parity (Web vs Telegram)**: 100.0% (12/12)
- **Duplicate Update Suppression**: PASS
- **Prompt Injection Defense**: 100.0% PASS
- **PII Scrubbing Protection**: 100.0% PASS

---

## 6. Known Limitations
1. **Live Network Dependency**: Operational live message delivery requires active network connectivity to `api.telegram.org` and a valid `TELEGRAM_BOT_TOKEN`.
2. **Telegram Formatting Limits**: Telegram Markdown v1 requires strict escaping; markdown format errors automatically trigger plaintext fallback.
