# SANGYAN / FinanceX: Investor Resilience
# Final Threat Model, Abuse Resistance, Invariants & Release Audit (P3-09 → P3-12)

**Document Version**: `1.0.0-final`  
**Application Version**: `1.0.0-rc2`  
**Governing Principle**: `deterministic first → probabilistic second → generative last`

---

## 1. Attack-Surface Inventory (P3-09)

| Surface / Route | Input Sources | Trust Boundary | Sensitive Data Handled | External Dependencies | Rate Limiting | Validation & Bounds | Failure Mode / Fallback |
|---|---|---|---|---|---|---|---|
| `GET /` & `/[locale]` | URL locale param | Public Client | None | `next-intl` | Standard CDN / Edge | Validates against `['en', 'hi', 'ta']` | Fallback to English |
| `POST /api/check` | JSON (`maskedText`, `lang`) | Client → Server API | Masked PII only | Optional Groq LLM | 30 req / min per IP | Text length bounded to 4,000 chars; Zod schema | Degrades to `RulesOnlyDecisionEngine` |
| `POST /api/ask` | JSON (`query`, `lang`) | Client → Server API | Masked query | Local TF-IDF Vector Index | 30 req / min per IP | Query length bounded to 1,000 chars; Zod schema | Localized `NO_SOURCE` fallback ("Cannot verify") |
| `GET & POST /api/authorities` | Query / JSON params | Client → Server API | Masked loss details | `data/authorities.json` | Standard API limit | Validated against known category & situation keys | `NO_MATCH` disclaimer; zero hallucinated helplines |
| `POST /api/report/draft` | JSON (`narrative`, `txs`, `dates`) | Client → Server API | Redacted identifiers | Local consistency engine | Standard API limit | Narrative bounded to 5,000 chars; tx amounts >= 0 | Generates unverified draft with conflict warnings |
| `GET /api/health` | None | Public Probe | None | System readiness audit | None | Read-only runtime probe | Reports `overallStatus` without leaking secrets |
| `GET /api/ladder` | Query `multiple` | Public API | None | `data/ladder.json` | Standard API limit | Bounded numeric input | Returns closest standard benchmark tier |

---

## 2. Core Pipeline Threat Model & Trust Boundaries

```
[ Untrusted Browser Client ]
        │
        ▼  [ TRUST BOUNDARY 1: Client-Side Masking & Sanitation ]
  • Phones, emails, UPI IDs, PAN cards, and Aadhaar numbers redacted to [PHONE], [UPI], etc.
  • File uploads checked: .svg, .exe, scripts, HTML, and >10MB files rejected.
        │
        ▼  [ TRUST BOUNDARY 2: Next.js Server API & Rate Limiting ]
  • IP rate limit enforced (30 req / min).
  • Request payload bounded via Zod schemas.
  • Centralized boundary logger scrubs all event metadata.
        │
        ├─────────────────────────────┬─────────────────────────────┐
        ▼                             ▼                             ▼
 [ Decision Engine ]          [ RAG TF-IDF Index ]      [ Authority Router ]
 (Rules + Signals)            (Dual Prompt Fence)       (Static Verified Data)
        │                             │
        ▼                             ▼
 [ Optional Remote LLM ]      [ Grounding Verifier ]
 (Masked text in XML blocks)  (Numeric & Citation check)
        │                             │
        └─────────────────────────────┴─────────────────────────────┘
                                      │
                                      ▼  [ TRUST BOUNDARY 3: Output Fusion & PDF Export ]
                         • Fusion resolves final risk band & archetype.
                         • 100% on-device PDF generation via CSS print media.
                         • Zero server persistence of incident reports.
```

### Trust Boundary Rules
1. **Browser → Server**: All raw text is sanitized client-side; server executes defense-in-depth re-masking.
2. **Server → External Providers (Groq / RDAP)**: Only masked strings and public hostnames are transmitted. RDAP enforces SSRF filtering.
3. **Retrieved Corpus → LLM**: Regulatory text is supplied as passive reference material, not instructions.
4. **OCR / STT → Decision Engine**: Visual and audio extractions are treated as untrusted text requiring masking and user confirmation.
5. **LLM → Application State**: Model output is untrusted until validated against the Zod schema and numeric grounding rules.

---

## 3. Abuse Resistance, Request Limits & Timeouts (P3-10)

### Request Limits & Budgeting
* **Check Request Text**: Bounded to 4,000 characters.
* **RAG Question**: Bounded to 1,000 characters.
* **Incident Narrative**: Bounded to 5,000 characters.
* **Evidence Image Upload**: Bounded to 5 MB per file.
* **Evidence PDF/Audio Upload**: Bounded to 10 MB per file.

### Bounded Timeout Budgets
* **RDAP Domain Lookups**: 2,500 ms (with in-memory LRU caching).
* **RAG Retrieval & Q&A**: 3,000 ms.
* **LLM Decision Engine**: 3,000 ms (wrapped in `withTimeout`).
* **OCR Text Extraction**: 5,000 ms.
* **Speech-to-Text Audio**: 5,000 ms.

### Prevention of N+1 Calls
* Authority database and corpus vector index are loaded once into memory at module initialization.
* RDAP queries are deduplicated and cached for 5 minutes (`300,000 ms`).

---

## 4. Correctness & Data-Integrity Invariants (P3-11)

All deterministic invariants tested and verified in `src/lib/invariants.test.ts`:
1. **Calculator Invariants**:
   - Zero gain (`invested === payout`) evaluates to `tier 1` and `0%` gain.
   - Fractional durations (e.g., 1 hour = 0.0416 days) trigger overflow protection and `tier 4`.
   - `NaN`, `Infinity`, negative amounts, and zero invested/duration are rejected cleanly.
2. **Decision Engine Invariants**:
   - High-risk signals (doubling + OTP) are never masked or suppressed by benign introductory text.
   - Unspecified durations default deterministically to the 30-day baseline period.
   - Multilingual synonyms in EN, HI, and TA yield identical archetype classifications.
3. **Entity Consistency Invariants**:
   - Conflicting transaction sums and brand impersonations preserve both conflicting values in the report rather than silently overwriting them.
4. **Formatting Invariants**:
   - Currency symbols (`₹`), percentages (`%`), dates, and Unicode scripts render without encoding corruption.

---

## 5. Final Release Manifest (P3-12)

```json
{
  "application": "SANGYAN / FinanceX: Investor Resilience",
  "version": "1.0.0-rc2",
  "environment": "production",
  "buildPlatform": "Next.js 14.2 (App Router)",
  "locales": ["en", "hi", "ta"],
  "capabilities": {
    "calculator": "AVAILABLE",
    "realityLadder": "AVAILABLE",
    "scamCheck": "AVAILABLE",
    "deterministicRules": "AVAILABLE",
    "llmFusion": "AVAILABLE",
    "rdapDomainSignals": "AVAILABLE",
    "lookalikeDetection": "AVAILABLE",
    "ragGroundedQA": "AVAILABLE",
    "authorityRouter": "AVAILABLE",
    "victimIncidentIntake": "AVAILABLE",
    "entityConsistency": "AVAILABLE",
    "bilingualReport": "AVAILABLE",
    "pdfExport": "AVAILABLE",
    "evidenceSecurityGuard": "AVAILABLE",
    "ocrExtraction": "AVAILABLE",
    "sttVoiceIntake": "AVAILABLE",
    "paymentSimulator": "AVAILABLE",
    "observability": "AVAILABLE"
  },
  "privacyGuarantees": [
    "100% on-device PII masking before network dispatch",
    "Stateless server for user content; 0 bytes database retention of user reports",
    "Centralized metadata scrub in event logger",
    "Transient audio/image processing only"
  ],
  "securityControls": [
    "SSRF blocked for loopback, private CIDR, and cloud metadata hostnames",
    "Strict MIME and extension guards against SVGs and executables",
    "Dual prompt fence isolating untrusted narrative text",
    "IP rate limiting on API endpoints",
    "Hardened production HTTP security headers"
  ]
}
```

---

## 6. Full Quality Gates Verification

All quality gates passed with zero errors across all suites:

```bash
npm test          --> PASS (157/157 tests passed across 22 test suites)
npm run eval      --> PASS (100.0% Archetype Accuracy, 100.0% High-Risk Recall, 0.0% Benign False Alarms)
npm run typecheck --> PASS (0 TypeScript errors)
npm run lint      --> PASS (No ESLint warnings or errors)
npm run guardrails --> PASS (108 files scanned, 0 policy violations)
npm run smoke     --> PASS (17/17 critical user journeys verified)
npm run build     --> PASS (All 34 static and dynamic routes compiled cleanly)
```
