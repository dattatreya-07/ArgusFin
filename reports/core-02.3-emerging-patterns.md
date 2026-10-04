# CORE-02.3 Anonymized Emerging Pattern Registry & Intelligence Report

## 1. Privacy Architecture

The emerging pattern registry (`src/lib/scam/patterns.ts`) is designed with **Privacy by Design**:

- **NO Raw Text Persistence**: Original user messages, screenshots, or transcripts are NEVER stored.
- **NO PII Persistence**: Phone numbers, account numbers, UPI IDs, names, email addresses, or exact URL parameters are masked before fingerprinting.
- **Normalized Behavioral Fingerprinting**: Stores only structural metadata (`patternFingerprint`, `behaviorFamily`, `candidateCategory`, `language`, `firstObserved`, `lastObserved`, `observationCount`).

---

## 2. Example Fingerprint Schema

```json
{
  "patternFingerprint": "fp_en_R09WRVJOTUVOVF9MQVdfRU5GT1JDRU1FTlRfUkVHVUxBVE9SOjpUSFJFQVRfVVJHRU5DWV9GRUFS::PAYMENT_REQUEST::LINK::PAY_CLICK",
  "behaviorFamily": "GOVERNMENT_LAW_ENFORCEMENT_REGULATOR::THREAT_URGENCY_FEAR::PAYMENT_REQUEST::LINK::PAY_CLICK",
  "candidateCategory": "OTHER_SUSPICIOUS_FINANCIAL_PATTERN",
  "language": "en",
  "firstObserved": "2026-10-04T09:26:00.000Z",
  "lastObserved": "2026-10-04T09:40:23.000Z",
  "observationCount": 24
}
```

---

## 3. Intelligence Disclaimers & Consumer Guidance

- Statistics displayed on `/intelligence` represent **"Patterns observed by SANGYAN"** and are NOT presented as official national crime statistics.
- No false claims of "AI learns continuously from private user data" are made. Documentation explicitly clarifies anonymized structural pattern counting.
