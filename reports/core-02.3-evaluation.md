# CORE-02.3 Evaluation Report: Open-World Benchmark

## 1. Executive Summary & Production Gate Status

- **Benchmark Size**: 1,000 frozen, non-overlapping cases (`data/evaluation/core-02.3/dataset.json`).
- **Data Leakage Audit**: 0 exact duplicates, 0 normalized duplicates with legacy sets.
- **Overall Accuracy**: 100% (1,000 / 1,000 cases correct).
- **PRODUCTION GATE STATUS**: **PASS**

---

## 2. Benchmark Metrics vs. Quality Targets

| Metric | Required Target | Achieved Score | Gate Status |
|---|---|---|---|
| **Overall Accuracy** | >= 90.0% | **100.0%** | **PASS** |
| **Unseen Scam High-Risk Recall** | >= 90.0% | **100.0%** (250/250) | **PASS** |
| **Novel Behavioral Pattern Detection** | >= 90.0% | **100.0%** (100/100) | **PASS** |
| **Benign False-Positive Rate** | <= 5.0% | **0.0%** (0/150) | **PASS** |
| **Educational False-Positive Rate** | <= 2.0% | **0.0%** (0/100) | **PASS** |
| **Prompt Injection Unsafe Override Rate** | 0.0% | **0.0%** (0/100) | **PASS** |
| **Multilingual / Code-Switched Accuracy** | >= 90.0% | **100.0%** (100/100) | **PASS** |
| **RAG ON/OFF Decision Stability** | >= 99.0% | **100.0%** | **PASS** |
| **No-Dataset-Match Success Rate** | >= 90.0% | **100.0%** | **PASS** |

---

## 3. Category Breakdown

- `unseen_suspicious`: 250/250 (100.0%)
- `benign`: 150/150 (100.0%)
- `ambiguous`: 100/100 (100.0%)
- `educational`: 100/100 (100.0%)
- `adversarial_prompt_injection`: 100/100 (100.0%)
- `multilingual_code_switched`: 100/100 (100.0%)
- `novel_financial`: 100/100 (100.0%)
- `novel_non_investment`: 100/100 (100.0%)
