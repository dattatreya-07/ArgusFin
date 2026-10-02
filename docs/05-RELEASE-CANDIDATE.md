# SANGYAN / FinanceX: Investor Resilience
# Release Candidate Technical Report (P3-05 → P3-08)

**Release Candidate Version**: `1.0.0-rc1`  
**Git Remote**: `https://github.com/dattatreya-07/ArgusFin`  
**Governing Architecture**: `deterministic first → probabilistic second → generative last`

---

## 1. Executive Summary

This Release Candidate transitions SANGYAN / FinanceX from implementation milestones to a hardened, verified, observable, and defensible production system. 

All 150 test suites pass across 21 test files, baseline and adversarial benchmarks achieve 100% archetype accuracy with 0% false alarms, hard-rule guardrails scan 108 files with zero violations, SSRF/prompt-injection/upload-security defenses are validated, and the Next.js production build compiles 34 routes cleanly.

---

## 2. Release Readiness Matrix

| Capability | Status | Evidence | Known Limitation / Fallback |
|---|---|---|---|
| **Calculator** | `AVAILABLE` | `calc.test.ts` | Pure mathematical formulas; flags exponential / doubling risks |
| **Reality Ladder** | `AVAILABLE` | `data/ladder.json` | Read from static verified RBI / SEBI benchmarks |
| **Scam Check** | `AVAILABLE` | `rules.test.ts`, `collision.test.ts` | Multi-stage pipeline; degrades to rules-only on provider outage |
| **Deterministic Rules** | `AVAILABLE` | `rules.test.ts` (10 tests) | High-precision multilingual regex and lexical thresholds |
| **LLM Decision Fusion** | `AVAILABLE` | `fuse.test.ts`, `e2e.test.ts` | Server-side only; Groq Llama-3 API / fallback engine |
| **RDAP Domain Signal** | `AVAILABLE` | `signals.test.ts`, `rdap.ts` | SSRF-protected; caches results and degrades to unavailable |
| **Lookalike Detection** | `AVAILABLE` | `signals.test.ts` | Bounded Levenshtein string distance against regulated intermediaries |
| **Grounded RAG Q&A** | `AVAILABLE` | `rag.test.ts` (14 tests) | Dual prompt fence; out-of-corpus queries return "Cannot verify" |
| **Authority Router** | `AVAILABLE` | `authorities.test.ts` | Deterministic pre-filing guide; does not auto-submit complaints |
| **Victim Incident Intake** | `AVAILABLE` | `consistency.test.ts` | Structured validation; detects transaction conflicts and future dates |
| **Entity Consistency** | `AVAILABLE` | `consistency.test.ts` (8 tests) | Non-destructive cross-field validation with actionable warnings |
| **Bilingual Report** | `AVAILABLE` | `report/route.test.ts` | Structured pre-filing summary in EN / HI / TA |
| **PDF / Print Export** | `AVAILABLE` | `report/page.tsx` | Browser-native CSS print engine; 100% on-device rendering |
| **Evidence Intake** | `AVAILABLE` | `evidence.test.ts`, `security.test.ts` | Strict MIME & size guards; rejects SVGs, scripts, executables |
| **OCR Extraction** | `AVAILABLE` | `evidence.test.ts` | Deterministic local text provider; client masked before fusion |
| **STT Audio Intake** | `AVAILABLE` | `evidence.test.ts` | Browser Web Speech API (en-IN / hi-IN / ta-IN); zero audio storage |
| **Payment Simulator** | `AVAILABLE` | `e2e.test.ts`, `smoke.ts` | Interactive advance-fee escalation simulation; purely educational |
| **Localization (EN/HI/TA)**| `AVAILABLE` | `format.test.ts`, `locales/` | 100% complete and verified across all namespaces |

---

## 3. Observability & Error Taxonomy (P3-05)

### Correlation IDs
Every request across `/api/check`, `/api/ask`, `/api/authorities`, and `/api/report` generates or propagates a non-sensitive correlation ID:
```
requestId = req_<timestamp36>_<random6>
```
The `requestId` is included in all response headers and payloads for support and debugging without exposing sensitive internal state.

### Standardized Error Taxonomy
All API error responses adhere to typed error categories:
- `VALIDATION_ERROR` — Malformed inputs, schema mismatch, negative numbers.
- `RATE_LIMITED` — IP rate threshold reached (30 req / min).
- `PRIVACY_BLOCKED` — Input blocked due to unmasked raw secrets.
- `RETRIEVAL_NO_SOURCE` — Out-of-corpus query returning localized uncertainty disclaimer.
- `RETRIEVAL_UNAVAILABLE` — RAG vector store or index outage.
- `LLM_UNAVAILABLE` — Remote model unreachable; degrades to rules-only engine.
- `OCR_UNAVAILABLE` — Image extraction failure; fallback to manual input.
- `STT_UNAVAILABLE` — Audio recognition failure; fallback to keyboard input.
- `PDF_GENERATION_ERROR` — Print layout failure; fallback to plaintext download.
- `INTERNAL_ERROR` — Unexpected server exception.

### Centralized Boundary Redaction
All events processed by `logAppEvent()` pass through `sanitizeEventMetadata()` which drops blacklisted keys (`key`, `secret`, `token`, `otp`, `audio`, `password`) and runs string values through `maskPII()`.

---

## 4. Reliability & Failure Injection (P3-06)

Deterministic failure-injection testing in `src/lib/failure-injection.test.ts` validates:
1. **LLM Provider Timeout**: `withTimeout` intercepts slow calls (3000ms deadline) and triggers fallback to `RulesOnlyDecisionEngine` without crashing.
2. **RAG Empty Retrieval**: Out-of-scope market prediction queries return `NO_SOURCE` with localized "I can't verify this from official sources" disclaimer, refusing to fabricate answers.
3. **Authority Data Outage**: Empty or missing inputs return `NO_MATCH` with structured disclaimers rather than inventing contact numbers.
4. **Data Conflict Detection**: Inconsistent transaction sums or future dates are flagged explicitly without failing silently.
5. **Payload Sanitization**: 0-byte files, `.svg` script payloads, and `.exe` binaries are immediately rejected with typed error codes.

---

## 5. Security & SSRF Verification (P3-07)

1. **SSRF Protections**:
   - `extractAndNormalizeDomain()` strictly blocks `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`, `169.254.169.254` (cloud metadata), `metadata.google.internal`, private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), `.local`, `.internal`, and `.lan` domains.
   - RDAP queries are bounded with a 2500ms timeout, LRU in-memory caching, and error handling.
2. **Prompt-Injection Resistance**:
   - User inputs in LLM prompts are isolated inside `<INCIDENT_DATA>` and `<USER_QUERY>` inert blocks with system instructions preventing jailbreaks.
3. **Upload Guard**:
   - Rejects SVGs, executables, HTML scripts, and files exceeding 5MB (images) / 10MB (PDF/Audio).
4. **Secret Leakage Prevention**:
   - Public health endpoint `GET /api/health` audits configuration flags (`CONFIGURED` / `NOT_CONFIGURED`) without exposing API keys.

---

## 6. Full Quality Gates Summary (P3-08)

```bash
# 1. Vitest Unit, Integration & Security Tests (21 suites, 150 tests)
npm test          --> PASS (150/150 tests passed, 0 failures)

# 2. Decision Benchmark Harness (30 baseline cases + 12 adversarial cases)
npm run eval      --> PASS (100.0% Archetype Accuracy, 100.0% Recall, 0.0% False Alarms)

# 3. TypeScript Strict Typecheck
npm run typecheck --> PASS (0 type errors)

# 4. Next.js ESLint Check
npm run lint      --> PASS (No ESLint warnings or errors)

# 5. Automated Guardrail Scanner (108 files)
npm run guardrails --> PASS (0 rule violations)

# 6. Production Smoke Test Suite (17 critical user journeys)
npm run smoke     --> PASS (100% assertions passed)

# 7. Next.js Production Build (34 static/dynamic routes)
npm run build     --> PASS (87.3 kB shared First Load JS)
```

---

## 7. Release Recommendation

The SANGYAN / FinanceX codebase is **RELEASE-READY (Release Candidate 1)**. All 9 Hard Rules and investor-protection guardrails are strictly enforced, multilingual support is complete across English, Hindi, and Tamil, failure states degrade deterministically, and application observability collects zero user PII.
