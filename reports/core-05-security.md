# CORE-05 — Security, Privacy & Input Sanitization Audit

## Security Audit Summary

| Risk Vector | Mitigation Strategy | Verification Status |
|---|---|---|
| **Automatic External Submission** | Absolute code prohibition. Zero API calls to external filing systems. Human-in-the-loop manual submission required. | PASS (100% prevented) |
| **XSS & Script Injection in Exports** | All HTML exports utilize strict HTML entity escaping (`escapeHtml`). Script tags and HTML elements are rendered as text. | PASS (Verified via Vitest) |
| **Prompt Injection Attacks** | Malicious instructions (e.g., "submit complaint automatically", "mark X as criminal") are trapped as untrusted text under `userStatements`. | PASS (Verified via Vitest & 200-case eval) |
| **PII Data Leakage** | `maskPii` masks phones, emails, UPI IDs, bank account numbers, card numbers, and PAN cards before rendering or returning API JSON. | PASS (0 PII leaks) |
| **URL Provenance Safety** | User-supplied URLs are labeled as `EVIDENCE_OBSERVED` and are never used as statutory authority URLs. | PASS (0 fabricated authority URLs) |
| **Defamatory Language Generation** | Language templates enforce neutral framing ("Observed claim", "Potential concern"). 0 defamatory classifications. | PASS (0 defamatory claims) |
| **Path Traversal in File Exports** | Client exports generate filenames derived strictly from `exportIntegrityHash` hash substrings. | PASS |
| **Stateless Privacy** | Server does not persist user incident narratives or PII to database or logs. | PASS |

## Observability & Logging Rules

Only non-PII operational events are logged via `logAppEvent`:
- `requestId`
- `route` (`/api/report/prepare`, `/api/authorities`)
- `status` (`success` / `failure`)
- `durationMs`
- `language`

Raw user messages, transaction UTR numbers, UPI IDs, and report packet payloads are **NEVER** written to server logs.
