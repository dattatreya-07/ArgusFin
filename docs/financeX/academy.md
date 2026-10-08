# FinanceX Academy Documentation

**Project:** FinanceX  
**Subsystem:** FinanceX Academy (`/learn`)  
**Status:** Production-Ready Foundation  

---

## 1. Overview & Core Philosophy

FinanceX Academy teaches retail investors how to understand and handle money safely.

**Core Principle:** `EDUCATE → PRACTICE → CHECK → UNDERSTAND → PROVE LATER`

The Academy provides structured financial literacy—NOT financial advice.

---

## 2. Curriculum Architecture

Four initial learning tracks comprising **26 total lessons**:

1. **Financial Foundations (Lessons 1–6):** Money & Expenses, Saving vs Investing, Inflation, Simple vs Compound Interest, Emergency Funds, Risk & Return.
2. **Investing Basics (Lessons 7–12):** Fixed Deposits, Bonds, Mutual Funds, Equity & Shares, SIPs, IPOs & Allotment.
3. **Investor Resilience (Lessons 13–20):** Guaranteed Return Claims, Advance Fee Scams, Fake Investment Apps, Copy-Trading Pressure, OTP Safety, Remote Access Scams, Withdrawal Fee Scams, Recovery Scams.
4. **Digital Finance & Web3 Safety (Lessons 21–26):** Wallet Basics, Private Seed Phrases, Token & Contract Risk, Crypto Investment Scams, Fake Airdrops, Phishing & Drainers.

---

## 3. Source Governance & Provenance

Factual claims maintain explicit provenance against verified regulatory sources:
- **SEBI (Saa₹thi):** Securities and Exchange Board of India (`https://investor.sebi.gov.in`)
- **RBI:** Reserve Bank of India Financial Education (`https://rbi.org.in`)
- **NSDL:** National Securities Depository Limited (`https://nsdl.co.in`)
- **NISM:** National Institute of Securities Markets (`https://www.nism.ac.in`)
- **National Cyber Crime Helpline:** Ministry of Home Affairs (`https://cybercrime.gov.in`, `1930`)

---

## 4. AI Tutor Architecture

The **FinanceX AI Tutor** (`src/lib/financeX/academy/tutor.ts`) enforces a strict multi-stage safety pipeline:

```
User Query -> PII Masking -> Intent & Mode Detection -> Safety Gate -> RAG Retrieval -> Grounded Output -> Citations
```

- **Supported Modes:** `EXPLAIN`, `SIMPLIFY`, `EXAMPLE`, `QUIZ_ME`, `COMPARE`, `TRANSLATE`, `WHY`, `SCAM_AWARENESS`.
- **Strict Policy:** Refuses personalized stock recommendations ("Which stock to buy?"). Routes suspicious scam offers directly to ArgusFin Shield.

---

## 5. Quiz & Simulator Subsystems

- **Quiz Engine:** Evaluates questions server-side without leaking answer keys in client bundles.
- **Educational Simulators:** Reuses `src/lib/calc.ts` to power SIP and Compound Interest simulators with explicit "Illustrative Assumption" disclaimers.

---

## 6. Shield ↔ Academy Integration Seam

Mapped via `src/lib/financeX/academy/shieldLessonMap.ts`:
- `DOUBLING_SCHEME` → `guaranteed-return-claims`
- `ADVANCE_FEE_SCAM` → `advance-fee-scams`
- `FAKE_TRADING_APP_OR_PORTAL` → `fake-investment-apps`
- `REMOTE_ACCESS_SCAM` → `remote-access-scams`
