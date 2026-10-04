# CORE-03 — Privacy-Safe Pattern Intelligence Report

## Executive Summary

This report documents the privacy-safe pattern observation layer (`src/lib/scam/patterns.ts`), API (`/api/intelligence`), and user interface (`/intelligence`).

---

## 1. Privacy-Safe Aggregation Architecture

SANGYAN observes anonymized structural signal fingerprints without persisting any personal or raw text data:

```
OpenWorldAnalysis
  ↓
generateBehavioralFingerprint()
  - Hashes signal keys: Actor::Pressure::Financial::Technical::Actions
  - Omits user text, phone numbers, UPI IDs, names, and raw URLs
  ↓
recordPatternObservation()
  - Stores anonymized count in memory
  ↓
GET /api/intelligence
  - Returns aggregate signal distributions and top behavior families
  ↓
Rendered in /intelligence UI
```

---

## 2. Data Governance Rules

- Never labelled as "national crime statistics" or "official statistics".
- Explicitly disclaimed as *"SANGYAN-Observed Aggregate Pattern Trends"*.
- Zero raw user content or screenshots stored.
