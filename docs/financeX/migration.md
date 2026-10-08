# FinanceX Phase 0 Foundation Migration Guide

**Project:** FinanceX Migration  
**From:** ArgusFin Baseline  
**To:** FinanceX Foundation (Learn + Protect + Prove)  

---

## 1. Migration Overview

The Phase 0 migration establishes FinanceX domain boundaries while preserving 100% of working ArgusFin scam detection capabilities, tests, evaluation suites, and guardrails.

```
ArgusFin Core Scam Engine -----> Wrapped in FinanceX Shield Facade (financeX/shield/)
                                          |
                                          v
                              FinanceX Product Shell
                              ├── Learn (Academy)
                              ├── Protect (ArgusFin Shield)
                              └── Prove (Web3 Trust Layer Boundary)
```

---

## 2. Key Migration Rules

1. **No Core Engine Rewrite:** `src/lib/scam/analyze.ts` remains the single canonical analysis engine.
2. **No Test Breakage:** All 52 Vitest files (400 tests) and guardrail scanners remain untouched and passing.
3. **No Fake Blockchain Data:** Web3 adapters in Phase 0 return explicit `NOT_IMPLEMENTED` statuses rather than generating fake transaction hashes or false mint confirmations.
4. **No Investment Advice:** Preserves strict non-advisory disclosures and grounded SEBI/RBI benchmark comparisons.

---

## 3. Directory Mapping

| Legacy / Subsystem Component | New Domain Seam | Purpose |
| :--- | :--- | :--- |
| `src/lib/scam/analyze.ts` | `src/lib/financeX/shield/index.ts` | Protection subsystem facade. |
| `src/lib/education/` | `src/lib/financeX/academy/index.ts` | Academy & progress tracking. |
| `New Seam` | `src/lib/financeX/prove/index.ts` | Web3 trust layer contracts. |
| `src/lib/types.ts` | `src/lib/financeX/types.ts` | Domain model re-exports & extension. |
| `New Seam` | `src/lib/financeX/config.ts` | Centralized product feature flags. |
