# CORE-01 Capability Inventory Report

**Project**: SANGYAN / ArgusFin (Investor Resilience Infrastructure)  
**Task**: CORE-01A Repository Audit & Capability Inventory  
**Date**: October 3, 2026  

---

## 1. Executive Summary

This capability inventory was conducted as part of **CORE-01A** to establish an empirical audit baseline before designing or implementing the CORE-01 unified scam detector engine. Every classification below is backed by source code line references, file existence, and test execution results within the workspace.

---

## 2. Core Functional Capabilities Inventory (F1 - F14 & System Modules)

| Capability Code | Description | Audit Classification | Primary Code Artifacts | Supporting Evidence & Notes |
|---|---|---|---|---|
| **F1** | Multilingual Scam Claim Analysis | **AVAILABLE** | `src/lib/detector/rules.ts`, `src/lib/detector/extract.ts`, `src/lib/detector/decision/engine.ts` | Multi-stage extraction (Rule + Deterministic + Fusion) handling English, Hindi, and Tamil text with confidence scoring. Tested by `tests/detector.test.ts`. |
| **F2** | Client-Side PII Masking | **AVAILABLE** | `src/lib/privacy/mask.ts` | Regex & pattern-based zero-knowledge privacy masking for phone numbers, email, UPI IDs, account numbers, and OTPs prior to any server or LLM call. |
| **F3** | OCR Screenshot Analysis | **AVAILABLE** | `src/lib/ocr/extract.ts`, `src/app/api/ocr/route.ts` | Tesseract.js client/server OCR pipeline extracting text and URLs from uploaded screenshot images. Tested via `tests/ocr.test.ts`. |
| **F4** | Voice / STT Audio Analysis | **AVAILABLE** | `src/components/VoiceInput.tsx`, `src/lib/voice/stt.ts` | Browser Web Speech API integration supporting live voice input & transcription in English, Hindi, and Tamil (`en-IN`, `hi-IN`, `ta-IN`). |
| **F5** | Financial Return Calculator & CAGR Breakdown | **AVAILABLE** | `src/app/calculator/page.tsx`, `src/components/calculator/ReturnCalculator.tsx` | CAGR lump-sum vs realistic benchmark calculator, volatility scenarios, market crash breakdown, compounding math. Tested in `tests/calculator.test.ts`. |
| **F6** | Authority Helplines & Verified Data Routing | **AVAILABLE** | `data/authorities.json`, `src/lib/data/authorities.ts`, `src/app/authorities/page.tsx` | Official SEBI, CyberCrime (1930), RBI, NSDL, NSE/BSE contacts with strict `verified_at` dates and fallback to official site links when unverified. |
| **F7** | Grounded Financial Knowledge (RAG) | **AVAILABLE** | `src/lib/rag/index.ts`, `src/lib/rag/retrieval.ts`, `data/kb/` | Micro RAG engine operating strictly over curated markdown corpus (`data/kb/*.md`) with vector/lexical retrieval, grounding citations, and `NO_SOURCE` fallback. |
| **F8** | Investor Risk Ladder & Archetype Mapping | **AVAILABLE** | `src/lib/detector/archetypes.ts`, `src/app/ladder/page.tsx` | Mapping detected signals into 10+ financial scam archetypes (e.g. Doubling Scheme, Copy Trading, Crypto Staking, Remote Access). |
| **F9** | Offline-First PWA & Web Share Target | **AVAILABLE** | `public/manifest.json`, `public/sw.js` | Web App Manifest registered with share_target POST endpoint (`/check?text=...`) for one-tap sharing from messaging apps on Android/PWA. |
| **F10** | Telegram Bot Channel Integration | **AVAILABLE** | `src/app/api/channels/telegram/route.ts` | Webhook endpoint handling `/start`, `/check`, and incoming text/photo messages with HMAC secret verification and rate limiting (15 req/min). |
| **F11** | WhatsApp Business API Channel Adapter | **NOT_CONFIGURED** | `src/app/api/channels/whatsapp/route.ts` | Complete webhook adapter structure, signature verification, and payload parser present. Gracefully returns HTTP 503 fallback when `WHATSAPP_TOKEN` environment variables are omitted. Zero fake claims. |
| **F12** | Direct Email Channel Import / Parsing | **NOT_IMPLEMENTED** | N/A | No email ingestion router (`/api/channels/email`), SMTP parser, or IMAP sync modules currently exist in codebase. |
| **F13** | Grounded LLM Fallback & Explanation | **AVAILABLE** | `src/lib/ask/llm.ts`, `src/app/api/ask/route.ts` | Structured AI explanation generation using Google Gemini / OpenAI with strict prompt grounding against `data/kb/` and system prompt safety guardrails. |
| **F14** | Automated Evaluation & Benchmarking Harness | **AVAILABLE** | `scripts/eval.ts`, `tests/eval.test.ts`, `data/eval_dataset.json` | Test harness running 100+ frozen test cases evaluating precision, recall, benign false-positive rates, and archetype classification. |

---

## 3. Input Channels Inventory

| Channel Type | Status | Ingestion Component | Processing & Normalization | Verification / Security |
|---|---|---|---|---|
| **Pasted Text / Chat Transcript** | **AVAILABLE** | `src/app/check/page.tsx` | `src/lib/privacy/mask.ts` -> `extractClaims()` | Client-side input validation, length limits, XSS escaping. |
| **OCR Image Upload** | **AVAILABLE** | `src/app/check/page.tsx` | Tesseract.js OCR -> Text normalization | File MIME validation (JPEG, PNG, WebP), max size 5MB. |
| **Voice / Speech Input** | **AVAILABLE** | `src/components/VoiceInput.tsx` | Web Speech API -> Real-time transcript buffer | User consent, browser WebSpeech SDK capabilities. |
| **Android PWA Share Target** | **AVAILABLE** | `public/manifest.json`, `/check` route | Direct query param URL parsing | HTTPS requirement, service worker cache. |
| **Telegram Bot** | **AVAILABLE** | `src/app/api/channels/telegram/route.ts` | Webhook body parser -> Telegram message extraction | Secret header validation `X-Telegram-Bot-Api-Secret-Token`, rate limited. |
| **WhatsApp Sandbox API** | **NOT_CONFIGURED** | `src/app/api/channels/whatsapp/route.ts` | Webhook payload parser (Hub challenge + Messages) | Webhook token check; 503 fallback when unconfigured. |
| **Email Channel** | **NOT_IMPLEMENTED** | N/A | N/A | N/A |

---

## 4. Grounded Data & Knowledge Repositories

| Repository / Data File | Source Provenance | Verification Date (`as_of` / `verified_at`) | Usage in Code |
|---|---|---|---|
| `data/authorities.json` | SEBI, CyberCrime.gov.in, RBI, NSDL, NSE, BSE official portals | `2026-09-30` | `src/lib/data/authorities.ts` |
| `data/eval_dataset.json` | Frozen Benchmark Cases (Multilingual EN/HI/TA) | `2026-09-25` | `scripts/eval.ts`, `tests/eval.test.ts` |
| `data/kb/*.md` | Official Regulatory Summaries & SEBI Alerts | `2026-09-28` | `src/lib/rag/index.ts` |

---

## 5. Summary Conclusion

The ArgusFin / SANGYAN core architecture possesses high-quality foundation modules for offline-first scam detection, privacy masking, grounded RAG, financial returns calculation, authority routing, and Telegram channel webhook integration. The primary gaps for CORE-01 expansion are:
1. Enabling WhatsApp production credentials / handler logic.
2. Ingesting email inputs.
3. Consolidating unified multi-modal signals into a single pipeline engine.
