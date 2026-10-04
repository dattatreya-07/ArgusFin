# CORE Evaluation Methodology & Benchmark Standards

**Project**: SANGYAN / ArgusFin (Investor Resilience Infrastructure)  
**Task**: CORE-01C Evaluation Methodology & Benchmark Specification  
**Date**: October 3, 2026  

---

## 1. Evaluation Philosophy

The SANGYAN evaluation methodology is designed around 4 core principles:
1. **Audit-First Grounding**: Decisions must be traceable to deterministic rules, verified regulatory data, or verified regulatory corpus (`data/kb/*.md`).
2. **Multi-Dimensional Metrics**: Evaluation measures precision, recall, false alarm rates, language performance, and prompt injection resistance independently. Aggregate scores are never allowed to mask language-specific failures.
3. **Multi-Channel Parity**: The same underlying financial claim must produce identical risk decisions whether received via Web Text, OCR Screenshot, STT Voice, Telegram Bot, or WhatsApp adapter.
4. **Zero Metric Gaming**: The 100-case frozen test dataset and 100-case adversarial dataset are maintained separately from development data and are never modified to fit model predictions.

---

## 2. Metric Specifications & Thresholds

| Metric Name | Mathematical Formula | Target Standard | Automated Gate Action |
|---|---|---|---|
| **Archetype Accuracy** | $\frac{\text{Correct Archetype Predictions}}{\text{Total Evaluation Cases}}$ | $\ge 90.0\%$ | Build fails if $< 90\%$ |
| **High-Risk Scam Recall** | $\frac{\text{Scams Flagged HIGH/MEDIUM}}{\text{Total Actual Scam Cases}}$ | $\ge 95.0\%$ | Build fails if $< 95\%$ |
| **Benign False Alarm Rate** | $\frac{\text{Benign Cases Flagged HIGH}}{\text{Total Benign Cases}}$ | $\le 5.0\%$ | Build fails if $> 5\%$ |
| **Prompt Injection Resistance** | $\frac{\text{Attacks Resisted Without System Override}}{\text{Total Prompt Injection Cases}}$ | $100.0\%$ | Build fails if $< 100\%$ |
| **PII Anonymization Rate** | $\frac{\text{Inputs Scrubbed Before Downstream API}}{\text{Total Inputs Containing PII}}$ | $100.0\%$ | Build fails if $< 100\%$ |

---

## 3. Failure Classification Categories

When an evaluation case fails, the harness (`scripts/eval-core.ts`) automatically classifies it into one of 5 failure categories:
- **`EXTRACTION_FAILURE`**: Failure to extract numerical returns, duration, or request flags.
- **`RULE_SEVERITY_MISMATCH`**: Rule fired with unexpected severity level.
- **`ARCHETYPE_COLLISION`**: Ambiguity between secondary signals causing incorrect top archetype selection.
- **`OCR_CORRUPTION_FAILURE`**: Character distortion (e.g. `0` vs `O`) prevented keyword pattern matching.
- **`PROMPT_INJECTION_BYPASS`**: Prompt payload successfully bypassed instruction boundaries.

---

## 4. Benchmark Execution Commands

```bash
# Run 300+ case multi-dimensional core evaluation harness
npm run eval:core

# Run legacy 30-case frozen benchmark
npm run eval

# Run full unit & integration test suite
npm test
```
