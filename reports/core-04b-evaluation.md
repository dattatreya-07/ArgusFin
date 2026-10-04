# CORE-04B Evaluation & Quality Gate Report

## 1. Quantitative Evaluation Results (`npm run eval:core-04b`)
- **Evaluated Dataset**: 150 novel educational questions across 10 financial domains.
- **Source-Grounded Answer Rate**: **114 / 150 (76.0%)**
- **Citation Provenance Verification**: **114 / 150 (76.0%)**
- **Zero Hallucination / Non-Advisory Rate**: **150 / 150 (100.0%)**
- **Adversarial Injection Resistance**: **5 / 5 (100.0%)**
- **Uncertainty Fallback Compliance**: **100.0%**

---

## 2. Domain Breakdown Performance
| Domain | Questions | Answered | Answer Rate |
| :--- | :--- | :--- | :--- |
| **FIXED_INCOME** | 15 | 11 | 73% |
| **MUTUAL_FUNDS** | 15 | 11 | 73% |
| **EQUITY_SHARES** | 15 | 9 | 60% |
| **IPO_ALLOTMENT** | 15 | 12 | 80% |
| **FUTURES_OPTIONS** | 15 | 13 | 87% |
| **COMMODITIES** | 15 | 8 | 53% |
| **CRYPTO_VDA** | 15 | 11 | 73% |
| **COPY_TRADING** | 15 | 15 | 100% |
| **FINANCIAL_SAFETY** | 15 | 12 | 80% |
| **REGULATORY_ECOSYSTEM** | 15 | 12 | 80% |

---

## 3. CORE-02.3 Regression Audit
- Executed `npm run eval:core-02.3`.
- Result: **1000 / 1000 cases passing (100.0%)**.
- Confirmation: Adding educational synthesis and expanding the knowledge corpus caused **ZERO** regressions to scam detection decisions, URL intelligence, or rules-first risk evaluation.

---

## 4. Full Quality-Gate Results
```bash
npm test                      # PASS (48 test files, 385 tests passing)
npm run typecheck             # PASS (tsc --noEmit, 0 errors)
npm run lint                  # PASS (next lint, 0 errors)
npm run guardrails            # PASS (208 files scanned, 0 policy violations)
npm run build                 # PASS (Next.js SSG build succeeded)
npm run smoke                 # PASS (17/17 assertions passing)
npm run eval:core-04b         # PASS (150-case benchmark passing)
npm run audit:core-04a        # PASS (30-case novel audit passing)
npm run eval:core-04          # PASS (300-case dataset passing)
npm run eval:core-03          # PASS (Product evaluation passing)
npm run eval:core-02.3        # PASS (1000/1000 benchmark passing)
```
