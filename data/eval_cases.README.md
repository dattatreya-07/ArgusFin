# Evaluation Dataset Schema (`data/eval_cases.json`)

## Dataset Specification
The evaluation dataset contains 30 labelled benchmark test cases (10 per language: English `en`, Hindi `hi`, Tamil `ta`):
- ~20 scam archetype cases
- ~5 benign/educational messages
- ~5 ambiguous or low-signal messages

## JSON Schema Definition
Each entry in the array must follow the interface:
```typescript
interface EvalCase {
  id: string; // e.g. "case-en-001"
  language: "en" | "hi" | "ta";
  input_text: string;
  expected_archetype:
    | "DOUBLING_SCHEME"
    | "COPY_TRADING"
    | "COURSE_FINFLUENCER"
    | "CRYPTO_STAKING_MINING"
    | "FAKE_TRADING_APP_OR_PORTAL"
    | "FAKE_ADVISORY_OR_REG_CLAIM"
    | "PUMP_AND_DUMP_GROUP"
    | "REMOTE_ACCESS_SCAM"
    | "FAKE_IPO_OR_ALLOTMENT"
    | "OTHER_OR_NONE";
  expected_band: "HIGH" | "MEDIUM" | "LOW_SIGNALS" | "CANNOT_VERIFY";
  notes?: string;
}
```
