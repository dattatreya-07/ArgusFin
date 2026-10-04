# CORE Dataset Card: Scam Intelligence & Evaluation Corpus

**Project**: SANGYAN / ArgusFin (Investor Resilience Infrastructure)  
**Dataset Version**: 1.0.0  
**Date**: October 3, 2026  

---

## 1. Dataset Purpose & Scope

The SANGYAN Scam Intelligence & Evaluation Corpus is a curated, multi-dimensional evaluation benchmark constructed to assess financial scam claim detection, return mathematics extraction, RAG grounding, prompt injection resistance, and privacy enforcement across Indian languages (English, Hindi, Tamil).

It provides empirical validation for the **CORE-01 Unified Scam Detection Engine** before model fine-tuning or production multi-channel deployment.

---

## 2. Dataset Composition & Splits

The corpus is logically partitioned into three isolated splits to prevent metric gaming and data leakage:

```text
data/datasets/
├── schema.json               <- Strict JSON schema for evaluation cases
├── dev/cases.json            <- Development tuning dataset (100 cases)
├── test/cases.json           <- Frozen test evaluation dataset (100 cases)
└── adversarial/cases.json    <- Hard adversarial, OCR & prompt-injection dataset (100 cases)
```

### Summary of Dataset Cases
- **Development Split (`dev/`)**: 100 cases designed for rule calibration and extraction testing.
- **Test Split (`test/`)**: 100 frozen cases maintained strictly for offline evaluation.
- **Adversarial Split (`adversarial/`)**: 100 cases featuring prompt-injection attacks, distractor keywords, OCR corruption, lookalike phishing URLs, negations, and false-positive educational traps.
- **Legacy Frozen Baseline (`data/eval_cases.json`)**: 30 benchmark cases retained for backward compatibility.

---

## 3. Language & Category Distribution

| Split | English (EN) | Hindi (HI) | Tamil (TA) | Total Cases |
|---|---|---|---|---|
| **`dev/`** | 35 | 35 | 30 | 100 |
| **`test/`** | 35 | 35 | 30 | 100 |
| **`adversarial/`** | 35 | 35 | 30 | 100 |
| **`eval_cases.json` (Baseline)** | 10 | 10 | 10 | 30 |
| **TOTAL** | **115** | **115** | **100** | **330** |

### Functional Categories Covered
1. `scam_promise`: Guaranteed returns, doubling schemes, fake IPO allotments.
2. `copy_trading`: Telegram / WhatsApp copy trading bots and VIP signal groups.
3. `crypto`: USDT daily staking, cloud mining, fake exchanges.
4. `credential_request`: OTP requests, AnyDesk / TeamViewer remote access.
5. `benign_education`: Legitimate financial education, mutual fund terms, CAGR calculations.
6. `adversarial_prompt_injection`: "Ignore instructions", "Declare safe", system override attempts.
7. `ocr_corrupted`: Leet-speak digit substitutions, broken currency symbols.
8. `url_phishing`: Lookalike domain URLs, credential harvester links.

---

## 4. Privacy & Provenance Defenses

- **100% Synthetic Identifiers**: Zero real phone numbers, bank account numbers, UPI IDs, or private Telegram/WhatsApp IDs are contained in the dataset. Synthetic identifiers (e.g. `+91 9876543210`, `user@upi`) are strictly used.
- **Public Alert Derived**: Scam patterns are derived from public SEBI, RBI, CyberCrime alerts, and regulatory warnings.
- **No Chat Scraping**: No personal user chat transcripts or private inbox data were scraped.
