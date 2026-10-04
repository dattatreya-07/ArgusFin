# CORE-01B Implementation Report: Canonical Scam Analysis Contract & Unified Engine

**Project**: SANGYAN / ArgusFin (Investor Resilience Infrastructure)  
**Task**: CORE-01B Canonical Scam Analysis Contract & Engine  
**Date**: October 3, 2026  

---

## 1. Summary of Architectural Implementation

In accordance with **TASK CORE-01B**, a unified canonical analysis pipeline (`analyzeScam()`) was introduced to unify scam detection across all present and future input channels (Web Text, OCR, STT Voice, Telegram Bot, WhatsApp, Email).

---

## 2. Capability Reuse, Adaptation & Wrapping Matrix

| Module | Location | Action Taken | Rationale & Details |
|---|---|---|---|
| **Privacy Masking** | `src/lib/mask.ts`, `src/lib/scam/privacy.ts` | **REUSED** | Reused existing zero-knowledge regex masker for phone, email, UPI, bank acc, and OTP masking. |
| **Claim Extraction** | `src/lib/extract.ts` | **REUSED** | Reused numerical, duration, urgency, and request claim extractor. |
| **Rules Engine** | `src/lib/rules.ts` | **REUSED** | Reused all registered rule evaluators across English, Hindi, and Tamil. |
| **Decision Fusion Engine** | `src/lib/fuse.ts`, `src/lib/decision` | **REUSED** | Reused decision fusion matrix combining rule severity with Jev / rules-only decision probabilities. |
| **RAG Retrieval** | `src/lib/rag/index.ts` | **REUSED** | Reused `askRag()` grounding and citation validator against local regulatory knowledge corpus (`data/kb/*.md`). |
| **Telegram Channel Webhook** | `src/lib/channels/service.ts`, `src/app/api/channels/telegram/route.ts` | **ADAPTED** | Adapted channel check service to pass Telegram update payloads through `analyzeScam()`. |
| **Web API Endpoint** | `src/app/api/check/route.ts` | **ADAPTED** | Refactored `/api/check` to delegate to `analyzeScam()` while maintaining 100% backward contract compatibility. |
| **Canonical Analysis Engine** | `src/lib/scam/analyze.ts` | **NEWLY CREATED** | Single canonical orchestrator exposing `analyzeScam(input: CanonicalInput): Promise<AnalysisResult>`. |
| **Canonical Normalizer** | `src/lib/scam/normalize.ts` | **NEWLY CREATED** | Whitespace, URL extraction, language detection, and numeric preservation module. |
| **Canonical Data Contracts** | `src/lib/scam/types.ts` | **NEWLY CREATED** | Shared TypeScript interfaces (`CanonicalInput`, `AnalysisResult`, `AnalysisStatuses`). |
| **Channel Adapter Base Interface** | `src/lib/channels/types.ts` | **NEWLY CREATED** | Standardized `ChannelAdapter` contract for multi-channel input validation & transformation. |

---

## 3. Resolution of P0 Blockers

- **P0-1 (Unified Contracts)**: RESOLVED via `src/lib/scam/types.ts`.
- **P0-2 (Strict PII Enforcer)**: RESOLVED via `src/lib/scam/privacy.ts` (Mandatory pre-LLM & pre-RAG privacy gate).
- **P0-3 (Lookalike & URL Security)**: RESOLVED via `normalizeCanonicalInput` in `src/lib/scam/normalize.ts`.

---

## 4. Channel Integration Status

| Channel | Input Type | Integration Status | Pipeline Path |
|---|---|---|---|
| **Web Text** | Pasted string / form | **ACTIVE** | `/api/check` -> `analyzeScam()` |
| **OCR Image Upload** | Screenshot file | **ACTIVE** | `Tesseract.js` -> `analyzeScam()` |
| **Voice / Speech (STT)** | Audio transcript | **ACTIVE** | `WebSpeech API` -> `analyzeScam()` |
| **Telegram Bot** | Webhook message | **ACTIVE** | `/api/channels/telegram` -> `analyzeScam()` |
| **WhatsApp Sandbox** | Webhook message | **NOT_CONFIGURED** | Returns controlled 503 fallback when tokens omitted |
| **Email Ingestion** | Email payload | **FUTURE_ADAPTER** | `ChannelAdapter` contract ready |

---

## 5. Privacy & Security Validation

1. **Zero Raw PII Leakage**: Raw phone numbers, email addresses, UPI IDs, bank accounts, and OTPs are scrubbed on-device / at edge before reaching RAG or LLM calls.
2. **Prompt Injection Hardening**: User input in OCR or message text is passed strictly as data, never as system instructions.
3. **No Financial Advice Guarantee**: System never outputs stock recommendations, buy/sell/hold signals, or "safe" guarantees.

---

## 6. Recommended Scope for CORE-01C

1. **WhatsApp Business Production Credentials**: Activate WhatsApp adapter once official Meta tokens are provided.
2. **Email Adapter Endpoint**: Build `/api/channels/email` for handling incoming email headers and body text.
3. **Expanded Tamil Lexicons**: Add additional regional financial scam terminology for Southern Tamil Nadu copy-trading scams.
