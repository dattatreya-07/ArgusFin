# FinanceX Target Architecture Document

**Project:** FinanceX  
**Hackathon:** HackSpark '26  
**Subsystems:** Learn | Protect | Prove  

---

## 1. High-Level Conceptual Architecture

FinanceX is structured around three core pillars built upon a unified shared platform layer:

```
                      +-----------------------------+
                      |          FINANCEX           |
                      |    Learn. Protect. Prove.   |
                      +--------------+--------------+
                                     |
         +---------------------------+---------------------------+
         |                           |                           |
         v                           v                           v
+-----------------+         +-----------------+         +-----------------+
|     ACADEMY     |         |     SHIELD      |         |      PROVE      |
|    (Learn)      |         |    (Protect)    |         |     (Web3)      |
+-----------------+         +-----------------+         +-----------------+
| - Courses       |         | - ArgusFin      |         | - Soulbound     |
| - Micro-Lessons |         |   Scam Engine   |         |   Credentials   |
| - Simulators    |         | - Semantic AI   |         | - Evidence      |
| - Quizzes       |         | - Grounded RAG  |         |   Hash Anchor   |
| - Progress      |         | - Deterministic |         | - Decentralized |
|   Tracking      |         |   Safety        |         |   Registry      |
+-----------------+         +-----------------+         +-----------------+
         |                           |                           |
         +---------------------------+---------------------------+
                                     |
                                     v
                      +-----------------------------+
                      |       SHARED PLATFORM       |
                      +-----------------------------+
                      | - PII Masking & Privacy     |
                      | - Grounded RAG Corpus       |
                      | - Authority Router          |
                      | - Incident Report Generator |
                      | - Supabase Off-Chain DB     |
                      | - Next-Intl Multilingual    |
                      +-----------------------------+
```

---

## 2. Subsystem Seams & Boundaries

### 1. Academy (`src/lib/financeX/academy/`)
- Handles AI-guided financial education, compounding calculators, and market risk micro-lessons.
- Tracks user learning progress and eligibility for Soulbound learning credentials.

### 2. Shield (`src/lib/financeX/shield/`)
- Encapsulates the canonical **ArgusFin Scam Defense Engine** (`src/lib/scam/analyze.ts`).
- Maintains strict 6-stage analysis pipeline:
  `Input -> Privacy Masking -> Semantic Features -> Evidence Extraction -> Deterministic Invariants -> Grounded RAG -> Explanation`.

### 3. Prove (`src/lib/financeX/prove/`)
- Interfaces with Web3 infrastructure for minting Soulbound Tokens (SBTs) and anchoring SHA-256 evidence digests.
- Enforces strict Privacy by Design: Zero personal data or unmasked raw text is ever stored on-chain.

### 4. Shared Platform (`src/lib/financeX/platform/`)
- Configuration, localization, PII sanitization, regulatory database routing (`data/authorities.json`), and Supabase identity mapping.
