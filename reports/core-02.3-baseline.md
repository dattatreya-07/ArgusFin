# CORE-02.3 Baseline Audit Report: Open-World General Scam Understanding Engine

## 1. Executive Summary

This report documents the baseline architecture of SANGYAN prior to the implementation of the CORE-02.3 Open-World General Scam Understanding Engine.

While previous updates (CORE-02, CORE-02.1, CORE-02.2) established compositional reasoning and false-positive hardening on frozen benchmarks, real-world users present novel financial fraud attempts, social-engineering messages, courier scams, utility disconnection threats, and multilingual content that never appear in pre-curated JSON datasets.

The objective of CORE-02.3 is to transition SANGYAN into a true **open-world scam analyzer**, where behavioral risk analysis is **mandatory** for any input, while exact archetype classification is **optional**.

---

## 2. Current Runtime Pipeline

The canonical execution flow for content analysis is as follows:

```
[ANY INPUT] (Web POST /api/check, POST /api/ask [CONTENT_ANALYSIS], n8n POST /api/integrations/n8n/analyze)
   │
   ▼
1. Privacy Gate (`src/lib/scam/privacy.ts`, `src/lib/mask.ts`)
   - Anonymizes PII (names, phone numbers, account numbers, UPI IDs) before downstream processing.
   │
   ▼
2. Normalization (`src/lib/scam/normalize.ts`)
   - Detects language (en, hi, ta) and cleans whitespace / control characters.
   │
   ▼
3. Safe URL Intelligence (`src/lib/scam/url/index.ts`)
   - Parses URLs, performs safe domain checks, detects punycode, lookalike domains, shortened links, and SSRF prevention.
   │
   ▼
4. Deterministic Detector Adapter (`src/lib/scam/adapters/detector.ts`)
   - Extracts regex claims (`src/lib/extract.ts`), signals (`src/lib/signals.ts`), evaluates registered rules (`src/lib/rules.ts`), and runs `RulesOnlyDecisionEngine` (`src/lib/decision/rulesOnly.ts`).
   │
   ▼
5. Semantic Feature Extraction & Compositional Reasoning (`src/lib/detector/semanticExtract.ts`, `src/lib/detector/compositional.ts`)
   - Extracts behavioral features (promises, payment requests, credential asks, remote access, social pressure, impersonation, withdrawal blocks).
   - Evaluates compositional interaction rules and fuses decision bands.
   │
   ▼
6. RAG Retrieval (`src/lib/rag/index.ts`)
   - Queries grounded knowledge base (`data/rag/`) for educational citations and official verification advice.
   │
   ▼
7. Grounded Explanation Assembly (`src/lib/scam/analyze.ts`)
   - Constructs typed `AnalysisResult` containing decision band, archetype, signals, flags, grounded explanation, citations, and next steps.
```

---

## 3. Current `/api/check` Flow

- **Path**: `POST /api/check` (`src/app/api/check/route.ts`)
- **Payload**: `{ "maskedText": "...", "lang": "en" | "hi" | "ta" }`
- **Rate Limit**: 30 requests / minute per IP.
- **Processing**:
  1. Validates schema using Zod.
  2. Constructs `CanonicalInput` with `source: 'WEB_TEXT'` and `privacyStatus: 'MASKED'`.
  3. Invokes `analyzeScam(canonicalInput)`.
  4. Returns `{ band, archetype, confidence, flags, signals, unverified, explanation, citations, nextSteps, engine }`.

---

## 4. Current `/api/ask` Flow

- **Path**: `POST /api/ask` (`src/app/api/ask/route.ts`)
- **Payload**: `{ "query": "...", "lang": "en" | "hi" | "ta" }`
- **Rate Limit**: 30 requests / minute per IP.
- **Processing**:
  1. Redacts PII via `maskPII()`.
  2. Classifies intent via `classifyQueryIntent()` (`src/lib/detector/intent.ts`) into:
     - `CONTENT_ANALYSIS` (routed to `analyzeScam()`)
     - `EDUCATIONAL_QA` (routed to `askRag()`)
     - `CALCULATOR_NUMERIC`, `REPORTING`, `UNSUPPORTED`.
  3. If `CONTENT_ANALYSIS`, runs `analyzeScam()` and returns structured analysis.
  4. If `EDUCATIONAL_QA`, executes RAG search across knowledge corpus and returns verified educational answer with citations.

---

## 5. Current LLM & RAG Usage

- **LLM Usage**:
  - The runtime pipeline currently uses deterministic rule engines and local semantic extractors.
  - The LLM interface (`JevDecisionEngine`) is decoupled and acts as an optional adapter.
  - External LLM outputs are treated as untrusted inputs and are constrained by schema validation and deterministic fusion gates.
- **RAG Usage**:
  - `askRag()` searches embedded text chunks from `data/rag/`.
  - **Crucial Architecture Point**: RAG provides explanatory summary notes and official citations. It **does NOT** determine safety or risk bands. Disabling RAG does not change the risk decision (`HIGH`, `MEDIUM`, `LOW_SIGNALS`, `CANNOT_VERIFY`).

---

## 6. Current Deterministic Rules & Dataset Dependencies

### A. Deterministic Rules (`src/lib/rules/`)
- `RETURN_TOO_HIGH`: Detects promised yields >= 30% per year or daily multipliers.
- `GUARANTEED_RETURN`: Detects words like "guaranteed", "100% safe", "no risk".
- `ASKS_OTP_OR_APP_INSTALL`: Detects active requests to share OTP, PIN, password, or install AnyDesk / TeamViewer / APKs.
- `VIP_GROUP_OR_PRIVATE_CHANNEL`: Detects solicitations to join private Telegram / WhatsApp groups.
- `UNVERIFIABLE_REGISTRATION_CLAIM`: Detects claims of SEBI / RBI registration without official verification.
- `COURSE_OR_MENTORSHIP_UPSELL`: Detects paid trading courses or mentorship upsells.

### B. Dataset Dependencies (Runtime vs. Evaluation)
- **Runtime Dependencies**:
  - `data/authorities.json`: Official helpline numbers and URLs with `verified_at` dates.
  - `locales/en.json`, `locales/hi.json`, `locales/ta.json`: Localized UI strings and rule explanation texts.
  - `data/rag/*.json`: Educational corpus for RAG citations.
  - **NO JSON evaluation datasets are loaded at runtime by `/api/check` or `/api/ask`.**
- **Evaluation-Only Dependencies**:
  - `data/eval_cases.json`, `data/datasets/core-02.2/*.json`: Used strictly by evaluation scripts (`scripts/eval-*.ts`).

---

## 7. Exact Reason Previously Unseen Messages Can Fail

Previously unseen scam mechanisms can fail in a naive detector because:

1. **Keyword Over-Reliance**: If a novel scam family (e.g. electricity disconnection, fake parcel tax, fake police arrest warrant) does not contain explicit investment keywords like "guaranteed profit", "VIP group", or "crypto staking", traditional rule engines fail to trigger.
2. **Archetype Coupling**: Earlier versions attempted to force every message into one of 10 pre-defined investment archetypes (e.g. `DOUBLING_SCHEME`, `COPY_TRADING`). When a non-investment scam (such as electricity bill fraud) was analyzed, the absence of a matching archetype led to low confidence or fallback to `OTHER_OR_NONE` / `LOW_SIGNALS`.
3. **Missing Compositional Combination Rules**: Novel scams rely on combinations of behavior (e.g. `AUTHORITY_IMPERSONATION` + `URGENT_THREAT` + `PAYMENT_LINK`). If the detector evaluates signals in isolation rather than compositionally, it misses the combined threat vector.

---

## 8. 20 Representative Unseen Failure Examples

The following 20 representative real-world scam scenarios represent unseen patterns outside the legacy investment taxonomy. Prior to open-world compositional extraction, these risked being under-classified:

1. **Electricity Disconnection Scam**: "Your electricity power connection will be disconnected tonight at 9:30 PM due to unpaid bill of ₹1,450. Call 98xxxxxx or click http://bill-update.com."
2. **Fake Courier / Customs Tax**: "Your FedEx package #IN-88912 is on hold at Mumbai customs. Pay clearance tax of ₹899 via http://customs-pay-in.com to release."
3. **Fake Tax Refund**: "Income Tax Dept Notice: You are eligible for a tax refund of ₹15,400. Update your bank account details immediately at http://incometax-refund-gov.in."
4. **Fake Government Subsidy**: "PM Kisaan Yojna: Receive ₹6,000 monthly subsidy. Fill application form immediately at http://pm-kisan-subsidy.site."
5. **Fake Scholarship Fee**: "Congratulations! Selected for National Merit Scholarship ₹50,000. Pay ₹499 registration processing fee to claim."
6. **Fake Insurance Maturity Claim**: "Your LIC policy #91823 has matured with bonus ₹3,50,000. Contact agent at 91xxxxxx and pay ₹3,200 documentation fee."
7. **Fake Customer Support impersonation**: "Amazon Support: Your order #405-1923 was flagged. Call emergency helpline 98xxxxxx to unblock your account."
8. **Fake Payment Reversal Fraud**: "Dear customer, ₹25,000 accidentally credited to your GPay account from HDFC Bank. Kindly refund ₹25,000 to UPI ID refund@ybl immediately."
9. **Fake E-commerce Parcel Refund**: "Flipkart Refund Alert: Your returned item refund ₹4,999 failed. Scan this QR code to receive refund in your bank account."
10. **Fake Job Registration Fee**: "Work from home data entry job! Earn ₹2,000 daily. Pay ₹350 ID card fee to start work."
11. **Fake Digital Arrest / Police Threat**: "TRAI Alert: Your mobile number is linked to illegal illegal activities. CBI Cyber Cell officer is contacting you via video call. Do not disconnect."
12. **Fake Rental Deposit Scam**: "2BHK Flat available in Koramangala Bangalore for ₹15,000/month. Pay ₹5,000 booking token amount before visiting to confirm visit."
13. **Fake Medical Emergency Appeal**: "Emergency! Baby Aarav needs urgent heart surgery. Transfer ₹2,000 to UPI emergency-aid@upi immediately. Hospital bill attached."
14. **Fake Travel Cancellation Refund**: "IndiGo Flight Cancellation: Claim 100% refund ₹8,500. Click http://flight-refund-now.com and enter UPI PIN to receive money."
15. **Fake Social Media Blue Tick Verification**: "Meta Verification Alert: Your Instagram account will be deleted in 24 hours for copyright infringement. Verify identity at http://meta-verify-fix.com."
16. **Fake Subscription Cancellation Fee**: "Netflix Alert: Your annual subscription auto-renewed for ₹8,999. To cancel and request refund, call 98xxxxxx within 2 hours."
17. **Fake Digital Wallet Account Lock**: "Paytm KYC Warning: Your wallet account is suspended. Update PAN card details and transfer ₹10 to unfreeze."
18. **Fake Bank Account Reactivation**: "SBI Alert: Your netbanking account has been blocked. Click http://sbi-reactivate-pan.com to re-verify your mobile number."
19. **Fake Loyalty Reward Points**: "SBI Card Points: You have 14,200 unused reward points worth ₹7,100 expiring today. Redeem cash directly to bank: http://reward-sbi.top."
20. **Fake Traffic E-Challan Penalty**: "e-Challan Alert: Traffic fine ₹2,000 pending on vehicle MH-02-AB-1234. Pay within 24 hours to avoid court warrant: http://traffic-challan-pay.online."

---

## 9. Baseline Audit Conclusion

- `/api/check` and `/api/ask` do **NOT** require a JSON dataset match at runtime.
- RAG is explanatory and is **NOT** require for detection authority.
- The open-world engine must decouple **behavioral risk reasoning** from **archetype classification**, returning `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` or `UNKNOWN` whenever no known archetype fits, while preserving all risk signals and behavioral explanations.
