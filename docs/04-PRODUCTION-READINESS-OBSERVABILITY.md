# SANGYAN / FinanceX: Investor Resilience
# Production Readiness, Observability & Threat Model (Phase 3)

## 1. Production Readiness Contract

| Capability | Input | Output | Failure Mode | Fallback | Privacy Boundary | Test Coverage | External Dependency |
|---|---|---|---|---|---|---|---|
| **Promise-to-Reality Calculator** | Principal, Payout, Duration | Annualized Multiple, Tier, Explanation | Non-numeric or negative input | Graceful validation error (`CALC_INVALID_INPUT`) | Purely local execution in client/server | `calc.test.ts` (100%) | None (Deterministic math) |
| **Reality Ladder** | Annualized Multiple | Benchmark Comparison (FD, Nifty, High Risk) | Out of bounds | Nearest standard benchmark band | Read from static verified JSON (`data/ladder.json`) | `calc.test.ts` | None |
| **Scam / Claim Check** | Raw user text / OCR / STT | Risk Band (`HIGH`, `MEDIUM`, `LOW_SIGNALS`, `CANNOT_VERIFY`), Archetype, Signals, Reasons | LLM timeout or missing API key | Deterministic Multilingual Rules Engine (`RulesOnlyDecisionEngine`) | Client-side PII Masking before network transfer | `rules.test.ts`, `e2e.test.ts`, `collision.test.ts` | Optional Groq LLM (fallback active) |
| **Grounded Regulatory RAG Q&A** | Query string (EN/HI/TA) | Answer grounded in SEBI/RBI/MHA chunks with exact citations | No source found / Advice requested | `NO_SOURCE` response: "I cannot verify this from official sources" | Dual prompt fence; zero raw PII logged | `rag.test.ts`, `ask/route.test.ts` | None (Local TF-IDF Vector Index) |
| **Authority Router** | Amount, Hours, Loss Type, Channel | Categorized routes, Helplines (1930), Action Guides | Unknown category | General grievance guide + Portal links | Deterministic JSON rules | `authorities.test.ts` | None (`data/authorities.json`) |
| **First-Victim Incident Intake** | Narrative, Dates, Txs, Channels | Structured JSON summary, Consistency warnings | Inconsistent amounts or future dates | Structured `ConsistencyIssue` warnings | Local form state; zero server persistence | `incident/consistency.test.ts` | None |
| **Bilingual Report / PDF** | Form state & Authority routes | Print-ready HTML / Save-as-PDF view | Client print failure | Browser fallback plaintext download | On-device rendering | `report/route.test.ts` | Browser Print API |
| **Evidence Intake & Security Guard** | Files (PNG, JPG, PDF, TXT) | Extracted text / Validated payload | Oversized, SVG, Executables | Immediate rejection with `SECURITY_RISK` code | Prohibits SVGs, scripts, and executables | `evidence.test.ts`, `security.test.ts` | None |
| **OCR Text Extraction** | Image buffer / Screenshot | Masked OCR text transcript | Unrecognized glyphs | Manual text input fallback | Processed on-device or masked before fusion | `evidence.test.ts` | Local OCR provider |
| **Voice / STT Intake** | Microphone stream (EN/HI/TA) | Transcribed text | Web Speech API unsupported | Standard keyboard input | Transient audio buffer; zero audio storage | `evidence.test.ts` | Browser Web Speech API |
| **Payment Escalation Simulator** | Scenario step actions | Escalation calculation, Stop trigger guidance | User abort | Immediate safe stopping takeaway | Static educational scenarios | `payment.test.ts`, `e2e.test.ts` | None |
| **Localization** | Active locale (`en`, `hi`, `ta`) | Translated UI & Messages | Missing translation key | Fallback to English key | Static JSON catalogs (`locales/`) | `format.test.ts` | `next-intl` |

---

## 2. Observability & Privacy-Safe Event Model

The SANGYAN architecture is **stateless for user content**. Observability answers *operational health* without collecting PII.

### Event Schema (`AppEvent`)
```ts
export type AppEvent = {
  name: string;
  timestamp: string;
  requestId: string;
  durationMs?: number;
  status: 'success' | 'failure' | 'unavailable' | 'timeout';
  language?: 'en' | 'hi' | 'ta';
  subsystem?: 'check' | 'ask' | 'authorities' | 'report' | 'evidence' | 'payment';
  errorCode?: ErrorCategory;
};
```

### Standardized Error Taxonomy (`ErrorCategory`)
1. `VALIDATION_ERROR` — Invalid types, missing fields, negative amounts.
2. `PRIVACY_BLOCKED` — Content rejected due to unmasked raw secrets.
3. `RATE_LIMITED` — Token bucket / IP rate limiter triggered.
4. `PROVIDER_UNAVAILABLE` — Optional remote LLM/API unreachable.
5. `PROVIDER_TIMEOUT` — Call exceeded bounded latency deadline (3000ms).
6. `RETRIEVAL_NO_SOURCE` — Query had no matching verified regulatory chunks.
7. `RETRIEVAL_FAILURE` — Vector store or index processing fault.
8. `LLM_FAILURE` — Remote model error or malformed completion JSON.
9. `OCR_FAILURE` — Visual text extraction parse failure.
10. `STT_FAILURE` — Speech recognition error or unsupported codec.
11. `EXPORT_FAILURE` — Document or PDF rendering error.
12. `INTERNAL_ERROR` — Unexpected unhandled server exception.

---

## 3. Threat Model & Trust Boundaries

```
[ Unstrusted Browser Client ]
        │ (Raw User Input, Images, Audio)
        ▼  [ BOUNDARY 1: Client-side Masking & Validation ]
  (Masked PII Tokens: [PHONE], [UPI], [ACCOUNT_OR_ID], [EMAIL], [PAN])
        │
        ▼  [ BOUNDARY 2: Next.js API Routes & Rate Limiter ]
  (/api/check, /api/ask, /api/report, /api/authorities, /api/health)
        │
        ├─────────────────────────────┬─────────────────────────────┐
        ▼                             ▼                             ▼
 [ Decision Engine ]          [ RAG TF-IDF Index ]      [ Authority Router ]
 (Rules + Signals)            (Dual Prompt Fence)       (Static Verified Data)
        │                             │
        ▼ (Optional Fallback)          ▼
 [ External LLM (Groq) ]       [ Grounding Check ]
 (Only receives masked text)   (Numeric & Citation Verify)
```

### Attack Surfaces & Security Controls
* **Prompt Injection**: All user input in RAG/LLM contexts is wrapped in inert XML blocks (`<INCIDENT_DATA>`, `<USER_QUERY>`) with explicit system guardrails prohibiting instruction overrides.
* **XSS Payloads**: React DOM automatic JSX escaping + strict CSP headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`).
* **Malicious File Uploads**: Rejection of `.svg`, `.exe`, `.apk`, `.js`, `.py`, HTML payloads, and files exceeding 5–10MB limits.
* **Secret Leakage**: Environment variables validated server-side. Public `/api/health` probes output configuration presence (`CONFIGURED` / `NOT_CONFIGURED`) without exposing API keys.

---

## 4. Data Retention & Statelessness Audit

* **User Submissions**: Never stored in databases, flat files, Redis, or persistent logs.
* **Session State**: Held exclusively in client-side React memory.
* **Incident Reports**: Generated and downloaded on the victim's device. SANGYAN server retains 0 bytes of incident reports.
* **Logs**: Retain only anonymous operational metadata (`status`, `durationMs`, `subsystem`, `requestId`, `errorCode`).

---

## 5. Bounded Timeout & Non-Retry Policies

* All external provider invocations are wrapped in `withTimeout(promise, 3000ms, fallback)`.
* **No Blind Retries**: Validation errors, privacy blocks, prompt injection attempts, and unsupported formats fail immediately without retry storms.
* **Deterministic Fallback**: In the event of network disruption or provider failure, the application degrades gracefully to deterministic rules and localized "cannot verify" safe states.
