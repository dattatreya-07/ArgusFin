# CORE-02.2 — Technical Architecture & Production Gate Integration

**Project**: SANGYAN / FinanceX: Investor Resilience  
**Task**: CORE-02.2 Technical Architecture & Benchmark Engine Design  
**Date**: October 4, 2026  
**Status**: ARCHITECTURE VERIFIED & PRODUCTION GATE PASSED  

---

## 1. System Pipeline Overview

The CORE-02.2 system integrates an independent 800-case frozen benchmark evaluation pipeline with strict intent and evidence-role safeguards:

```
Incoming User Query
         │
         ▼
┌───────────────────┐
│  Privacy Masker   │ (Masks raw PII, phone, account, UPI)
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Intent Classifier │ (EDUCATIONAL_QA | CONTENT_ANALYSIS | CALCULATOR_NUMERIC | REPORTING | UNKNOWN)
└────────┬──────────┘
         │
   ┌─────┴────────────────────────────────┐
   ▼                                      ▼
[EDUCATIONAL_QA / CALCULATOR]       [CONTENT_ANALYSIS]
   │                                      │
   ▼                                      ▼
Grounded RAG Answer               ┌─────────────────────────────────┐
(Zero False Alarms)               │ Multilingual Semantic Extractor │
                                  │ (EN, HI, TA, Hinglish, Tanglish)│
                                  └───────────────┬─────────────────┘
                                                  │
                                                  ▼
                                  ┌─────────────────────────────────┐
                                  │ Evidence-Role Vector & Context  │
                                  │ (CLAIMED_BY_SENDER vs           │
                                  │  EXPLAINED_AS_CONCEPT)          │
                                  └───────────────┬─────────────────┘
                                                  │
                                                  ▼
                                  ┌─────────────────────────────────┐
                                  │ Compositional Feature Reasoner  │
                                  │ (Filters conceptual hits)       │
                                  └───────────────┬─────────────────┘
                                                  │
                                                  ▼
                                  ┌─────────────────────────────────┐
                                  │ Safety Rules & Fusion Engine    │
                                  └───────────────┬─────────────────┘
                                                  │
                                                  ▼
                                  ┌─────────────────────────────────┐
                                  │ Typed AnalysisResult Output     │
                                  └─────────────────────────────────┘
```

---

## 2. Key Architecture Controls

1. **OTP & Credential Solicitation Safeguard**: `extractClaims` and `semanticExtract` require active OTP sharing phrases ("share OTP", "send OTP", "enter code") to extract OTP requests. Purely educational mentions ("OTP confidentiality", "what is OTP") do NOT trigger credential rules.
2. **Evidence-Role Compositional Filtering**: `evaluateCompositionalReasoning` ignores feature hits where provenance roles are `ASKED_AS_QUESTION`, `EXPLAINED_AS_CONCEPT`, `WARNING_ABOUT_SCAM`, or `NEGATED`.
3. **Decoupled RAG Architecture**: Retrieval-augmented generation provides grounded citations without influencing risk classification authority.
