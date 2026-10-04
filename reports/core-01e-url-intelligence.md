# CORE-01E Implementation Report: Safe URL & Domain Intelligence

**Project**: SANGYAN / ArgusFin (Investor Resilience Infrastructure)  
**Task**: CORE-01E Safe URL & Domain Intelligence  
**Date**: October 3, 2026  

---

## 1. Executive Summary

In accordance with **TASK CORE-01E**, a deterministic, safe URL and domain intelligence subsystem (`src/lib/scam/url/`) was constructed to enrich the canonical scam-analysis engine (`analyzeScam()`).

The module provides factual structural evidence (e.g. *"The URL uses an IP address instead of a domain name"*, *"The link is shortened"*) without producing un-grounded scam accusations or maintaining malicious-domain blacklists.

---

## 2. Canonical Evidence Contract

The URL intelligence layer models URL evidence through a typed contract in `src/lib/scam/url/types.ts`:

```typescript
export interface SingleUrlEvidence {
  id: string;
  originalUrl: string;
  normalizedUrl: string;
  scheme: string;
  hostname: string;
  registrableDomain: string;
  subdomain: string;
  indicators: {
    isIpHost: boolean;
    isIdn: boolean;
    isPunycode: boolean;
    hasConfusableChars: boolean;
    hasMixedScript: boolean;
    isShortener: boolean;
    hasUserinfo: boolean;
    excessiveSubdomains: boolean;
    unknownReferenceDomain: boolean;
    ssrfBlocked: boolean;
  };
  provenance: UrlExtractionProvenance;
  untrustedExtraction: boolean;
  explanationSignals: string[];
  status: UrlAnalysisStatus;
}
```

---

## 3. Strict SSRF Protection Matrix

Server-side URL parsing enforces multi-layer SSRF safeguards before any network resolution:

| Target Category | Example Rejected Host / IP | Action Taken |
|---|---|---|
| **Loopback Addresses** | `127.0.0.1`, `localhost`, `::1` | **BLOCKED_SSRF** |
| **Private IPv4 (RFC 1918)** | `10.0.0.1`, `172.16.0.1`, `192.168.1.1` | **BLOCKED_SSRF** |
| **Link-Local & Cloud Metadata** | `169.254.169.254`, `metadata.google.internal` | **BLOCKED_SSRF** |
| **Reserved / Decimal / Hex IPs** | `0.0.0.0`, `2130706433`, `0x7f000001` | **BLOCKED_SSRF** |
| **Non-HTTP Protocols** | `file://`, `ftp://`, `gopher://` | **BLOCKED_SSRF** |

---

## 4. Privacy & Parameter Redaction

Before any URL string is passed to RAG context, logs, or user summaries, sensitive query parameters are scrubbed:
- `password=[REDACTED]`, `auth=[REDACTED]`, `otp=[REDACTED]`, `session=[REDACTED]`, `token=[REDACTED]`, `email=[REDACTED]`.
- Userinfo embedded credentials (e.g. `https://user:pass@domain.com`) generate security flags without exposing credentials.

---

## 5. Domain Allowlist & Impersonation Policy

- **Official Domain Reference Allowlist (`data/domains/trusted.json`)**: Contains official regulatory and market infrastructure domains (e.g. `sebi.gov.in`, `rbi.org.in`, `cybercrime.gov.in`, `nsdl.co.in`, `nseindia.com`, `bseindia.com`).
- **Policy**: Non-matching domains return `unknownReferenceDomain = true` and `UNKNOWN_REFERENCE_DOMAIN` status. The system NEVER labels a domain as "scam" or "impersonator" without grounded regulatory proof.

---

## 6. Execution & Benchmark Verification Results

- **Unit & Integration Tests**: 224/224 unit tests passed (`npm test`).
- **Dedicated URL Test Suite**: `src/lib/scam/url/analyze.test.ts` passed 100%.
- **URL Benchmark Harness (`npm run eval:url`)**: Passed 100% (7/7 cases).
- **SSRF Target Rejection Rate**: **100.0%**.
- **All Quality Gates**: `test`, `eval`, `eval:core`, `eval:url`, `typecheck`, `lint`, `guardrails`, `build` PASSED.
