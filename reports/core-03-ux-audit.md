# CORE-03 — Production UX, Investor Education & Calculator Audit Report

## Executive Summary

This report documents the baseline UX, accessibility, navigation, localization, education, and calculator audit performed across SANGYAN prior to CORE-03 implementation.

---

## 1. Current User Journey

```
Home Page (/)
  ├── Primary Hero CTA: "Scan Offer / Check Message" → /check
  ├── Secondary Hero CTA: "Try Yield Calculator" → /calculator
  ├── Feature Highlights (Open-world scam engine, PII protection, n8n WhatsApp bot)
  └── Educational Teasers → /learn

Check Page (/check)
  ├── Input: Textarea (Text, paste, voice STT, preset chips) & Image Upload (OCR)
  ├── Action: "Scan for Scams" → calls POST /api/check
  └── Output: BandBadge, RiskGauge (confidence/score), Risk Analysis Summary, Identified Red Flags, Observable Signals, Action Steps, Next Steps links

Ask Page (/ask)
  ├── Input: Query field & Language selector
  ├── Action: "Ask Question" → calls POST /api/ask
  └── Output: Intent-routed answer (CONTENT_ANALYSIS via analyzeScam or EDUCATIONAL_QA via askRag)

Calculator Page (/calculator)
  ├── Mode Selector: Mode A (Check Promise) & Mode B (Research CAGR)
  ├── Input Fields: Invested amount, Payout, Duration unit / Start & End Dates
  └── Output: Return Multiple, Total Gain %, Annualised Return %, Analyst Breakdown, Ladder Chart

Education Hub (/learn)
  ├── Overview topics, glossary, regulators, lesson cards
  └── Teasers for investor resilience

Report Assistant (/report)
  ├── Step-by-step incident gathering form
  └── Generates formatted incident summary for authority reporting
```

---

## 2. Reusable Component Inventory

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` ([`src/components/ui/card.tsx`](file:///d:/SANGYAN/src/components/ui/card.tsx))
- `Button` with variants: `primary`, `secondary`, `quiet`, `danger` ([`src/components/ui/button.tsx`](file:///d:/SANGYAN/src/components/ui/button.tsx))
- `Field` with label, hint, error states ([`src/components/ui/field.tsx`](file:///d:/SANGYAN/src/components/ui/field.tsx))
- `BandBadge` for `HIGH`, `MEDIUM`, `LOW_SIGNALS`, `CANNOT_VERIFY` ([`src/components/ui/badge.tsx`](file:///d:/SANGYAN/src/components/ui/badge.tsx))
- `Banner` for alert notices ([`src/components/ui/banner.tsx`](file:///d:/SANGYAN/src/components/ui/banner.tsx))
- `RiskGauge` circular SVG gauge ([`src/components/RiskGauge.tsx`](file:///d:/SANGYAN/src/components/RiskGauge.tsx))
- `VoiceInput` Web Speech STT recorder ([`src/components/VoiceInput.tsx`](file:///d:/SANGYAN/src/components/VoiceInput.tsx))
- `SpeakButton` Web Speech TTS reader ([`src/components/SpeakButton.tsx`](file:///d:/SANGYAN/src/components/SpeakButton.tsx))
- `WhatsAppConnectModal` n8n quick connect modal ([`src/components/WhatsAppConnectModal.tsx`](file:///d:/SANGYAN/src/components/WhatsAppConnectModal.tsx))
- `HeaderNav` responsive navigation bar ([`src/components/HeaderNav.tsx`](file:///d:/SANGYAN/src/components/HeaderNav.tsx))

---

## 3. Audit Findings & Gap Analysis

### A. Calculator Limitations
- **Current State**: Supports 2 modes: Mode A (Check This Promise) and Mode B (Date-based CAGR).
- **Gaps Identified**:
  1. Missing Mode A: Pure Lump Sum compounding investment calculator.
  2. Missing Mode B: Monthly Contribution (SIP-style) wealth growth calculator.
  3. Missing Mode C: Explicit standalone CAGR calculator.
  4. Missing Mode D: Dedicated "Promise Reality Check" tool with mathematical implausibility warnings.
  5. URL prefill parameters (`invested`, `payout`, `days`) were restricted to Mode A only.

### B. Education Coverage Gaps
- **Current State**: Basic glossary and lesson items under `/learn`.
- **Gaps Identified**:
  1. Lack of dedicated investor resilience cards for emerging scam archetypes (Guaranteed returns, Pay first withdraw later, VIP trading groups, Copy trading, Crypto staking, Fake trading apps, Fake IPO, Recovery scams, OTP/remote access).
  2. Lack of explicit educational breakdown on statutory market roles (SEBI, NSE, BSE, NSDL, RBI).
  3. Missing interactive "How are these returns mathematically possible?" compounding vs risk module.

### C. UX Language Audit (Database-Match Removal)
- **Current State**: Search across `/check` and `/ask` UI revealed preset labels and captions referencing "preset examples".
- **Gaps Identified**: Need to verify zero occurrences of "database match", "found in our database", or "scam database lookup" across all user-facing locales (`locales/en.json`, `locales/hi.json`, `locales/ta.json`) and replace with behavior-based terminology ("Behavioral risk analysis", "Observed evidence signals").

### D. Navigation & Deep Links
- Action buttons in check results (`Yield Calculator`, `Report Incident`, `Authority Router`) link correctly to `/calculator`, `/report`, `/authorities`.
- Header nav items (`Check Offer`, `Yield Calculator`, `Investor Education`, `Report Scam`, `Ask AI`) use locale-aware Next-Intl links (`src/i18n/routing.ts`).

### E. Image & OCR UX
- Image upload preview works via base64 OCR.
- **Gaps Identified**: Explicit notification banner informing the user that image text extraction is untrusted evidence and that QR code URLs are extracted safely without automatic browser navigation.

### F. Privacy & Data Governance Messaging
- Need concise, explicit privacy notice under `/check` and `/ask` input boxes: *"Your message is analyzed statelessly for this session. Personal identifiers are masked before processing."*

---

## 4. Audit Action Plan for CORE-03

1. **Calculator Expansion**: Implement 4 distinct, tabbed modes in `src/lib/calc.ts` and `src/app/[locale]/calculator/page.tsx` (Lump Sum, SIP Monthly, CAGR, Promise Reality Check) with 100% deterministic test coverage.
2. **Investor Education Hub**: Expand `/learn` with structured categories, statutory ecosystem roles (SEBI, NSE, BSE, NSDL, RBI), and 10 reusable Investor-Resilience Cards.
3. **Behavioral Language Enforcer**: Eliminate any lingering database-match phrasing across all UI pages and locales.
4. **Scam Intelligence View**: Add privacy-safe `/intelligence` or aggregate pattern view displaying anonymous SANGYAN-observed behavioral trends.
5. **User-Reviewable Report Packet**: Ensure `/report` allows full review, copy, and export before user submission without auto-reporting.
