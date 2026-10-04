# CORE-02 — Generic Scam Intelligence & Semantic Generalization Architecture

**Project**: SANGYAN / FinanceX: Investor Resilience  
**Task**: CORE-02 Technical Architecture & Engine Design  
**Date**: October 4, 2026  
**Status**: ARCHITECTURE FULLY IMPLEMENTED & VERIFIED  

---

## 1. Executive Architecture Overview

The CORE-02 upgrade transitions SANGYAN from a keyword/regex-matching system into a **generic scam-intelligence engine**. It evaluates natural language descriptions, paraphrases, Hinglish/Tanglish phrasings, novel multi-behavior combinations, URLs, screenshots/OCR evidence, and benign financial education questions without relying on exact literal keyword matches.

```
Incoming User Payload (Text / URL / Image)
                 │
                 ▼
     ┌───────────────────────┐
     │  Privacy Masker       │  (Masks raw PII, phone, account, UPI before processing)
     └───────────┬───────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │ Intent Classifier     │  (EDUCATIONAL_QA | CONTENT_ANALYSIS | CALCULATOR_NUMERIC | REPORTING)
     └───────────┬───────────┘
                 │
      ┌──────────┴────────────────────────┐
      ▼                                   ▼
 [EDUCATIONAL_QA]                 [CONTENT_ANALYSIS]
      │                                   │
      ▼                                   ▼
Grounded RAG Answer               ┌───────────────────────────────────────┐
(Zero false alarm)                │ Multilingual Semantic Extractor       │
                                  │ (EN, HI, TA, Hinglish, Tanglish)      │
                                  └───────────────────┬───────────────────┘
                                                      │
                                                      ▼
                                  ┌───────────────────────────────────────┐
                                  │ 11-Category Semantic Feature Vector   │
                                  │ (Promises, Payment, OTP, Remote, etc) │
                                  └───────────────────┬───────────────────┘
                                                      │
                                                      ▼
                                  ┌───────────────────────────────────────┐
                                  │ Compositional Multi-Signal Reasoner   │
                                  │ (Multi-feature matrix evaluation)     │
                                  └───────────────────┬───────────────────┘
                                                      │
                                                      ▼
                                  ┌───────────────────────────────────────┐
                                  │ Rule & Deterministic Safety Fusion    │
                                  │ (Rules + Semantic Compositional)      │
                                  └───────────────────┬───────────────────┘
                                                      │
                                                      ▼
                                  ┌───────────────────────────────────────┐
                                  │ Typed AnalysisResult Output           │
                                  │ (HIGH | MEDIUM | LOW_SIGNALS)         │
                                  └───────────────────────────────────────┘
```

---

## 2. Generic Semantic Feature Model (`src/lib/scam/features.ts`)

The semantic feature vector provides a strongly typed representation of underlying scam behaviors, independent of literal wording.

Every feature includes:
- `detected`: `boolean`
- `confidence`: `number` (0.0 to 1.0)
- `provenance`: `EXPLICIT_TEXT | INFERRED_CONTEXT | PATTERN_MATCH`
- `extractedSnippet`: `string`

### 11 Semantic Categories Supported:

1. **FINANCIAL_PROMISES**
   - Promised yield / percentage, timeframe, fixed daily/weekly/monthly cadence, guaranteed/no-loss language, compounding claims, unrealistic return ratios.
2. **PAYMENT_BEHAVIOR**
   - Advance payment, registration/activation fee, withdrawal fee, tax clearance deposit, personal bank account, personal UPI ID, cryptocurrency transfer, payment before access.
3. **CREDENTIAL_REQUESTS**
   - OTP, PIN, password, banking credentials, CVV, seed phrase, private key, API key.
4. **DEVICE_ACCESS_REQUESTS**
   - Remote desktop software (AnyDesk, TeamViewer), screen sharing, unknown APK download, browser extension, remote control request.
5. **SOCIAL_PRESSURE**
   - Urgency, scarcity, secrecy, VIP group invitation, authority pressure, fear/threats, guaranteed opportunity.
6. **INVESTMENT_MECHANISMS**
   - Copy trading, managed trading, trading signals, crypto staking/mining, liquidity pool, fake investment app/portal, IPO allotment claim, task/job investment.
7. **WITHDRAWAL_PATTERNS**
   - Withdrawal blocked, additional fee demanded, verification fee, unlock fee, account upgrade requirement, repeated payment escalation.
8. **IMPERSONATION**
   - Regulator (SEBI, RBI), bank, crypto exchange, broker, tech support, government official, trusted individual.
9. **TECHNICAL_URL_SIGNALS**
   - Suspicious URL, lookalike domain, punycode, shortener, fake login page, credential collection form, malicious QR URL.
10. **RECOVERY_SCAMS**
    - Upfront recovery fee, guaranteed asset recovery, victim retargeting, fake cyber investigator.
11. **JOB_TASK_PATTERNS**
    - Task completion, deposit to unlock tasks, commission withdrawal threshold, escalating deposit demands.

---

## 3. Multilingual Semantic Extractor (`src/lib/detector/semanticExtract.ts`)

The extractor maps natural phrasing and paraphrases across **English, Hindi, Tamil, Hinglish, and Tanglish** into unified semantic meaning.

### Paraphrase Normalization Examples:
- `"earn 5% every morning"` → `FINANCIAL_PROMISES (Daily Cadence, High Yield)`
- `"balance grows five percent daily"` → `FINANCIAL_PROMISES (Daily Cadence, Fixed Yield)`
- `"मेरे अंकल ने कहा कि 100% फायदा पक्का मिलेगा"` → `FINANCIAL_PROMISES (Guaranteed Return, Doubling)`
- `"VIP trading group join pannunga 100% no risk"` → `FINANCIAL_PROMISES (No Loss)` + `SOCIAL_PRESSURE (VIP Group)`

---

## 4. Multi-Signal Compositional Reasoning (`src/lib/detector/compositional.ts`)

Compositional reasoning prevents isolated benign terms from triggering false positives while correctly elevating multi-signal scam patterns.

### Decision Matrix Logic:
- **Educational Safeguard**: Educational queries or benign discussions with `detectedFeatureCount == 0` or isolated terms evaluate to `LOW_SIGNALS` or `CANNOT_VERIFY`.
- **Multi-Signal Scam Elevation**:
  - `High Yield + Payment Behavior` → `HIGH_RISK` (`DOUBLING_SCHEME`)
  - `Remote Access (AnyDesk) + Credential Request` → `HIGH_RISK` (`REMOTE_ACCESS_SCAM`)
  - `Task Completion + Deposit to Unlock` → `HIGH_RISK` (`PRE_APPROVED_LOAN_SCAM / TASK_SCAM`)
  - `Blocked Withdrawal + Tax/Fee Demand` → `HIGH_RISK` (`FAKE_TRADING_APP_OR_PORTAL`)
  - `Copy Trading + Personal UPI Payment` → `HIGH_RISK` (`COPY_TRADING`)

---

## 5. Intent Routing System (`src/lib/detector/intent.ts`)

The intent router inspects user intent before selecting execution pathways in `/api/ask` and `analyzeScam()`:

| Intent Category | Description | Primary Route |
|---|---|---|
| `EDUCATIONAL_QA` | General financial questions ("What is SIP?", "How does FD work?") | Grounded RAG (`askRag()`) |
| `CONTENT_ANALYSIS` | Evaluation of messages, claims, emails, or screenshots | Scam Intelligence (`analyzeScam()`) |
| `CALCULATOR_NUMERIC` | Mathematical compounding or yield questions | Calculator Integration |
| `REPORTING` | Cyber crime helpline or incident drafting | Incident Reporting Helper |
| `UNSUPPORTED` | Non-financial or out-of-scope requests | Safe Fallback Response |

---

## 6. LLM & RAG Roles and Guardrails

### LLM Role:
- Used exclusively for semantic parsing assistance and explanation synthesis.
- **Zero Final Authority**: LLM text cannot override deterministic rules or compositional feature bounds.

### RAG Role:
- Provides grounded source facts, helpline verified data, and educational context.
- **Decoupled from Detection**: Scam detection functions identically whether RAG is enabled or disabled (`RAG_NO_SOURCE`).

---

## 7. Unknown & Novel Scam Handling

If a message exhibits clear suspicious financial behaviors (e.g. advance fee demand + urgency) but does not fit standard canonical archetypes, the engine assigns:
- Archetype: `OTHER_OR_NONE` (or `OTHER_SUSPICIOUS_FINANCIAL_PATTERN`)
- Risk Band: `HIGH` or `MEDIUM`
- Explanation: Explicitly details observed suspicious signals without fabricating unverified archetypes.
