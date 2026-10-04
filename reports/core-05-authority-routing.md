# CORE-05 — Deterministic Authority Routing & Source Governance

## Deterministic Routing Architecture

Authority routing in SANGYAN is 100% deterministic. LLM outputs are **strictly prohibited** from directly selecting authority channels or statutory reporting portals.

The routing engine evaluates structured incident signals against the source-governed registry in `data/authorities.json`:

```
routeAuthorities({
  category,
  platform,
  jurisdiction,
  moneySent,
  credentialsShared,
  otpShared,
  remoteAccessGranted,
  hoursElapsed
}) -> AuthorityRouteResult
```

## Supported Incident Categories & Mappings

1. **CYBERCRIME_FINANCIAL_FRAUD**: Money lost, recent transfer, UPI fraud → `national_cyber_helpline` (1930), `cybercrime_portal` (cybercrime.gov.in), `user_bank`.
2. **SECURITIES_INVESTMENT_COMPLAINT**: Stock advisory, fake IPO allotment, copy trading, fake broker → `sebi_scores` (scores.gov.in), `rbi_sachet`.
3. **UNAUTHORIZED_FINANCIAL_ACTIVITY**: Ponzi scheme, illegal deposit taking, MLM, collective investment → `rbi_sachet` (sachet.rbi.org.in), `sebi_scores`.
4. **BANKING_PAYMENT_ISSUE**: OTP theft, credit card fraud, unauthorized debit → `user_bank`, `national_cyber_helpline`, `cybercrime_portal`.
5. **TELECOM_SPAM_PHISHING**: Phishing SMS, suspicious call, fake WhatsApp group link → `telecom_fraud_reporting` (DoT Chakshu sancharsaathi.gov.in), `cybercrime_portal`.
6. **ACCOUNT_TAKEOVER_CREDENTIAL**: Remote access desktop app, login credentials shared → `national_cyber_helpline`, `user_bank`, `cybercrime_portal`.
7. **RECOVERY_SCAM**: Advance fee for recovering past lost funds → `cybercrime_portal`, `national_cyber_helpline`.
8. **BENIGN_EDUCATIONAL / AMBIGUOUS**: No routing performed (`NO_MATCH` or `UNKNOWN_JURISDICTION`).

## Explicit Jurisdiction Model

- **Supported Jurisdiction**: `'IN'` (India).
- **Unknown Jurisdiction**: `'UNKNOWN'`.
- **Policy**: Jurisdiction is never inferred from language alone (e.g., Tamil or Hindi does not imply India). If jurisdiction is unknown or unsupported, the router returns `status: 'UNKNOWN_JURISDICTION'`, empty routes, and clear explanation without inventing foreign authority contacts.

## Source Governance Standard

Every authority entry in `data/authorities.json` has mandatory governance fields:
- `id` (e.g. `sebi_scores`)
- `name` (Official statutory name)
- `purpose` & `scope`
- `jurisdiction` (`IN`)
- `trust_tier` (`TIER_1_PRIMARY` or `TIER_2_OFFICIAL_EDUCATIONAL`)
- `status` (`VERIFIED` or `UNVERIFIED`)
- `verified_at` (ISO date timestamp)
- `source_title` & `source_url`
- `channels` (verified URLs / phone helplines).

> If an authority entry cannot be verified, SANGYAN explicitly displays: *"I can't verify this authority contact from the available source material."*
