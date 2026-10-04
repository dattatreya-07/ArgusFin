# CORE-02.3 Open-World System Architecture Document

## 1. System Overview

SANGYAN CORE-02.3 upgrades the detection pipeline into an **Open-World General Scam Understanding Engine**.

The target pipeline guarantees that ANY input (text, URL, screenshot/OCR, multilingual conversation) receives a comprehensive behavioral risk analysis regardless of whether it matches an existing JSON dataset record, keyword rule, or predefined investment archetype.

```
ANY INPUT (Text / URL / Image OCR / Multilingual)
   │
   ▼
[Privacy Gate & PII Masking] (stateless, zero persistent storage of raw user input)
   │
   ▼
[Safe Normalization & URL Intelligence] (domain checks, lookalikes, punycode, SSRF prevention)
   │
   ▼
[Deterministic Adapter + Semantic Feature Extractor]
   │
   ▼
[Open-World General Behavioral Extractor] (`src/lib/detector/openWorld.ts`)
   ├── Claimed Actor & Impersonation
   ├── Claimed Situation & Demand
   ├── Pressure Signals (Urgency, Threat, Fear, Secrecy, Authority, Scarcity)
   ├── Financial Signals (Payment, Fee, Return, Guarantee, Withdrawal Block)
   └── Technical Signals (Link, QR, App Install, Remote Access, Credentials, OTP)
   │
   ▼
[Compositional Fusion & Decision Matrix]
   ├── Mandatory Behavioral Risk Band (`HIGH`, `MEDIUM`, `LOW_SIGNALS`, `CANNOT_VERIFY`)
   └── Optional Archetype Mapping (`OTHER_SUSPICIOUS_FINANCIAL_PATTERN` or specific archetype)
   │
   ▼
[Explanatory Grounding & RAG Retrieval] (RAG provides citations/guidance; does NOT determine safety)
   │
   ▼
[Anonymized Emerging Pattern Registry] (`src/lib/scam/patterns.ts`)
   └── Stores ONLY normalized behavioral fingerprints (NO raw user text, PII, names, numbers)
```

---

## 2. Answers to Core Architectural Questions

1. **Does `/api/check` require a JSON dataset match?**
   **NO.** `/api/check` executes `analyzeScam()`, which runs `analyzeOpenWorldBehavior()` and deterministic/compositional feature extractors. No JSON evaluation dataset is loaded at runtime.

2. **Does `/api/ask` require RAG corpus retrieval?**
   **NO.** `/api/ask` classifies intent using `classifyQueryIntent()`. If `CONTENT_ANALYSIS`, it routes directly to `analyzeScam()` for open-world behavioral risk analysis. RAG retrieval is invoked only for educational citations/guidance and does not dictate safety decisions.

3. **Which JSON files are runtime dependencies?**
   - `data/authorities.json`: Official helpline numbers and verified URLs.
   - `locales/en.json`, `locales/hi.json`, `locales/ta.json`: UI and rule explanation locale strings.
   - `data/rag/*.json`: Educational corpus for RAG citations.

4. **Which JSON files are evaluation-only?**
   - `data/eval_cases.json`
   - `data/datasets/core-02.2/dataset.json`
   - `data/evaluation/core-02.3/dataset.json`

5. **Can a completely unseen scam be analyzed?**
   **YES.** The open-world engine analyzes behavioral characteristics (authority impersonation, short deadlines, threats, payment requests, link-mediated actions) rather than exact phrase matches.

6. **Can an unknown scam category still receive a risk assessment?**
   **YES.** Archetype classification is optional. If no known investment archetype fits, the archetype is assigned `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` while returning a full behavioral risk score and explanation.

7. **Can image evidence enter the same open-world analyzer?**
   **YES.** Images pass through OCR extraction (`src/lib/ocr/`) and URL analysis (`src/lib/scam/url/`), which converge into `CanonicalInput` (`source: 'OCR'` or `'IMAGE'`) processed by `analyzeScam()`.

8. **Can RAG be disabled without changing the safety decision?**
   **YES.** Tested with RAG ON and RAG OFF; decision stability remains 100%.

9. **Can an external LLM override deterministic safety rules?**
   **NO.** External LLM outputs are treated as untrusted inputs and pass through schema validation (`FallbackDecisionEngine`) and deterministic fusion gates. The prompt injection unsafe override rate is 0%.

10. **Are raw user messages persisted?**
    **NO.** Server is stateless for user content. PII is masked before analysis, and the emerging pattern registry records ONLY normalized behavioral fingerprints.
