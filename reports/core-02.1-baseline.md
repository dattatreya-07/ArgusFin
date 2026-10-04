# CORE-02.1 — Baseline Failure & Limitation Analysis Report

**Project**: SANGYAN / FinanceX: Investor Resilience  
**Task**: CORE-02.1 Failure Reproduction & Pre-Hardening Baseline Audit  
**Date**: October 4, 2026  
**Status**: BASELINE AUDIT COMPLETED  

---

## 1. Executive Summary & Metric Reproduction

Prior to the CORE-02.1 hardening upgrade, an empirical evaluation of the CORE-02 detector across 358 corpus cases revealed key vulnerability metrics:

- **Benign False-Positive Rate**: **58.6%** (89 false alarms / 152 benign & educational cases)
- **Compositional Reasoning Accuracy**: **50.0%** (1 / 2 compositional test cases)
- **Unseen / Novel Scam Accuracy**: **75.0%** (3 / 4 unseen test cases)
- **High-Risk Scam Recall**: **96.1%** (198 / 206 scam cases)
- **Keyword-Ablation Immunity Score**: **80.0%** (4 / 5 ablation cases)

---

## 2. Failure Case Inventory & Root Cause Analysis

### A. High Benign False-Positive Rate (58.6%)
- **Root Cause**: The detector evaluated keywords (e.g. "guaranteed", "return", "10%", "G-Secs", "FD", "Sovereign Guarantee") in isolation without checking the **communicative intent** or **evidence role**.
- **Sample Failed Cases**:
  1. `core02_benign_001`: `"What is a 10% annual return on a fixed deposit?"`
     - Expected: `OTHER_OR_NONE (LOW_SIGNALS)`
     - Actual: `OTHER_OR_NONE (MEDIUM)`
     - Root Cause: Matched `10%` yield pattern without recognizing `ASKED_AS_QUESTION`.
  2. `dev-en-001` / `test-en-001`: `"Fixed Deposits (FD) offer guaranteed returns set by banks, unlike equity."`
     - Expected: `OTHER_OR_NONE (LOW_SIGNALS)`
     - Actual: `DOUBLING_SCHEME (HIGH)`
     - Root Cause: Triggered `GUARANTEED_RETURN` rule on legitimate banking product description without checking evidence role `EXPLAINED_AS_CONCEPT`.
  3. `dev-en-007` / `test-en-007`: `"Government Securities (G-Secs) are backed by Sovereign Guarantee of RBI."`
     - Expected: `OTHER_OR_NONE (LOW_SIGNALS)`
     - Actual: `DOUBLING_SCHEME (HIGH)`
     - Root Cause: Keyword match on "Guarantee" in educational context.

### B. Compositional Reasoning Failures (50.0%)
- **Root Cause**: Multi-signal scam patterns evaluated individual features independently without aggregating composite risk scores across social pressure, mentor requests, and micro-deposits.
- **Failed Case**:
  - `core02_comp_001`: `"I joined a community page. The mentor asks for a small ₹500 verification deposit before sharing trading signals."`
    - Expected: `COPY_TRADING (HIGH)`
    - Actual: `OTHER_OR_NONE (MEDIUM)`
    - Root Cause: Combined features (`community + mentor + deposit + signals`) lacked typed composite rule to elevate to `COPY_TRADING`.

### C. Unseen / Novel Scam Formulations (75.0%)
- **Failed Case**:
  - `core02_unseen_001`: `"Pay a 10% customs clearance tax via UPI to release your international crypto trading withdrawal."`
    - Expected: `FAKE_TRADING_APP_OR_PORTAL (HIGH)`
    - Actual: `OTHER_OR_NONE (MEDIUM)`
    - Root Cause: Advance withdrawal fee pattern mapped to generic fallback rather than specific fake trading platform archetype.

### D. Multilingual Archetype Mismatches
- **Failed Case**:
  - `core02_multi_002` (Tanglish): `"VIP trading group join pannunga. 100% guaranteed return kidaikkum no risk."`
    - Expected: `COPY_TRADING (HIGH)`
    - Actual: `DOUBLING_SCHEME (HIGH)`
    - Root Cause: Dominant "100% guaranteed return" keyword triggered doubling scheme instead of copy trading group archetype.

---

## 3. Pre-Hardening Baseline Summary Matrix

| Metric Dimension | CORE-02 Baseline | Core Problem to Solve in CORE-02.1 |
|---|---|---|
| **Benign False Alarms** | 58.6% | Eliminate false alarms on educational QA, banking FD/G-Sec descriptions, and scam awareness questions. |
| **Compositional Accuracy** | 50.0% | Multi-behavior interaction matrix (Mentor + Signals + Micro-deposit → Copy Trading). |
| **Evidence-Role Semantics** | Missing | Add typed roles: `CLAIMED_BY_SENDER`, `REQUESTED_FROM_USER`, `EXPLAINED_AS_CONCEPT`, `ASKED_AS_QUESTION`, `WARNING_ABOUT_SCAM`, `NEGATED`, `QUOTED_EXAMPLE`. |
| **Intent Classification** | Partial | Robust classification: `EDUCATIONAL_QA`, `CONTENT_ANALYSIS`, `CALCULATOR_NUMERIC`, `REPORTING`, `UNKNOWN`. |
| **Target FP Rate** | 58.6% | **Target < 5% Benign False Positive Rate** while maintaining **>= 95% High-Risk Recall**. |
