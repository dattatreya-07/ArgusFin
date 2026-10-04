# CORE-02.3 Open-World Behavioral Understanding Engine

## 1. Overview & Capabilities

The Open-World General Scam Understanding Engine (`src/lib/detector/openWorld.ts`) provides behavioral risk analysis for previously unseen scam mechanisms across financial fraud, utility disconnection threats, courier customs tax scams, digital arrest threats, emergency impersonations, and multilingual messages.

---

## 2. Open-World Semantic Event Schema

The engine constructs a structured intermediate model (`OpenWorldAnalysis`):

- **`claimedActor`**: Identified authority or brand role (e.g. Electricity Department, Police/CBI, Customs, Bank Manager).
- **`claimedSituation`**: Extracted situation claim (e.g. power disconnection, parcel on hold, tax refund available, digital arrest warrant).
- **`requestedActions`**: Typed requested actions (`PAY`, `CLICK`, `SHARE_OTP`, `SHARE_CREDENTIAL`, `INSTALL_APP`, `CONTACT`, `JOIN_GROUP`, `TRANSFER`).
- **`pressureSignals`**: Typed psychological pressure signals (`URGENCY`, `THREAT`, `FEAR`, `REWARD`, `SECRECY`, `AUTHORITY_PRESSURE`).
- **`financialSignals`**: Financial request behaviors (`PAYMENT_REQUEST`, `ADVANCE_FEE`, `UNREALISTIC_RETURN`, `GUARANTEED_RETURN`, `WITHDRAWAL_BLOCK`).
- **`technicalSignals`**: Technical attack vectors (`LINK`, `QR`, `APP_INSTALL`, `REMOTE_ACCESS`, `CREDENTIAL_REQUEST`, `OTP_REQUEST`).
- **`uncertainty`**: Explicit fields marking unknown or unverified metadata.

---

## 3. Compositional Behavioral Interaction Rules

Risk bands are calculated compositionally across signal combinations:

- **`PAYMENT_REQUEST` + `URGENCY`**: High Risk
- **`PAYMENT_REQUEST` + `THREAT`**: High Risk
- **`IMPERSONATION` + `THREAT` + `LINK`**: High Risk
- **`REMOTE_ACCESS` (AnyDesk / TeamViewer / APK)**: High Risk (Critical)
- **`OTP_REQUEST` or `CREDENTIAL_REQUEST`**: High Risk (Critical)
- **Educational Question / Banking Concept without active payment solicitation**: Low Signals (Benign)
- **Routine Utility Bill with official domain (`bescom.co.in`, `airtel.in`)**: Low Signals (Benign)

---

## 4. Unseen Scam Scenarios Verified

The engine was empirically validated against novel unseen scam families:

1. **Electricity Power Disconnection**: Identified power utility impersonation, urgent deadline ("tonight at 9:30 PM"), payment demand, and link-mediated action -> `HIGH` risk (`OTHER_SUSPICIOUS_FINANCIAL_PATTERN`).
2. **FedEx Customs Clearance Tax**: Identified courier impersonation, customs clearance fee demand, and external link -> `HIGH` risk (`OTHER_SUSPICIOUS_FINANCIAL_PATTERN`).
3. **TRAI / CBI Digital Arrest Threat**: Identified law enforcement impersonation, 2-hour disconnection threat, and legal fear coercion -> `HIGH` risk (`OTHER_SUSPICIOUS_FINANCIAL_PATTERN`).
4. **Income Tax Refund Claim**: Identified government refund claim, credential collection link, and financial payout bait -> `HIGH` risk (`OTHER_SUSPICIOUS_FINANCIAL_PATTERN`).
5. **Pre-Approved Instant Loan APK**: Identified advance fee demand, unverified APK installation, and instant loan bait -> `HIGH` risk (`PRE_APPROVED_LOAN_SCAM`).
