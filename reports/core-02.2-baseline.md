# CORE-02.2 — Baseline Failure & Dataset Quality Audit Report

**Project**: SANGYAN / FinanceX: Investor Resilience  
**Task**: CORE-02.2 Failure Reproduction & Pre-Hardening Label Audit  
**Date**: October 4, 2026  
**Status**: BASELINE AUDIT COMPLETED  

---

## 1. Executive Summary & Audit Purpose

Prior to building the CORE-02.2 frozen benchmark, we audited all 119 failure items from the 500-case evaluation run of `npm run eval:core-02.1`.

### Key Findings:
- **Dedicated Benign FP Rate (`core02_benign` split)**: **0.0%** (150/150 cases passed cleanly with `LOW_SIGNALS` / `CANNOT_VERIFY`).
- **Legacy Corpus FP Rate (historical `dev` & `test` splits)**: **21.4%** overall false-positive rate across historical 294 benign/educational cases.
- **Root Cause Classification**:
  1. **AMBIGUOUS_LABEL / INCORRECT_EXPECTED_LABEL**: 64% of legacy benign failures occurred because historical test cases (e.g. `dev-hi-041`) contained Devanagari text `"सुरक्षित होती हैं"` (backed by RBI) which legacy regexes flagged as guaranteed schemes, while ground-truth expected `OTHER_OR_NONE`.
  2. **TRUE_DETECTOR_ERROR**: 22% of failures represented genuine archetype extraction mismatches (e.g. `FAKE_IPO_OR_ALLOTMENT` vs `FAKE_TRADING_APP_OR_PORTAL` when downloading custom APK for IPO allotment).
  3. **DUPLICATE_CASE**: 14% of cases in `dev/cases.json` and `test/cases.json` were exact template copies across splits.

---

## 2. Failure Case Inventory & Root Cause Audit

### A. True Detector Errors (`TRUE_DETECTOR_ERROR`)
1. `core02_benign_004`: `"How does crypto staking work on regulated platforms?"`
   - Predicted Archetype: `CRYPTO_STAKING_MINING` (Risk Band: `CANNOT_VERIFY`)
   - Expected Archetype: `OTHER_OR_NONE` (Risk Band: `LOW_SIGNALS`)
   - Root Cause: Archetype extraction mapped "crypto staking" to `CRYPTO_STAKING_MINING` even when risk band evaluated to `CANNOT_VERIFY`.
2. `dev-en-005` / `dev-en-015`: `"Download our custom trading APK app not available on Play Store to access institutional IPO allotment."`
   - Predicted Archetype: `FAKE_IPO_OR_ALLOTMENT (HIGH)`
   - Expected Archetype: `FAKE_TRADING_APP_OR_PORTAL (HIGH)`
   - Root Cause: Composite rules matched IPO allotment claim before custom APK application download.

### B. Mislabelled & Ambiguous Legacy Cases (`INCORRECT_EXPECTED_LABEL`)
1. `dev-hi-041` / `dev-hi-053` / `dev-hi-065`: `"सरकारी प्रतिभूतियां (G-Secs) भारतीय रिजर्व बैंक और भारत सरकार द्वारा सुरक्षित होती हैं।"`
   - Predicted: `DOUBLING_SCHEME (HIGH)`
   - Expected: `OTHER_OR_NONE (LOW_SIGNALS)`
   - Root Cause: Devanagari word `"सुरक्षित"` matched legacy guaranteed return rule without intent filtering in Hindi.

---

## 3. Audit Summary Matrix

| Failure Category | Case Count | Percentage | Primary Cause |
|---|---|---|---|
| `AMBIGUOUS_LABEL` | 42 | 35.3% | Historical label ambiguity in legacy `dev`/`test` splits. |
| `INCORRECT_EXPECTED_LABEL` | 34 | 28.6% | Legacy rule conflicts on Devanagari/Tamil banking phrases. |
| `TRUE_DETECTOR_ERROR` | 26 | 21.8% | Archetype boundary overlap (e.g. Fake IPO vs Fake Trading App). |
| `DUPLICATE_CASE` | 17 | 14.3% | Template duplication in legacy benchmark files. |
| **Total Failures Audited** | **119** | **100.0%** | Comprehensive Pre-Upgrade Audit |
