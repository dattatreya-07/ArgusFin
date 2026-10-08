# FinanceX Phase 3 Security & Privacy Architecture Report

## 1. Zero PII Exposure Invariant

FinanceX maintains a strict on-device and privacy-by-design architecture across all subsystems:

1. **Client-Side Masking (`maskPII`):**
   - Phone numbers, account numbers, Aadhaar/PAN formats, UPI handles, and personal names are masked prior to submission or external processing.
2. **Stateless Server Processing:**
   - The server does not persist raw user message content or personally identifiable incident data.
3. **Web3 Privacy Invariant:**
   - No PII is placed on-chain. On Polygon Amoy, only deterministic cryptographic SHA-256 hashes of canonical evidence packets are anchored.

---

## 2. API & Integration Security

1. **Timing-Safe Authentication:**
   - `crypto.timingSafeEqual` prevents side-channel timing attacks when verifying `x-n8n-secret` tokens.
2. **SSRF Protection:**
   - URL resolution blocks private IP blocks, loopback addresses (`127.0.0.1`, `localhost`), and link spoofing.
3. **Prompt-Injection Resistance:**
   - The decision engine is deterministic and cannot be overridden by prompt injection payloads in user text.

---

## 3. Regulatory & Educational Compliance

- **No Investment Advice:** Hard rule enforced across all routes, simulators, and AI Tutor modes.
- **Authoritative Citations:** Every rate, rule, and guideline links directly to official SEBI, RBI, or I4C publications.
- **Zero Automatic Complaint Filing:** Incident report packets are prepared locally for user verification and manual submission on official portals (1930 / cybercrime.gov.in).
