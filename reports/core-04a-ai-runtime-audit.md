# CORE-04A AI Runtime & Education Grounding Audit

## 1. Executive Conclusion
**Question**: *Does SANGYAN genuinely support open-ended educational questions using its Groq/Gemini + grounded knowledge architecture, or are educational questions effectively dependent on hardcoded TypeScript content/data?*

**Audit Decision**: **NEEDS-FIX (Architectural Clarity)** / **PASS (Safety & Grounding Policy)**

### Detailed Answer:
1. **Can a user ask a genuinely new educational question without adding a new entry to a TypeScript file?**
   - **YES, for questions covered by the grounded regulatory corpus (`VERIFIED_CORPUS_DOCS`)**: The RAG pipeline performs dynamic TF-IDF vector similarity scoring across `VERIFIED_CORPUS_DOCS`. Any novel query matching regulatory topics (e.g., IPO allotment rules, copy trading advisories, recovery scams) will dynamically retrieve relevant corpus chunks and format a grounded response without requiring a hardcoded question or TS entry.
   - **NO, for general financial literacy questions absent from `VERIFIED_CORPUS_DOCS`**: The `/api/ask` pipeline does **NOT** invoke an LLM (Groq or Gemini) to generate dynamic natural language answers for general educational topics. If a query falls outside the 7 regulatory documents in `VERIFIED_CORPUS_DOCS`, the system outputs the grounded uncertainty fallback: *"I can't verify this from the available source material."*
2. **Is `src/lib/education/data.ts` runtime knowledge for Q&A?**
   - **NO**. `src/lib/education/data.ts` is used exclusively for static UI page rendering (e.g., `/learn`, `/learn/lessons/[slug]`, `/learn/instruments/[slug]`, `/learn/glossary`). `/api/ask` does **not** query or depend on `src/lib/education/data.ts` at runtime.

---

## 2. Actual Education Request Flow
```
User Query ("What is NAV in a mutual fund?")
  ↓
Browser UI (`/ask`)
  ↓
POST `/api/ask`
  ↓
PII Masking (`maskPII`)
  ↓
Intent Classification (`classifyQueryIntent`) -> Detected: 'EDUCATIONAL'
  ↓
RAG Engine (`askRag`)
  ↓
Investment Advice Filter (Check `INVESTMENT_ADVICE_PATTERNS`) -> Passed
  ↓
Vector Evidence Retrieval (`retrieveEvidence` TF-IDF against `ALL_CORPUS_CHUNKS`)
  ↓
  ├─> If Similarity >= 0.25: Synthesize Grounded Answer + Citations (`status: 'ANSWERED'`)
  └─> If Similarity < 0.25: Output Fallback `UNVERIFIED_FALLBACK_MESSAGES` (`status: 'NO_SOURCE'`)
```

---

## 3. Actual Scam-Analysis Flow
```
User Payload ("Join VIP group for 2% daily return")
  ↓
POST `/api/check` or POST `/api/ask`
  ↓
PII Masking (`enforcePrivacyGate`)
  ↓
URL Intelligence Analysis (`analyzeUrlsInText`)
  ↓
Detector Adapter (`runDetectorAdapter`)
  ↓
Decision Engine (`CompositeDecisionEngine`)
  ├─> Configured 'rules' (Default): `RulesOnlyDecisionEngine` (Deterministic rules & signal matrix)
  └─> Configured 'fallback': `FallbackDecisionEngine` (Groq API Llama-3 JSON call)
  ↓
Semantic Feature Extraction (`extractSemanticFeatures`)
  ↓
Compositional & Open-World Behavioral Fusion (`evaluateCompositionalReasoning` + `analyzeOpenWorldBehavior`)
  ↓
RAG Evidence Citation Retrieval (`askRag` for SEBI/RBI/MHA citations)
  ↓
Final Analysis Result Payload (`AnalysisResult`)
```

---

## 4. Groq Usage
- **Where called**: `src/lib/decision/fallback.ts` (`FallbackDecisionEngine`).
- **Endpoint**: `https://api.groq.com/openai/v1/chat/completions` (Model: `process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'`).
- **Purpose**: Probabilistic scam archetype classification fallback when `DECISION_ENGINE=fallback` or when primary JEV engine fails.
- **Is it used for Educational Q&A?**: **NO**. Groq is never invoked in `/api/ask` or `askRag`.
- **Is it used for Scam Analysis?**: **OPTIONAL FALLBACK ONLY**.

---

## 5. Gemini Usage
- **Where referenced**: `src/lib/readiness.ts` (Environment config audit map `GEMINI_API_KEY`).
- **Where called**: **NOWHERE in active codebase logic**.
- **Purpose**: Listed as a candidate provider in readiness reports, but no API client integration exists in the repository.

---

## 6. RAG Usage
- **Where called**: `src/lib/rag/index.ts` (`askRag`), invoked by `/api/ask` and `analyzeScam`.
- **Mechanism**: Local TF-IDF term frequency vectorization and cosine similarity over `ALL_CORPUS_CHUNKS` (`src/lib/rag/corpus.ts`).
- **Corpus Content**: 7 verified regulatory documents (SEBI Copy Trading Advisory 2022, SEBI Fake IPO/FII Advisory 2024, MHA Cybercrime 1930 SOP, RBI Sachet BUDS Act 2023, DoT Chakshu Advisory 2024, Hindi SEBI Advisory, Tamil SEBI Advisory).
- **LLM Integration**: **NONE**. RAG formats matching corpus text directly into structured citations.

---

## 7. Education Data Role (`src/lib/education/data.ts`)
- **Type**: Static TypeScript data file (1645 lines).
- **Contents**: 24 Lessons, 10 Financial Instruments, 20 Investor Resilience Cards, 15 Glossary Terms, 5 Regulator Profiles, 10 Scam Case Studies.
- **Runtime Role**: Serves static UI routes (`/learn`, `/learn/lessons/[slug]`, `/learn/instruments/[slug]`, `/learn/regulators`, `/learn/glossary`).
- **Q&A Role**: **ZERO**. It is not indexed by RAG or queried by `/api/ask`.

---

## 8. Test Data vs Runtime Data Dependency Map
| Data Artifact | Location | Runtime Dependency | Test / Eval Dependency | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `VERIFIED_CORPUS_DOCS` | `src/lib/rag/corpus.ts` | **YES** (`/api/ask`, `askRag`) | YES | Grounded regulatory source of truth for RAG |
| `LESSONS` & `RESI_CARDS` | `src/lib/education/data.ts` | **YES** (UI `/learn` routes) | YES | Static UI educational content |
| `AUTHORITIES` | `data/authorities.json` | **YES** (Authority Router) | YES | Verified helpline numbers and URLs |
| `core-04-dataset.json` | `data/eval/core-04-dataset.json` | **NO** | **YES** (`eval:core-04`) | Frozen 300-case evaluation suite |
| `NOVEL_EDUCATIONAL_QUESTIONS` | `scripts/audit-core-04a.ts` | **NO** | **YES** (`audit:core-04a`) | 30-case novel black-box audit suite |

---

## 9. Hardcoded Question Analysis
- **Search Result**: Zero `question -> answer` lookup maps, switch statements, or hardcoded Q&A tables exist in `/api/ask` or RAG.
- **Conclusion**: Educational Q&A does **NOT** rely on hardcoded exact question matching.

---

## 10. Provider Audit Matrix
| Flow | Groq | Gemini | RAG (TF-IDF) | Hardcoded Content | Deterministic |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Educational Q&A (`/api/ask`)** | NO | NO | YES | NO (Q&A), YES (UI Cards) | **YES** |
| **Scam Analysis (`/api/check`)** | OPTIONAL | NO | YES (Citations) | NO | **YES** (Rules-first) |
| **Image / OCR (`/api/ocr`)** | OPTIONAL | NO | YES (Citations) | NO | **YES** (Tesseract.js) |
| **Calculator (`/calculator`)** | NO | NO | NO | NO | **YES** (Pure Math) |

---

## 11. 30 Novel Question Black-Box Evaluation Results (`npm run audit:core-04a`)
- **Dataset**: 30 novel questions completely absent from `src/lib/education/data.ts`, `data/eval/`, `tests/`, and `scripts/`.
- **Results**:
  - **Uniqueness Check**: 30 / 30 (100% NOVEL)
  - **Intent Classification Accuracy**: 30 / 30 (100% EDUCATIONAL/GENERAL)
  - **Grounding Policy Compliance**: 30 / 30 (100% - 10 returned grounded regulatory evidence, 20 returned unverified source fallback)
  - **Zero Investment Advice / Hallucination**: 30 / 30 (100%)

---

## 12. Provider Failure & Safety Behavior
- **Groq Down / Unset**: System seamlessly falls back to `RulesOnlyDecisionEngine` (0 breaking errors, 100% deterministic safety retained).
- **RAG Missing / Unmatched**: System returns `status: 'NO_SOURCE'` with localized fallback message (*"I can't verify this from the available source material."*).
- **Prompt Injection in Query**: Sanitized and treated strictly as untrusted text data. RAG dual-prompt fence prevents overriding risk decisions.

---

## 13. Identified Architectural Gaps
1. **Missing LLM Synthesizer for RAG**: `askRag` currently performs extractive bullet formatting of top corpus chunks rather than calling an LLM (Groq/Gemini) with a tight RAG system prompt to generate fluid conversational explanations grounded strictly in the retrieved chunks.
2. **Corpus Scope Limitation**: `VERIFIED_CORPUS_DOCS` currently contains 7 regulatory document chunks. General financial literacy topics (e.g. bond pricing mechanics, option expiry, NAV vs share price) are not in the regulatory corpus, causing RAG to output *"I can't verify this"* for non-regulatory education queries.
3. **Gemini Integration Unused**: Gemini API key is audited in readiness reports but no provider client is implemented.

---

## 14. Recommended Next Phase (CORE-05 or Post-Audit Polish)
- **Option A (Strict Safety Baseline)**: Retain current extractive TF-IDF RAG to maintain 100% zero-hallucination guarantee. Expand `VERIFIED_CORPUS_DOCS` with verified SEBI/RBI investor educational handbooks.
- **Option B (Grounded LLM Synthesizer)**: Add an optional grounded LLM synthesizer step inside `askRag` (using Groq Llama-3 or Gemini with temperature 0.0) that takes the top-k retrieved corpus chunks and generates a fluent conversational summary while prohibiting any ungrounded external claims.

---

## 15. Quality Gate Summary
- `npm test`: **PASS** (44 test files, 370 tests passing)
- `npm run typecheck`: **PASS** (0 errors)
- `npm run lint`: **PASS** (0 errors)
- `npm run guardrails`: **PASS** (208 files verified)
- `npm run build`: **PASS** (Next.js SSG build succeeded)
- `npm run smoke`: **PASS** (17/17 assertions passing)
- `npm run audit:core-04a`: **PASS** (30/30 novel questions evaluated cleanly)

---

## 16. Explicit Decision Statement
**CORE-04A AUDIT COMPLETE. ARCHITECTURAL GAP IDENTIFIED AND DOCUMENTED. CORE-05 NOT STARTED. DEPLOYMENT NOT STARTED.**
