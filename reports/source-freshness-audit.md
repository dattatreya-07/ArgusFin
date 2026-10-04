# SANGYAN Source Freshness Audit

## Overview

This audit evaluates the provenance, verification dates, and freshness of all financial regulatory data, statutory helpline registers, and educational corpus documents embedded in SANGYAN.

## Source Inventory & Freshness Status

| Source Identifier | Regulatory / Statutory Entity | Purpose / Topic | Last Verified Date (`verified_at`) | Freshness Status | Action Required |
|---|---|---|---|---|---|
| `national_cyber_helpline` | Ministry of Home Affairs (MHA / I4C) | National Cyber Crime Helpline (1930) & SOP | 2026-10-01 | FRESH | None |
| `cybercrime_portal` | MHA Indian Cybercrime Coordination Centre | Portal (cybercrime.gov.in) | 2026-10-01 | FRESH | None |
| `sebi_scores` | SEBI | SCORES 2.0 Investor Grievances (scores.gov.in) | 2026-10-01 | FRESH | None |
| `rbi_sachet` | Reserve Bank of India (RBI) | Sachet SLCC Portal (sachet.rbi.org.in) | 2026-10-01 | FRESH | None |
| `telecom_fraud_reporting` | Department of Telecommunications (DoT) | Sanchar Saathi Chakshu Facility | 2026-10-01 | FRESH | None |
| `user_bank` | Statutory Banking Advisory | Victim Bank Fraud Dispute Cell Guidance | UNVERIFIED (`null`) | UNVERIFIED | Display unverified notice in UI |
| `sebi_unregistered_advisors_sop` | SEBI | Unregistered Investment Advisor Guidelines | 2026-10-01 | FRESH | None |
| `rbi_digital_lending_guidelines_2022` | RBI | Digital Lending Circular & Borrower Protection | 2026-10-01 | FRESH | None |
| `dot_chakshu_telecom_fraud_sop` | DoT / Sanchar Saathi | Telecom Phishing & SIM Deactivation | 2026-10-01 | FRESH | None |
| `mha_cyber_financial_fraud_1930` | MHA / I4C | Golden Hour Transaction Lien SOP | 2026-10-01 | FRESH | None |
| `sebi_ipo_allotment_fraud_alert` | SEBI | Fake FII / Institutional Share Allotment | 2026-10-01 | FRESH | None |
| `rbi_sachet_unauthorized_deposits` | RBI | Illegal Deposit & Banning of Unregulated Deposit Schemes Act (BUDS) | 2026-10-01 | FRESH | None |

## Verification Policy

1. **No Memory Hallucination**: The system relies on explicit source documents stored under `data/` and `src/lib/rag/corpus.ts`.
2. **Unverified Contact Handling**: Any helpline or contact lacking a valid `verified_at` timestamp triggers the user warning: *"I can't verify this authority contact from the available source material."*
3. **Periodic Review Schedule**: Statutory source URLs and regulatory guidance must be re-verified quarterly.
