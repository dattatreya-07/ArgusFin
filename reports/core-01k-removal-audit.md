# CORE-01K Removal Audit & Architectural Boundary Inventory

**Project**: SANGYAN / FinanceX: Investor Resilience  
**Task**: CORE-01K Direct Provider Transport Removal & Canonical n8n Integration Boundary  
**Date**: October 4, 2026  
**Status**: AUDIT COMPLETE (Pre-Destructive Action Baseline)

---

## 1. Executive Summary

This removal audit inventories all components, files, and routes in the SANGYAN repository to clearly distinguish between **obsolete direct provider transport layers** (which are being replaced by an n8n orchestration architecture), **obsolete screen recording case study assets**, and **canonical core intelligence capabilities** (which must be strictly preserved).

Under the final architecture:
- **n8n** acts as the **Channel Integration & Orchestration Layer** (owning Telegram Bot API connections, Meta WhatsApp Cloud API webhooks, provider credentials, event ingestion, and outbound messaging formatting).
- **SANGYAN** remains the **Analysis Engine & Canonical Intelligence Authority** (owning deterministic rules, RAG, URL intelligence, OCR, PII masking, decision fusion, and multi-lingual explanation generation).

---

## 2. File Classification Inventory

Each candidate file is rigorously audited and classified into one of the following standard categories:
- `REMOVE_SCREEN_RECORDING_ANALYSIS`: Video/component assets deprecated by task instruction.
- `REMOVE_PROVIDER_TRANSPORT`: Direct provider webhook/transport code replaced by n8n.
- `REFACTOR_TO_SHARED_API`: Core shared code or tests refactored to interface with the canonical n8n API.
- `KEEP_CORE`: Essential scam intelligence, canonical types, normalization, and evaluation harnesses.
- `KEEP_TEST`: Regression test suites ensuring decision accuracy, privacy, and performance invariants.

| File Path | Classification | Rationale & Architectural Scope |
|---|---|---|
| `src/components/ScreenRecordCaseStudy.tsx` | `REMOVE_SCREEN_RECORDING_ANALYSIS` | Deprecated UI component for screen recording analysis & timeline breakdown. |
| `public/assets/error.mp4` | `REMOVE_SCREEN_RECORDING_ANALYSIS` | Deprecated 5.8MB video asset used by `ScreenRecordCaseStudy.tsx`. |
| `src/app/[locale]/check/page.tsx` | `REFACTOR_TO_SHARED_API` | Remove `<ScreenRecordCaseStudy />` import and JSX render block while preserving all check functionality. |
| `src/app/api/channels/telegram/route.ts` | `REMOVE_PROVIDER_TRANSPORT` | Direct Telegram bot webhook receiver. Replaced by `POST /api/integrations/n8n/analyze`. |
| `src/app/api/channels/telegram/webhook/route.ts` | `REMOVE_PROVIDER_TRANSPORT` | Redundant direct Telegram webhook endpoint. Replaced by n8n integration route. |
| `src/app/api/channels/whatsapp/route.ts` | `REMOVE_PROVIDER_TRANSPORT` | Direct Meta WhatsApp Cloud API webhook receiver. Replaced by `POST /api/integrations/n8n/analyze`. |
| `src/lib/channels/telegram.ts` | `REMOVE_PROVIDER_TRANSPORT` | Direct Telegram Bot API HTTP client (`sendTelegramMessage`), Telegram File API downloader (`processTelegramPhoto`), and webhook verification. |
| `src/lib/channels/whatsapp.ts` | `REMOVE_PROVIDER_TRANSPORT` | Direct Meta Cloud API HTTP client (`sendWhatsAppMessage`), Meta Graph API downloader (`processWhatsAppImage`), and HMAC-SHA256 signature verification. |
| `src/lib/channels/index.ts` | `REFACTOR_TO_SHARED_API` | Update barrel exports to remove deleted provider transport files while keeping shared normalization/service/formatters. |
| `src/lib/channels/types.ts` | `KEEP_CORE` | Canonical channel types (`ChannelType`, `ChannelInput`, `NormalizedChannelMessage`, `ChannelCheckResult`, `ChannelResponse`). |
| `src/lib/channels/normalize.ts` | `KEEP_CORE` | Shared text normalization, forwarded message banner stripping (EN/HI/TA), and URL extraction. |
| `src/lib/channels/service.ts` | `KEEP_CORE` | Shared channel check service adapting normalized messages to `analyzeScam()`. |
| `src/lib/channels/formatters.ts` | `KEEP_CORE` | Presentation-safe markdown, emoji, and localized action deep-link generation. |
| `src/lib/channels/email.ts` | `KEEP_CORE` | Email channel canonical mapping and analysis (CORE-01I). |
| `src/app/api/channels/email/route.ts` | `KEEP_CORE` | Email canonical intake API route. |
| `src/lib/channels/channels.test.ts` | `REFACTOR_TO_SHARED_API` | Retain PWA share normalization and triple-channel decision parity tests; replace direct webhook signature tests with canonical n8n integration tests. |
| `src/components/channels/ChannelsShowcase.tsx` | `REFACTOR_TO_SHARED_API` | Update live diagnostic probes and copy to reflect the n8n integration architecture. |
| `scripts/eval-telegram.ts` | `REFACTOR_TO_SHARED_API` | Update test harness to evaluate canonical Telegram payload analysis via canonical API / `analyzeScam()`. |
| `scripts/eval-whatsapp.ts` | `REFACTOR_TO_SHARED_API` | Update test harness to evaluate canonical WhatsApp payload analysis via canonical API / `analyzeScam()`. |

---

## 3. Retained Core Intelligence & Security Invariants

The following systems are **strictly retained** in SANGYAN and will NEVER be delegated to n8n:

1. **Deterministic Scam Detection Engine** (`src/lib/detector/`, `src/lib/rules.ts`, `src/lib/extract.ts`):
   - All signal extraction, regexes, math calculations, and risk band assignments.
2. **Decision Fusion Matrix** (`src/lib/fuse.ts`, `src/lib/decision/`):
   - Multi-signal conflict resolution and confidence estimation.
3. **Grounded RAG Knowledge Base** (`src/lib/rag/`, `data/kb/`):
   - Official SEBI, RBI, and CyberCrime alerts and citations.
4. **URL Intelligence & SSRF Protection** (`src/lib/scam/url/`):
   - Punycode, lookalike domain matching, and IP safety checks.
5. **OCR & Image Evidence Extraction** (`src/lib/ocr/`, `src/lib/evidence/`):
   - Tesseract.js OCR and QR code decoding.
6. **Privacy Masking Authority** (`src/lib/mask.ts`, `src/lib/privacy/`):
   - Zero-knowledge client/edge masking for phone numbers, email, UPI IDs, bank accounts, and OTPs.
7. **Canonical Analysis Pipeline** (`src/lib/scam/analyze.ts`):
   - The authoritative `analyzeScam()` function accepting `CanonicalInput` and returning `AnalysisResult`.

---

## 4. Planned New Integration Components

To establish the new provider-neutral boundary, the following components will be created:

1. `src/lib/integrations/n8n/types.ts`: Strongly typed schemas for n8n requests, validation errors, and presentation-safe response DTOs.
2. `src/lib/integrations/n8n/auth.ts`: Timing-safe constant-time authentication validator for `N8N_INTEGRATION_SECRET`.
3. `src/lib/integrations/n8n/idempotency.ts`: Bounded, privacy-safe in-memory cache suppressing duplicate event deliveries.
4. `src/lib/integrations/n8n/handler.ts`: Core orchestration handler running validation, media OCR, PII masking, canonical analysis, and response formatting.
5. `src/app/api/integrations/n8n/analyze/route.ts`: Production Next.js API route (`POST` & `GET`) exposing the secure n8n canonical boundary.
6. `docs/n8n/telegram-sangyan-analysis.json`: Importable n8n workflow template for Telegram Bot integration.
7. `docs/n8n/whatsapp-sangyan-analysis.json`: Importable n8n workflow template for WhatsApp Business integration.
8. `docs/n8n/README.md`: Architectural specification and deployment instructions for n8n workflows.

---

## 5. Destructive Action Approval Gate

With this audit recorded:
- File deletions and refactoring can proceed safely without risking core intelligence regressions.
