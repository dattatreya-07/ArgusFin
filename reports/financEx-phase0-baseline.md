# FinanceX Phase 0 Foundation Baseline Report

**Project:** FinanceX  
**Hackathon:** HackSpark '26  
**Team:** Team Caishen  
**Domain:** FinTech + Web3  
**Date:** October 8, 2026  
**Status:** Baseline Established  

---

## 1. Current Architecture Overview

ArgusFin is a production-grade investor protection and financial scam resilience platform built with Next.js App Router, TypeScript, TailwindCSS, and Next-Intl. The engine provides deterministic safety guardrails, semantic AI analysis, retrieval-augmented generation (RAG) grounded in official regulatory data, OCR claim extraction, and authority routing.

### Core Stack
- **Framework:** Next.js `14.2.35` (App Router with i18n routing)
- **UI Library:** React `18.3.1`, TailwindCSS `3.4.17`
- **Language:** TypeScript `5.7.3` (Strict mode)
- **OCR Engine:** Tesseract.js `7.0.0`
- **Validation:** Zod `3.24.2`
- **Testing:** Vitest `2.1.8`, `tsx` runner for evaluation & guardrails

---

## 2. Existing Modules & Subsystems

| Subsystem | Primary Code Location | Description |
| :--- | :--- | :--- |
| **Scam Detection Engine** | `src/lib/scam/analyze.ts`, `src/lib/rules.ts`, `src/lib/fuse.ts` | Multi-stage scam analysis pipeline combining rule-based heuristics and model decisions. |
| **Semantic AI Layer** | `src/lib/semantic/`, `src/lib/decision/` | Pattern classification and confidence estimation via Groq/Gemini/JEV engines. |
| **Deterministic Safety Engine** | `src/lib/invariants.ts`, `src/lib/thresholds.ts`, `src/lib/decision/fallback.ts` | Hard safety invariants that override LLM hallucination or low-confidence outputs. |
| **RAG Layer** | `src/lib/rag/` | Grounded search against verified corpus in `data/` (authorities, scam patterns). |
| **OCR & Vision** | `src/lib/ocr/`, `src/lib/vision.ts` | Text extraction from uploaded screenshots and QR codes using Tesseract.js. |
| **URL & Signal Intelligence** | `src/lib/scam/url/analyze.ts`, `src/lib/signals/` | Domain age, RDAP lookup, URL shortener expansion, and suspicious domain detection. |
| **Privacy & Masking** | `src/lib/mask.ts`, `src/lib/privacy.ts` | Client-side & server-side PII masking for phone numbers, account numbers, and UPI IDs. |
| **Reporting Subsystem** | `src/lib/report/`, `src/app/api/report/route.ts` | Structuring pre-filing incident records with evidence hashes for regulatory submission. |
| **Authority Router** | `src/lib/authorities/`, `src/app/api/authorities/route.ts` | Dynamic routing to official Indian financial regulators (SEBI, RBI, CyberCrime 1930). |
| **Financial Calculators** | `src/lib/calc.ts`, `src/simulators/` | Promise-to-reality calculators, CAGR vs promised return comparisons, compounding simulators. |
| **Telegram & n8n Integration** | `src/lib/integrations/`, `src/lib/channels/` | Webhook endpoints and bot interface for multi-channel scam checking. |
| **Localization** | `src/i18n/`, `locales/*.json` | Multilingual support for English (`en`), Hindi (`hi`), and Tamil (`ta`). |

---

## 3. Existing App Routes

### UI Routes (`src/app/[locale]/`)
- `/` - Home / Landing Page
- `/check` - Scam Check & Claim Analysis
- `/learn` - Investor Education & Micro-Lessons
- `/calculator` - Promise-to-Reality Calculator
- `/simulate` - Market Crash & Doubling Scheme Simulators
- `/authorities` - Responsible Authority Router
- `/report` - Emergency Incident Report Generator
- `/ask` - RAG-Grounded Investor Protection Assistant
- `/intelligence` - Emerging Scam Pattern Intelligence
- `/share` - Shareable Risk Report Cards
- `/dev` - System Diagnostics & Test Harness

### API Routes (`src/app/api/`)
- `/api/check` - Main Scam Detection Endpoint
- `/api/ask` - RAG Assistant Endpoint
- `/api/report` - Incident Record Generator
- `/api/authorities` - Authority Router Endpoint
- `/api/ocr` - OCR Screenshot Processing
- `/api/channels` - Telegram/WhatsApp Channel Handler
- `/api/integrations` - n8n Webhook Endpoint
- `/api/ladder` - Compounding & Reality Ladder API
- `/api/cyber-stats` - Cyber Crime Statistics & Trends
- `/api/health` - Readiness & Liveness Probe

---

## 4. Existing Environment Variables

```env
# Decision Engine mode: jev | fallback | rules
DECISION_ENGINE=rules

# Decision & LLM Providers (Server-side only)
JEV_API_KEY=your_jev_api_key_here
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=your_gemini_api_key_here

# n8n Integration Architecture (Server-side secret)
N8N_INTEGRATION_SECRET=your_n8n_integration_secret_here

# Public Bot Link
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=ArgusFin_bot
```

---

## 5. Baseline Test & Verification Status

Prior to any modifications, the codebase was verified using standard project commands:

- **TypeScript Typecheck (`npm run typecheck`):** PASSED (`tsc --noEmit` exited 0)
- **Unit & Integration Test Suite (`npm test`):** PASSED (52 test files passed, 400 total tests passed)
- **ESLint (`npm run lint`):** PASSED (`next lint` exited 0 with 4 minor Next/Image warnings)
- **Guardrail Compliance Scanner (`npm run guardrails`):** PASSED (All 9 hard rules verified across 217 files)

---

## 6. Protected Functionality & Guardrails

The following guardrail policies specified in `AGENTS.md` are strictly preserved:

1. **No Investment Advice:** No stock tips, buy/sell signals, price predictions, or platform promotion.
2. **No Monetisation:** No ads, affiliate links, or paid tiers.
3. **Privacy by Design:** Zero storage of raw PII/SMS/OTPs/UPI IDs. Client-side PII masking.
4. **No Naming and Shaming:** Uses scam archetypes instead of targeted accusations.
5. **Grounded Numbers:** All statistics come from `data/` with `source_url` and `as_of`.
6. **Grounded RAG Answers:** Lowest risk band is `"No red flags found (this is not a guarantee)"`.
7. **No Illegal Legal Citations:** Legal citations must match verified corpus items.
8. **Verified Authorities:** Phone numbers & URLs must come from `data/authorities.json`.
9. **Copyright Preservation:** Only official public pages and original summaries used.

---

## 7. Migration Plan (Phase 0)

1. **Safe Architecture Layering:** Create `src/lib/financeX/` with distinct module boundaries (`academy`, `shield`, `prove`, `platform`).
2. **Canonical Types:** Define `src/lib/financeX/types.ts` without duplicating existing scam types.
3. **Configuration Layer:** Add `src/lib/financeX/config.ts` for product flags.
4. **ArgusFin Shield Integration:** Facade `financeX/shield/index.ts` cleanly wrapping `src/lib/scam/analyze.ts`.
5. **Web3 & Academy Boundaries:** Clean non-fake abstractions (`CredentialService`, `EvidenceAnchorService`, `ScamRegistryService`).
6. **Data Model Roadmap:** Document Supabase/PostgreSQL schema in `reports/financEx-data-model-roadmap.md`.
7. **Application Shell & UI:** Update navigation bar and dashboard to display **FinanceX** (`Learn | Protect | Prove`) while identifying the protection engine as **ArgusFin Shield**. Create `/prove` foundation page.
8. **Regression Tests & Verification:** Add `tests/financeX/foundation.test.ts` and verify all 400 existing tests + new foundation tests pass.

---

## 8. Files to Modify vs. Files NOT to Modify

### Files to Modify / Create (Phase 0 Foundation)
- `reports/financEx-phase0-baseline.md` (Created)
- `reports/financEx-data-model-roadmap.md` (To create)
- `src/lib/financeX/types.ts` (To create)
- `src/lib/financeX/config.ts` (To create)
- `src/lib/financeX/shield/index.ts` (To create)
- `src/lib/financeX/academy/index.ts` (To create)
- `src/lib/financeX/prove/index.ts` (To create)
- `src/lib/financeX/platform/index.ts` (To create)
- `src/lib/financeX/index.ts` (To create)
- `src/components/HeaderNav.tsx` (Update for FinanceX navigation)
- `src/app/[locale]/page.tsx` (Update FinanceX Dashboard)
- `src/app/[locale]/learn/page.tsx` (Update Academy foundation UI)
- `src/app/[locale]/prove/page.tsx` (Create Web3 trust layer foundation page)
- `src/app/[locale]/protect/page.tsx` (Create Shield alias page)
- `locales/en.json`, `locales/hi.json`, `locales/ta.json` (Update product text & navigation)
- `docs/financeX/architecture.md`, `docs/financeX/migration.md`, `docs/financeX/development.md` (To create)
- `tests/financeX/foundation.test.ts` (To create)
- `reports/financEx-phase0-completion.md` (Final completion report)

### Files That MUST NOT Be Modified / Diluted
- `src/lib/scam/analyze.ts` (Core scam engine logic)
- `src/lib/rules.ts` (Deterministic safety rules)
- `src/lib/invariants.ts` (Safety invariant assertions)
- `src/lib/mask.ts` & `src/lib/privacy.ts` (PII masking logic)
- `src/lib/rag/` (RAG vector/retrieval engine)
- `data/authorities.json` & `data/corpus.json` (Authoritative grounded data)
- Existing vitest test files under `src/` and `tests/`
