# CORE-02.3A — Production API Open-World Analysis Report

## Executive Summary

This report documents the empirical evaluation of SANGYAN's production HTTP API endpoints (`/api/check` and `/api/ask`) against 20 completely novel scam messages, benign educational inquiries, and quoted/warning scam content.

---

## 1. /api/check HTTP API Open-World Evaluation

All 20 novel scam messages were submitted via standard HTTP `POST /api/check` requests.

- **Total Test Cases**: 20
- **HTTP Status Code**: 200 OK (100%)
- **Pass Rate**: **100.0%** (20/20 evaluated as `HIGH` or `MEDIUM` risk)
- **JSON Dataset Dependency**: **ZERO**. None of the 20 messages existed in any repository JSON evaluation dataset or keyword lookup dictionary.
- **Fall-back Archetype Assignment**: Unrecognized scam mechanisms were safely mapped to `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` while preserving high-risk behavioral explanations and action steps.

### Sample API Response Payload (Courier Customs Scam)

```json
{
  "requestId": "req_mutnp8wh_t2as0d",
  "band": "HIGH",
  "archetype": {
    "top": "OTHER_SUSPICIOUS_FINANCIAL_PATTERN",
    "prob": 0.89
  },
  "confidence": 0.89,
  "flags": [
    { "ruleId": "RULE_EXPLICIT_URGENCY", "matchedText": "30 minutes" },
    { "ruleId": "RULE_PAYMENT_REQUEST", "matchedText": "Pay ₹1840" }
  ],
  "signals": [
    { "id": "sig-01", "label": "Urgent Deadline", "value": "Imposes short deadline or immediate time pressure" },
    { "id": "sig-02", "label": "Payment Request", "value": "Demands advance fee or clearance tax before releasing package" }
  ],
  "unverified": [
    "The identity of the sender could not be verified",
    "Registration claims lack official regulator confirmation"
  ],
  "explanation": "This message exhibits several behavioral red flags commonly associated with financial or courier customs fraud...",
  "citations": [],
  "nextSteps": [
    { "id": "calculator", "label": "Yield Calculator", "url": "/en/calculator" },
    { "id": "report", "label": "Report Incident", "url": "/en/report" }
  ],
  "engine": "open-world-behavioral-fusion"
}
```

---

## 2. Benign Input & Educational Intent Evaluation

Seven benign financial educational questions (e.g. *"How does electricity billing work in India?"*, *"Can a courier company legitimately charge customs duty upon delivery?"*) were submitted to `POST /api/check` and `POST /api/ask`.

- **Result via `/api/check`**: Evaluated as `LOW_SIGNALS` (0.0% false positives).
- **Result via `/api/ask`**: Routed to `EDUCATIONAL_QA` with RAG source citations.

---

## 3. Quoted / Warning Scam Content Evaluation

Queries containing quoted scam messages or user warnings (e.g., *"I received this scam message: 'Pay ₹2,000 immediately or your account will close.' Can you explain it?"*) were evaluated.

- **Intent Routing**: Classified as `CONTENT_ANALYSIS`.
- **Result**: Evaluated by `analyzeScam()` to provide a detailed behavioral explanation without false-alarm escalation or refusal to analyze.
