# CORE-04 — Pattern Intelligence & Signal Aggregation Report

## 1. Overview & Privacy Architecture

The SANGYAN Pattern Intelligence surface (`/intelligence` & `GET /api/intelligence`) visualizes anonymized, structural signal occurrences to demonstrate how financial scam tactics evolve over time.

---

## 2. Privacy Guarantees

- **Zero Persistence of Raw Content**: Raw message text, chat transcripts, voice notes, and screenshots are NEVER stored.
- **Zero Storage of PII**: Phone numbers, email addresses, usernames, bank account details, UPI IDs, IP addresses, and user identifiers are stripped prior to analysis.
- **Structural Signal Fingerprints Only**: Only anonymous structural signal types (e.g., `PAYMENT_REQUEST`, `URGENCY`, `WITHDRAWAL_BLOCK`, `GUARANTEED_RETURN`) are aggregated.

---

## 3. Clear Provenance & Terminology

- Explicitly labeled as **"SANGYAN-Observed Patterns"** or **"Anonymized Product Trends"**.
- NEVER described as *"India's National Scam Statistics"* or *"Official Government Data"*.
- Explicitly discloses whether metrics represent live persistent aggregation or local development state.
- No false claims of "continuous AI online training".

---

## 4. API Contract & Signal Categories

Endpoint `GET /api/intelligence` returns structured JSON:
- `title`: "SANGYAN-Observed Behavioral Scam Patterns"
- `asOf`: Current timestamp
- `privacyNotice`: "Zero persistence of raw messages or personal identifiers."
- `observedSignals`: Array of signal objects with `id`, `name`, `category`, `observedCount`, and `trend`.
