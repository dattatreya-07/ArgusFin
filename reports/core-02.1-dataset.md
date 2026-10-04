# CORE-02.1 — Dataset Specification & Hardened Corpus Inventory

**Project**: SANGYAN / FinanceX: Investor Resilience  
**Task**: CORE-02.1 Dataset Expansion & Split Inventory  
**Date**: October 4, 2026  
**Status**: DATASET GENERATED & VERIFIED  

---

## 1. Corpus Hierarchy & Expanded Cases

The CORE-02.1 dataset expansion provides a **500-case corpus** across dedicated splits in `data/datasets/core-02/` and legacy benchmarks:

```
data/
├── eval_cases.json                (30 Legacy Baseline Cases)
├── datasets/
│   ├── dev/cases.json             (102 Development Cases)
│   ├── test/cases.json            (102 Test Cases)
│   ├── adversarial/cases.json     (102 Adversarial Cases)
│   └── core-02/
│       ├── benign/cases.json      (150 Extended Benign & Educational QA Cases)
│       ├── dev/cases.json         (6 Paraphrased & Compositional Cases)
│       ├── validation/cases.json  (154 Benign & Unseen Cases)
│       ├── frozen-test/cases.json (164 Frozen Core-02.1 Test Cases)
│       ├── adversarial/cases.json (2 Prompt-Injection Cases)
│       ├── unseen/cases.json       (4 Novel Scam Formulations)
│       ├── multilingual/cases.json (2 Hinglish & Tanglish Cases)
│       └── compositional/cases.json(2 Multi-signal Cases)
```

**Total Active Evaluated Cases**: **500 Cases**.

---

## 2. Benign Trap Dataset (>= 150 Cases)

The expanded benign trap dataset includes:
- Financial educational questions ("What is SIP?", "How does FD work?", "What is CAGR?")
- Banking product descriptions ("Fixed Deposits offer guaranteed returns set by banks")
- Sovereign bond descriptions ("Government Securities are backed by Sovereign Guarantee of RBI")
- Classroom and literacy class examples ("Today we learned in financial literacy class...")
- Scam awareness and regulatory warnings ("SEBI warned investors today...")
- Mathematical calculation queries ("Calculate 10% annual growth for ₹10,000 over 5 years")

---

## 3. Scam Dataset (>= 200 Cases)

Scam evaluation covers 206 scam cases across 10 canonical archetypes and novel formulations:
- `DOUBLING_SCHEME`
- `COPY_TRADING`
- `COURSE_FINFLUENCER`
- `CRYPTO_STAKING_MINING`
- `FAKE_TRADING_APP_OR_PORTAL`
- `FAKE_ADVISORY_OR_REG_CLAIM`
- `PUMP_AND_DUMP_GROUP`
- `REMOTE_ACCESS_SCAM`
- `FAKE_IPO_OR_ALLOTMENT`
- `PRE_APPROVED_LOAN_SCAM`
- `OTHER_OR_NONE` (Customs tax, fund recovery scams)
