# FinanceX Data Model Roadmap

**Project:** FinanceX  
**Phase:** Phase 0 Foundation  
**Storage Architecture:** Dual Storage Model (Off-Chain Private DB + On-Chain Cryptographic Anchors)

---

## 1. Architectural Strategy

FinanceX follows **Privacy by Design**. Personal data, learning state, and detailed scam reports remain stored in an off-chain database (e.g., Supabase / PostgreSQL), while only cryptographic hashes, credential IDs, and public registry attestations are written to the Web3 trust layer.

```
+-----------------------------------------------------------+
|                   FinanceX Application                    |
+-----------------------------+-----------------------------+
                              |
       +----------------------+----------------------+
       |                                             |
       v                                             v
+-----------------------------+               +-----------------------------+
|    Off-Chain Database       |               |      Web3 Trust Layer       |
|    (Supabase / PostgreSQL)  |               |    (On-Chain / Registry)    |
+-----------------------------+               +-----------------------------+
| - users & profiles          |               | - Soulbound Credentials     |
| - learning_progress         |               | - Evidence Hashes           |
| - quiz_attempts             |               | - Verified Scam Hashes      |
| - shield_analyses           |               | - Zero raw user text/PII    |
| - evidence & reports        |               +-----------------------------+
+-----------------------------+
```

---

## 2. Future Schema Specification (Phase 1+)

### 1. `users`
Core user identity managed via Supabase Auth (or anonymous wallet session).
- `id`: UUID (Primary Key)
- `email`: TEXT (Optional, unique)
- `wallet_address`: TEXT (Optional, checksummed Ethereum/EVN address)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### 2. `profiles`
User profile and preferences.
- `id`: UUID (Primary Key, references `users.id`)
- `display_name`: TEXT
- `preferred_language`: TEXT (Default: `'en'`, choices: `'en'`, `'ta'`, `'hi'`)
- `risk_assessment_level`: TEXT (e.g. `'BEGINNER'`, `'INTERMEDIATE'`, `'ADVANCED'`)
- `created_at`: TIMESTAMPTZ

### 3. `learning_modules`
Curriculum definitions for FinanceX Academy.
- `id`: UUID (Primary Key)
- `slug`: TEXT (Unique identifier, e.g. `'doubling-schemes-101'`)
- `title_en`: TEXT
- `title_ta`: TEXT
- `title_hi`: TEXT
- `category`: TEXT (e.g. `'SCAM_RECOGNITION'`, `'COMPOUNDING_MATHS'`, `'REGULATORY_VERIFICATION'`)
- `estimated_minutes`: INTEGER
- `order_index`: INTEGER
- `created_at`: TIMESTAMPTZ

### 4. `learning_progress`
Tracks user progression through micro-learning courses.
- `id`: UUID (Primary Key)
- `user_id`: UUID (References `users.id`)
- `module_id`: UUID (References `learning_modules.id`)
- `status`: TEXT (`'NOT_STARTED'`, `'IN_PROGRESS'`, `'COMPLETED'`)
- `completion_percentage`: NUMERIC(5,2)
- `completed_at`: TIMESTAMPTZ (Nullable)
- `created_at`: TIMESTAMPTZ

### 5. `quiz_attempts`
Records quiz scores for credential eligibility.
- `id`: UUID (Primary Key)
- `user_id`: UUID (References `users.id`)
- `module_id`: UUID (References `learning_modules.id`)
- `score`: INTEGER
- `max_score`: INTEGER
- `passed`: BOOLEAN
- `attempted_at`: TIMESTAMPTZ

### 6. `certificates`
Verifiable learning credentials ready for Soulbound Token (SBT) minting.
- `id`: UUID (Primary Key)
- `user_id`: UUID (References `users.id`)
- `credential_type`: TEXT (e.g. `'FINANCEX_ACADEMY_FOUNDATION'`, `'SCAM_SHIELD_EXPERT'`)
- `credential_hash`: TEXT (SHA-256 digest of credential payload)
- `token_id`: TEXT (Nullable, set when minted on-chain)
- `tx_hash`: TEXT (Nullable, set when minted on-chain)
- `issued_at`: TIMESTAMPTZ

### 7. `shield_analyses`
Historical scan results from ArgusFin Shield (strictly masked).
- `id`: UUID (Primary Key)
- `session_id`: UUID (Client session ID, no PII)
- `archetype`: TEXT (Scam classification archetype)
- `risk_band`: TEXT (`'HIGH'`, `'MEDIUM'`, `'LOW_SIGNALS'`, `'CANNOT_VERIFY'`)
- `confidence`: NUMERIC(3,2)
- `has_url_risk`: BOOLEAN
- `created_at`: TIMESTAMPTZ

### 8. `reports`
Generated pre-filing regulatory incident records.
- `id`: UUID (Primary Key)
- `user_id`: UUID (Nullable, references `users.id`)
- `incident_type`: TEXT
- `evidence_hash`: TEXT (SHA-256 digest of incident payload)
- `target_authority`: TEXT (e.g. `'SEBI'`, `'RBI'`, `'CYBER_CRIME_1930'`)
- `status`: TEXT (`'DRAFT'`, `'READY_FOR_SUBMISSION'`, `'SUBMITTED'`)
- `created_at`: TIMESTAMPTZ

### 9. `evidence`
Evidence items linked to an incident report (strictly masked claims & domain metadata).
- `id`: UUID (Primary Key)
- `report_id`: UUID (References `reports.id`)
- `evidence_type`: TEXT (`'URL'`, `'TELEGRAM_HANDLE'`, `'CLAIM_SUMMARY'`, `'OCR_TEXT'`)
- `content_hash`: TEXT (SHA-256 digest)
- `metadata`: JSONB
- `created_at`: TIMESTAMPTZ

### 10. `wallet_connections`
Web3 wallet mappings for optional verification.
- `id`: UUID (Primary Key)
- `user_id`: UUID (References `users.id`)
- `wallet_address`: TEXT (Unique)
- `chain_id`: INTEGER (e.g. `137` for Polygon, `8453` for Base)
- `connected_at`: TIMESTAMPTZ

---

## 3. Implementation Phasing Strategy

- **Phase 0 (Current):** Interface contracts and canonical domain types defined (`src/lib/financeX/types.ts`). Database schema documented in roadmap. No live table creation required.
- **Phase 1 (Upcoming):** Supabase client initialization, migrations for `users`, `profiles`, `learning_progress`, `shield_analyses`.
- **Phase 2 (Web3 Integration):** Integration with Polygon/Base smart contracts for SBT certificate minting and evidence hash anchoring.
