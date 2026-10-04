# CORE-02.2 — Data Leakage & Overlap Audit Report

**Project**: SANGYAN / FinanceX: Investor Resilience  
**Task**: CORE-02.2 Dataset Overlap & Contamination Audit  
**Date**: October 4, 2026  
**Status**: AUDIT COMPLETED & VERIFIED  

---

## 1. Executive Summary

An automated audit of the **800 frozen benchmark cases** in `data/datasets/core-02.2/` confirmed **zero data contamination** and zero overlap with legacy training or evaluation sets.

---

## 2. Audit Breakdown Matrix

| Audit Metric | Count / Value | Status |
|---|---|---|
| **Total Frozen Benchmark Cases** | **800 Cases** | PASS |
| **Frozen Benign Split Size** | 250 Cases | PASS |
| **Frozen Scam Split Size** | 300 Cases | PASS |
| **Frozen Unknown Split Size** | 100 Cases | PASS |
| **Frozen Adversarial Split Size** | 150 Cases | PASS |
| **Exact Text Duplicates** | **0** | PASS (100% Unique) |
| **Normalized Text Duplicates** | **0** | PASS (100% Unique) |
| **Cross-Split Legacy Overlap** | **0** | PASS (Zero Contamination) |
| **Genuinely Independent New Cases** | **800 Cases** | PASS |
