# FinanceX Web3 Trust Layer Architecture & Specification

## 1. Executive Summary
FinanceX Web3 Trust Layer implements on-chain verification for financial education credentials, tamper-evident incident evidence digests, and neutral scam identifier registration on the **Polygon Amoy Testnet** (Chain ID `80002`).

The primary security postulate of the Web3 Trust Layer is **Privacy by Design**:
- Zero Personally Identifiable Information (PII) is written to or processed by smart contracts.
- Incident reports and raw user evidence remain 100% off-chain.
- Only cryptographic hashes, normalized domain-separated digests, and soulbound token metadata are stored on-chain.

---

## 2. Smart Contract Architecture

The contracts are located in `contracts/` and compiled with Solidity `0.8.20` using OpenZeppelin v5 standards.

### 2.1 `CredentialSBT.sol` (Soulbound Token)
- **Standard:** ERC-721 compatible non-transferable token.
- **Transfer Restriction:** Overrides `_update(address to, uint256 tokenId, address auth)` to revert on all secondary transfers or approvals.
- **Issuance:** Mintable by authorized `issuer` role (FinanceX Verified Authority).
- **Revocation:** Support for `revokeCredential(uint256 tokenId)` emitting `CredentialRevoked`.
- **Data Model:**
  - `tokenId` (uint256)
  - `recipient` (address)
  - `credentialType` (string, e.g., `INVESTOR_RESILIENCE_FOUNDATIONS`)
  - `achievementHash` (bytes32, domain-separated cryptographic fingerprint)
  - `issuedAt` (uint256)
  - `revoked` (bool)

### 2.2 `EvidenceAnchor.sol` (Tamper-Evident Digest Timestamping)
- **Purpose:** Proves that an evidence packet existed in a specific state at a specific point in time without exposing contents.
- **Duplicate Prevention:** Reverts if an identical evidence hash has already been anchored.
- **Events:**
  ```solidity
  event EvidenceAnchored(
      bytes32 indexed evidenceHash,
      uint256 timestamp,
      bytes32 schemaVersion,
      address indexed anchorer
  );
  ```

### 2.3 `ScamRegistry.sol` (Neutral Hash Registry)
- **Purpose:** Maintains a neutral, on-chain record of reported scam identifier digests (URLs, Phone Numbers, UPI handles, Wallet Addresses).
- **Terminology Safety:** Uses non-defamatory labels (`reported`, `registeredAt`, `sourceRefHash`) rather than subjective blacklist terms.
- **Access Control:** Restricted registration via authorized `issuer` address to prevent anonymous malicious spamming.

---

## 3. Cryptographic Hashing & Domain Separation

Defined in `src/lib/financeX/prove/hashing.ts`:

### 3.1 Domain Separation Prefixes
To prevent cross-domain hash collisions, all digests prepend domain prefixes:
- `FINANCEX:EVIDENCE:v1:`
- `FINANCEX:IDENTIFIER:v1:`
- `FINANCEX:ACHIEVEMENT:v1:`

### 3.2 Canonical Evidence Serialization
Raw evidence payload objects are canonicalized via `canonicalizeEvidence()`:
1. Recursive key sorting (`sortAndSanitizeObject`).
2. PII masking guarantee (`maskPII`) applied to all string values before hashing.
3. SHA-256 digest computation prefixed with `0x`.

### 3.3 Identifier Normalization
Identifiers (URLs, phone numbers, UPI IDs) are lowercased, trimmed, and normalized (e.g. stripping `https://` schemes) before hashing.

---

## 4. Wallet UX & Network Configuration

- **Target Network:** Polygon Amoy Testnet (Chain ID `80002` / `0x13882`).
- **Explorer Base URL:** `https://amoy.polygonscan.com`
- **Optional Wallet Policy:** Ordinary learning, quizzes, calculators, and Shield scam analysis require **no wallet connection**. Wallets are requested only when explicit on-chain actions (claiming credentials or anchoring evidence) are triggered.
- **Error Handling:** Handles user rejection, network mismatches, insufficient testnet funds, and RPC failures with human-readable error messages.

---

## 5. UI Seams & Routes

- `/prove` — Dashboard displaying user soulbound credentials, anchored evidence fingerprints, and registry query.
- `/prove/credentials` — Credential gallery with claim button.
- `/verify/credential/[tokenId]` — Independent public verification page querying `CredentialSBT` on-chain.
- `/verify/evidence/[hash]` — Independent evidence verification page querying `EvidenceAnchor` on-chain.
- `/report` — Step 5 pre-filing review includes optional "Anchor Evidence Fingerprint on Polygon Amoy" action.
