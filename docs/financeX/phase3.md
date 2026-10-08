# FinanceX Phase 3: Unified Multilingual Resilience, Explainable Scoring & Web3 Integration

## Overview

Phase 3 strengthens and unifies FinanceX into a production-grade investor resilience ecosystem (*Learn → Protect → Report → Prove*). It resolves core capability bottlenecks across speech synthesis, screenshot OCR, explainable scam detection, Indian case-study learning loops, and third-party integration pipelines.

---

## Architecture Summary

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 FinanceX Ecosystem UI                   │
                  │   /learn  •  /check (Shield)  •  /prove  •  /report     │
                  └───────────────────────────┬─────────────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         │                                    │                                    │
         ▼                                    ▼                                    ▼
┌──────────────────┐               ┌──────────────────────┐             ┌─────────────────────┐
│ Multilingual     │               │ Explainable Scam     │             │ Multilingual OCR    │
│ Voice Service    │               │ Decision Engine      │             │ Pipeline            │
│ (ta-IN, ml-IN,   │               │ (Deterministic Core, │             │ (Canvas Prep,       │
│ hi-IN, en-IN)    │               │ +Contribution Table, │             │ Multi-Script        │
│ Session ID Cancel│               │ Grounded Synthesis)  │             │ Tesseract v5)       │
└──────────────────┘               └──────────┬───────────┘             └─────────────────────┘
                                              │
                                              ▼
                                   ┌──────────────────────┐
                                   │ India Scam           │
                                   │ Case Studies         │
                                   │ (/learn/case-studies)│
                                   └──────────────────────┘
```

---

## Core Capabilities

### 1. Multilingual Voice Service (`src/lib/voice/`)
- **Supported Locales:** Tamil (`ta-IN`), Hindi (`hi-IN`), Malayalam (`ml-IN`), English (`en-IN` preferred, `en-US`/`en-GB`).
- **Session Locking:** Every `speak()` invocation issues an atomic incrementing `currentSessionId`. Calling `stop()` immediately invokes `speechSynthesis.cancel()` and invalidates the session ID, guaranteeing queued paragraph chunks never continue.
- **Indic Currency Articulation:** Automatically translates currency notations (e.g. `₹50,000` -> `50000 ரூபாய்` in Tamil, `50000 रुपये` in Hindi, `50000 രൂപ` in Malayalam).
- **Strict No-Fake Invariant:** If a genuine voice matching the requested Indic language does not exist on the client device, the service returns `null` and displays a graceful fallback message rather than silently claiming speech is playing.

### 2. Multilingual OCR Pipeline (`src/lib/ocr/`)
- **Supported Scripts:** English (`eng`), Tamil (`tam`), Hindi (`hin`), Malayalam (`mal`), mixed Indic-Latin scripts.
- **Preprocessing:** Grayscale conversion, adaptive contrast enhancement, and luminance thresholding via HTML5 Canvas.
- **Quality & Confidence:** Confidence evaluation flags low-certainty extractions (<60%) with clear UI warnings and offers manual text editing prior to Shield analysis.
- **Privacy Assurance:** Extracted OCR text is scrubbed by `maskPII()` prior to any external evaluation or analysis.

### 3. Explainable Scam Detection (`src/lib/scam/explanation.ts`)
- **Authoritative Determinism:** The final risk score (0–100) and risk band are calculated strictly from detected rule flags, extracted claims, and verified pattern contributions.
- **Itemized Signal Breakdown:** Warning badges detail the exact signal label, excerpted quote evidence, rationale, and contribution points (`+25`, `+20`, etc.).
- **Safe Messaging:** Low risk responses never state "SAFE"; they explicitly state "NO STRONG SCAM SIGNALS DETECTED (THIS IS NOT A GUARANTEE OF SAFETY)".

### 4. India Scam Case Studies (`src/lib/financeX/academy/caseStudies.ts`)
- **Authoritative Public Cases:** 6 documented case studies sourced from Ministry of Home Affairs (I4C), SEBI Investor Alerts, and RBI Caution Lists (Digital Arrest, Fake Institutional IPO Allotments, Prepaid Task Traps, Urgent Electricity Disconnection, Bank KYC APKs, AI Crypto Arbitrage).
- **Interactive Resilience Loop:** Every case study features a "Try a similar example in Shield" CTA pre-populating the input box, directly linking educational theory to practical scam detection.

### 5. Telegram & n8n Reliability (`/api/integrations/n8n/analyze`)
- **Standardized Error Architecture:** Emits structured error codes (`N8N_AUTH_FAILED`, `N8N_BAD_REQUEST`, `SANGYAN_TIMEOUT`, `SANGYAN_INTERNAL_ERROR`, `RATE_LIMITED`).
- **Timing-Safe Auth:** Verifies `x-n8n-secret` and `Authorization: Bearer` headers via `crypto.timingSafeEqual`.
- **Zero PII Storage:** Neither incoming messages nor secrets are logged.
