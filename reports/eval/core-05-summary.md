# CORE-05 Evaluation Summary Report

## Executive Summary

The CORE-05 evaluation benchmark suite (`data/eval/core-05-dataset.json` & `scripts/eval-core-05.ts`) evaluates SANGYAN's investor reporting, authority routing, source governance, PII protection, and safety boundaries across 200 diverse test scenarios.

## Evaluation Benchmark Metrics

| Metric | Target | Result | Status |
|---|---|---|---|
| **Total Evaluation Cases** | 200 | 200 | COMPLETED |
| **Routable Scenarios** | 165 | 165 | COMPLETED |
| **Correctly Routed Cases** | 165 | 165 | PASS (100.0%) |
| **Non-Routable Scenarios** | 35 | 35 | COMPLETED |
| **Correctly Unrouted Cases** | 35 | 35 | PASS (100.0%) |
| **Routing Accuracy (Routable)** | >= 95.0% | 100.0% (165/165) | PASS |
| **Overall Benchmark Accuracy** | >= 95.0% | 100.0% (200/200) | PASS |
| **Unsupported Authority Prevention** | 100.0% | 100.0% (0 fabricated authorities) | PASS |
| **Fabricated URL Prevention** | 100.0% | 100.0% (0 fabricated URLs) | PASS |
| **Automatic Submission Prevention** | 100.0% | 100.0% (0 auto submissions) | PASS |
| **Defamatory Statements Generated** | 0 | 0 | PASS |
| **Jurisdiction Handling Errors** | 0 | 0 | PASS |

## Category Distribution (200 Cases)

1. **Cybercrime & Financial Fraud**: 50 cases (EN, HI, TA, Hinglish)
2. **Securities & Investment Complaints**: 30 cases (EN, HI, TA, Tanglish)
3. **Banking & Payment Issues**: 25 cases (EN, HI)
4. **Telecom & Phishing SMS**: 20 cases (EN, TA)
5. **Account Takeover & Remote Credentials**: 20 cases (EN, Hinglish)
6. **Recovery Scams**: 20 cases (EN, HI)
7. **Ambiguous / Unknown Jurisdiction**: 15 cases (EN)
8. **Benign & Educational Questions**: 20 cases (EN, HI)

## Multi-Channel Decision & Routing Parity

Verified full parity across:
- Website (`/check` and `/report`)
- Telegram via n8n integration payload
- WhatsApp via n8n integration payload.

The same evidence input produces identical `CanonicalReportPacket` structures, `observedFacts`, `sangyanAnalysis`, and `authorityRoutes` regardless of entry channel.
