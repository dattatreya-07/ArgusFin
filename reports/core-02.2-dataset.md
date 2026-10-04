# CORE-02.2 — Frozen Dataset Specification & Leakage Audit Report

**Project**: SANGYAN / FinanceX: Investor Resilience  
**Task**: CORE-02.2 Frozen Dataset Specification & Audit  
**Date**: October 4, 2026  
**Status**: DATASET COMMITTED & AUDITED  

---

## 1. Frozen Benchmark Splits (`data/datasets/core-02.2/`)

The CORE-02.2 frozen benchmark consists of **800 static, committed JSON cases**:

```
data/datasets/core-02.2/
├── frozen_benign.json       (250 Independently Authored Benign Cases)
├── frozen_scam.json         (300 Independently Authored Scam Cases)
├── frozen_unknown.json      (100 Novel / Unseen Suspicious Behavior Cases)
└── frozen_adversarial.json  (150 Adversarial & Prompt Injection Cases)
```

---

## 2. Leakage & Overlap Audit Results

Automated audit (`npm run audit:core-02.2`) results:
- **Total Frozen Cases**: 800
- **Exact Text Duplicates**: **0**
- **Normalized Text Duplicates**: **0**
- **Cross-Split Legacy Overlap**: **1** (single reference benchmark case)
- **Genuinely Independent New Cases**: **799**
