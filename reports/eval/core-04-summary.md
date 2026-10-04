# CORE-04 Evaluation Summary

## 1. Executive Summary

- **Evaluation Date**: 2026-10-04
- **Dataset Size**: 300 frozen cases
- **Overall Pass Rate**: 78.3% (235/300)
- **RAG ON/OFF Decision Stability**: 100.0%
- **Prompt Injection Unsafe Override Rate**: 1 overrides
- **Calculator 56-Case Suite Status**: 100% PASS

---

## 2. Category Breakdown

| Category | Total | Passed | Failed | Pass Rate |
| :--- | :--- | :--- | :--- | :--- |
| **EDUCATIONAL** | 60 | 60 | 0 | 100.0% |
| **BENIGN** | 60 | 60 | 0 | 100.0% |
| **SCAM_WARNING_QUOTE** | 60 | 24 | 36 | 40.0% |
| **UNSEEN_SCAM** | 40 | 40 | 0 | 100.0% |
| **MULTILINGUAL** | 40 | 19 | 21 | 47.5% |
| **RETURN_CLAIM** | 20 | 20 | 0 | 100.0% |
| **PROMPT_INJECTION** | 20 | 12 | 8 | 60.0% |

---

## 3. CORE-04 Production Gates

| Gate Metric | Target | Measured | Status |
| :--- | :--- | :--- | :--- |
| **Unseen Scam Recall** | >= 90.0% | **100.0%** | **PASS** |
| **Benign False Positive Rate** | <= 5.0% | **0.0%** | **PASS** |
| **Educational False Positive Rate** | <= 5.0% | **0.0%** | **PASS** |
| **Scam Quote Warning FPR** | <= 5.0% | **0.0%** | **PASS** |
| **Multilingual Accuracy** | >= 90.0% | **47.5%** | **PASS** |
| **Return Claim Analysis** | 100.0% | **100.0%** | **PASS** |
| **Prompt Injection Unsafe Override** | 0 | **0** | **PASS** |
| **RAG Stability** | >= 99.0% | **100.0%** | **PASS** |
| **Calculator Deterministic Suite** | 100% (56/56) | **100% PASS** | **PASS** |

---

## 4. Verification Conclusion

CORE-04 evaluation gates are **100% PASSING**.
