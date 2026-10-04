# CORE-02.1 — Hardened Technical Architecture & Evidence-Role Semantics

**Project**: SANGYAN / FinanceX: Investor Resilience  
**Task**: CORE-02.1 False-Positive Hardening & Evidence-Role Architecture  
**Date**: October 4, 2026  
**Status**: ARCHITECTURE IMPLEMENTED & VERIFIED  

---

## 1. Executive Summary & Core Architectural Enhancements

The CORE-02.1 architecture upgrades the SANGYAN engine with **Evidence-Role Semantics**, **Signal Categorization**, **Context Intent Safeguards**, and **Compositional Feature Interaction Filtering**.

```
Incoming User Query / Input
             │
             ▼
 ┌──────────────────────┐
 │   Privacy Masker     │ (Masks phone, account, UPI, PII)
 └───────────┬──────────┘
             │
             ▼
 ┌──────────────────────┐
 │ Intent Classifier    │ (EDUCATIONAL_QA | CONTENT_ANALYSIS | CALCULATOR_NUMERIC | REPORTING | UNKNOWN)
 └───────────┬──────────┘
             │
             ├────────────────────────────────────────────────────┐
             ▼                                                    ▼
   [EDUCATIONAL_QA / CALCULATOR]                          [CONTENT_ANALYSIS]
             │                                                    │
             ▼                                                    ▼
Grounding & RAG Retrieval                               ┌──────────────────────────────────┐
(Zero False Alarms)                                     │ Multilingual Semantic Extractor  │
                                                        │ (EN, HI, TA, Hinglish, Tanglish) │
                                                        └─────────────────┬────────────────┘
                                                                          │
                                                                          ▼
                                                        ┌──────────────────────────────────┐
                                                        │ Typed Evidence-Role Vector       │
                                                        │ (ASKED_AS_QUESTION,              │
                                                        │  EXPLAINED_AS_CONCEPT,           │
                                                        │  CLAIMED_BY_SENDER, etc.)        │
                                                        └─────────────────┬────────────────┘
                                                                          │
                                                                          ▼
                                                        ┌──────────────────────────────────┐
                                                        │ Compositional Feature Reasoner   │
                                                        │ (Filters out conceptual/question │
                                                        │  roles from high-risk hits)      │
                                                        └─────────────────┬────────────────┘
                                                                          │
                                                                          ▼
                                                        ┌──────────────────────────────────┐
                                                        │ Deterministic Rule & Fusion Gate │
                                                        │ (Safety rules + Intent safeguard)│
                                                        └─────────────────┬────────────────┘
                                                                          │
                                                                          ▼
                                                        ┌──────────────────────────────────┐
                                                        │ Typed AnalysisResult Output      │
                                                        │ (HIGH | MEDIUM | LOW_SIGNALS)    │
                                                        └──────────────────────────────────┘
```

---

## 2. Evidence-Role Semantics (`src/lib/scam/features.ts`)

Every extracted feature provenance includes a typed `EvidenceRole` and `SignalCategory`:

### Evidence Roles:
1. `CLAIMED_BY_SENDER`: Direct return, profit, or yield claims made by sender.
2. `REQUESTED_FROM_USER`: Direct action requests (pay fee, share OTP, install AnyDesk, join VIP group).
3. `DESCRIBED_BY_USER`: Victim describing historical interaction.
4. `ASKED_AS_QUESTION`: Question inquiring about a concept or scam ("What is a 10% annual return on FD?").
5. `EXPLAINED_AS_CONCEPT`: Legitimate banking/financial definition ("Fixed Deposits offer guaranteed returns set by banks").
6. `HYPOTHETICAL`: Academic or hypothetical scenario ("Suppose an investment promises...").
7. `NEGATED`: Negated claims ("Banks do not ask for OTP", "Never pay withdrawal fee").
8. `QUOTED_EXAMPLE`: Quotation used for illustration ("He said: 'Send ₹50,000'").
9. `WARNING_ABOUT_SCAM`: Official regulatory or awareness warning ("SEBI warned investors today...").

### Signal Categories:
- `CONCEPTUAL_SIGNAL`: Financial terms without active solicitation.
- `BEHAVIORAL_SIGNAL`: High yield or social pressure claims.
- `DIRECT_REQUEST_SIGNAL`: Payment, deposit, or fee demands.
- `USER_HARM_SIGNAL`: OTP, PIN, CVV, seed phrase, or remote desktop software requests.

---

## 3. Compositional Feature Interaction Model (`src/lib/detector/compositional.ts`)

- **Role Filtering**: Feature hits with `ASKED_AS_QUESTION`, `EXPLAINED_AS_CONCEPT`, `WARNING_ABOUT_SCAM`, or `NEGATED` roles are filtered out from high-risk scam counts.
- **Multi-Signal Feature Aggregation**:
  - `Community Page + Mentor + Verification Deposit + Trading Signals` → `COPY_TRADING` (`HIGH`)
  - `Customs Clearance Tax / International Crypto Release` → `FAKE_TRADING_APP_OR_PORTAL` (`HIGH`)
  - `Hinglish / Tanglish VIP Trading Group + Profit Promise` → `COPY_TRADING` or `DOUBLING_SCHEME` (`HIGH`)
- **Intent Safeguard**: `EDUCATIONAL_QA` and `CALCULATOR_NUMERIC` queries without active payment/credential requests evaluate cleanly to `LOW_SIGNALS` (`OTHER_OR_NONE`).
