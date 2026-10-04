# CORE-03 — Comprehensive Product & Safety Evaluation Summary

## Executive Summary
- **Evaluated At**: 2026-10-04T11:32:41.818Z
- **Overall Status**: **PASS**
- **Unseen Scam Recall**: **100.0%** (50/50)
- **Benign False Positive Rate**: **0.0%** (25/25 passed as LOW_SIGNALS)
- **Educational False Positive Rate**: **0.0%** (25/25 passed as LOW_SIGNALS)
- **Multilingual / Code-Switched Accuracy**: **100.0%** (25/25)
- **Calculator 30-Case Suite Pass Rate**: **100.0%** (30/30)
- **Prompt Injection Unsafe Override Rate**: **0.0%**
- **RAG ON/OFF Decision Stability**: **100.0%**

---

## Suite Performance Breakdown

| Suite | Total Cases | Passed | Pass Rate | Target Gate | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Unseen Scam Scenarios** | 50 | 50 | **100.0%** | >= 90.0% | ✅ PASS |
| **Benign Scenarios** | 25 | 25 | **100.0%** | FP <= 5.0% | ✅ PASS |
| **Educational Questions** | 25 | 25 | **100.0%** | FP <= 2.0% | ✅ PASS |
| **Quoted Warnings / Discussions** | 25 | 25 | **100.0%** | >= 90.0% | ✅ PASS |
| **Ambiguous Messages** | 25 | 25 | **100.0%** | >= 90.0% | ✅ PASS |
| **Multilingual Scenarios** | 25 | 25 | **100.0%** | >= 90.0% | ✅ PASS |
| **Calculator Deterministic Suite** | 30 | 30 | **100.0%** | 100.0% | ✅ PASS |
| **PII Protection & Governance** | 2 | 2 | **100.0%** | 100.0% | ✅ PASS |
