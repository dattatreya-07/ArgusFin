# FinanceX Development & Contribution Guide

**Project:** FinanceX  
**Platform:** Next.js App Router (TypeScript)  

---

## 1. Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript typechecks
npm run typecheck

# Run test suite
npm test

# Run ESLint check
npm run lint

# Run automated guardrail scanner
npm run guardrails
```

---

## 2. Directory Layout

- `src/app/[locale]/` - Next.js App Router pages (en, ta, hi)
  - `/` - FinanceX Dashboard
  - `/learn` - FinanceX Academy
  - `/check` & `/protect` - ArgusFin Shield Scam Analysis
  - `/prove` - Web3 Verifiable Trust Layer Foundation
- `src/lib/financeX/` - FinanceX Domain Subsystems
  - `academy/` - Micro-lessons & literacy progress
  - `shield/` - ArgusFin scam detection engine facade
  - `prove/` - Web3 credential & evidence anchoring interfaces
  - `platform/` - Shared config & platform tools
- `locales/` - Internationalization strings (en, ta, hi)
- `data/` - Verified benchmark rates, authorities, and regulatory corpus

---

## 3. Mandatory Guardrails

All code contributed to FinanceX must pass `npm run guardrails`. Never introduce investment recommendations, paid tiers, or unmasked storage of PII.
