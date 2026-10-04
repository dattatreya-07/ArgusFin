# CORE-02 — Dataset Card & Generalization Benchmark Inventory

**Project**: SANGYAN / FinanceX: Investor Resilience  
**Task**: CORE-02 Dataset Specification & Split Inventory  
**Date**: October 4, 2026  
**Status**: DATASET GENERATED & VERIFIED  

---

## 1. Corpus Architecture & Hierarchy

The CORE-02 dataset expansion provides a comprehensive evaluation corpus under `data/datasets/core-02/` and existing corpus files.

### Dataset Directory Structure:
```
data/
├── eval_cases.json                (30 Frozen Baseline Cases)
├── datasets/
│   ├── dev/cases.json             (102 Development Cases)
│   ├── test/cases.json            (102 Test Cases)
│   ├── adversarial/cases.json     (102 Adversarial Cases)
│   └── core-02/
│       ├── benign/cases.json      (8 Educational & Benign Trap Cases)
│       ├── dev/cases.json         (6 Paraphrased & Compositional Cases)
│       ├── validation/cases.json  (12 Benign & Unseen Cases)
│       ├── frozen-test/cases.json (22 Frozen Core-02 Test Cases)
│       ├── adversarial/cases.json (2 Prompt-Injection Cases)
│       ├── unseen/cases.json       (4 Novel Scam Formulations)
│       ├── multilingual/cases.json (2 Hinglish & Tanglish Cases)
│       └── compositional/cases.json(2 Multi-signal Cases)
```

**Total Corpus Case Count**: **358 Cases** across all active evaluation files.

---

## 2. Dataset Categories & Feature Tags

The corpus encompasses 20 distinct dataset categories across 3 languages (**English, Hindi, Tamil**):

1. **Seen Canonical Cases**: Benchmark cases matching literal regex patterns.
2. **Paraphrased Cases**: Semantic equivalents without exact target keywords.
3. **Lexical Substitutions**: Synonyms substituted for financial terms.
4. **Structural Rewrites**: Reordered sentence structures.
5. **Long-Form Narratives**: Multi-sentence storyline scams.
6. **Short Messages**: Telegram/WhatsApp short-text claims.
7. **Mixed-Language**: Hinglish & Tanglish phrasings.
8. **Tamil**: Native Tamil script scam phrasings.
9. **Hindi**: Native Devanagari script scam phrasings.
10. **English**: Standard English scam claims.
11. **OCR-like Noisy Text**: Simulated OCR extraction artifacts.
12. **URL-containing Messages**: Messages with punycode and lookalike domain URLs.
13. **Image-derived Evidence**: Screenshot text extractions.
14. **Compositional Scams**: Multi-signal patterns requiring feature aggregation.
15. **Benign Financial Education**: General financial queries ("What is SIP?", "How does FD work?").
16. **Benign Scam Discussion**: Articles and discussions discussing scam mechanics without active scam intent.
17. **Benign News/Reporting**: Regulatory alerts and financial news articles.
18. **Prompt Injection**: System override attempts and malicious instruction injections.
19. **Ambiguous Cases**: Low-confidence or incomplete claims requiring `CANNOT_VERIFY`.
20. **Unseen Scam Formulations**: Novel fee-escalation, task-scam, and recovery-scam patterns.

---

## 3. Ground Truth Schema & Provenance

Each case in `data/datasets/core-02/` adheres to a strict JSON schema:

```json
{
  "id": "core02_para_001",
  "language": "en",
  "source": "TELEGRAM",
  "input": "You receive a fixed 5 percent credit in your account every morning at 9 AM guaranteed.",
  "category": "paraphrased",
  "expectedArchetype": "DOUBLING_SCHEME",
  "expectedRiskBand": "HIGH",
  "provenance": "CORE02_GENERALIZATION",
  "difficulty": "MEDIUM",
  "tags": ["paraphrase", "daily_cadence"]
}
```

### Data Isolation Principles:
- **Zero Test Contamination**: Frozen test sets (`frozen-test/cases.json` and `eval_cases.json`) are strictly isolated from feature extractor prompts and context examples.
- **Provenance Tracking**: Every entry logs explicit origin (`BENIGN_BENCHMARK`, `CORE02_GENERALIZATION`, `ADVERSARIAL_BENCHMARK`, `MULTILINGUAL_BENCHMARK`).
