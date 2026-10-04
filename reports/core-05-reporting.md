# CORE-05 — Investor Reporting Architecture & Workflow

## Overview

CORE-05 hardens SANGYAN's complete investor-protection reporting workflow. SANGYAN acts as an educational, evidence-preserving pre-filing tool for citizens who have encountered or suffered financial fraud, unauthorized investment schemes, or phishing.

## End-to-End Workflow

```
USER CONTENT (Text / Audio / Screenshot / Transaction)
   ↓
SANGYAN CANONICAL ANALYSIS ENGINE (Risk Assessment & Signal Extraction)
   ↓
GROUNDED EDUCATIONAL EXPLANATION & STATUTORY CITATIONS
   ↓
DETERMINISTIC AUTHORITY ROUTER (Source-Governed Regulatory Register)
   ↓
EVIDENCE-PRESERVING WORKFLOW (PII-Masked Evidence Provenance & Content SHA-256)
   ↓
CANONICAL REPORT PACKET GENERATOR (Observed Facts vs User Statements vs Analysis)
   ↓
USER REVIEW & EDITABLE INTERFACE (/report)
   ↓
USER EXPORTS / PRINTS (HTML, Plain Text, JSON)
   ↓
MANUAL USER SUBMISSION THROUGH OFFICIAL EXTERNAL CHANNEL (cybercrime.gov.in / 1930 / scores.gov.in)
```

> **CRITICAL GUARDRAIL**: SANGYAN NEVER performs automatic submission to law enforcement, regulators, or external authorities. The system stops completely at the user review stage.

## Report Packet Separation

The `CanonicalReportPacket` strictly distinguishes four categories of statements:
1. **OBSERVED FACTS**: Objective metadata directly captured from inputs (e.g. communication channel, date, transaction amounts, presence of remote access software).
2. **SENDER CLAIMS & DEMANDS**: Unverified claims made by the sender (e.g. promised returns, claimed SEBI registration) and requested actions (e.g. transfer fee, share OTP).
3. **USER-PROVIDED STATEMENTS**: Expressly labeled user narrative statements (PII-masked).
4. **SANGYAN ANALYSIS**: System risk band, confidence score, and grounded explanations.
5. **UNVERIFIED CLAIMS & UNCERTAINTY**: Explicit declarations of what SANGYAN could not independently verify.

## Privacy & Data Boundaries

- **Stateless Server Architecture**: No user narratives or PII are stored server-side.
- **Client/On-Demand Masking**: All phone numbers (`[PHONE]`), UPI handles (`[UPI]`), emails (`[EMAIL]`), account numbers (`[ACCOUNT_OR_ID]`), and PAN cards (`[PAN]`) are masked.
- **Export Integrity**: Each report packet includes a SHA-256 export integrity hash (`exportIntegrityHash`) for tamper verification.
