# FinanceX Phase 2 Web3 Security & Privacy Review

## 1. Executive Summary
This document presents the security, privacy, and cryptographic review for the **FinanceX Phase 2 Web3 Trust Layer**.

The scope includes:
- Smart Contracts (`CredentialSBT.sol`, `EvidenceAnchor.sol`, `ScamRegistry.sol`)
- Cryptographic Hashing Engine (`hashing.ts`)
- Web3 Service Abstractions (`credentialService`, `evidenceAnchorService`, `scamRegistryService`, `walletService`)
- UI Privacy Guarantees & Verification Flows

---

## 2. Threat Model & Trust Boundaries

| Threat Vector | Attack Scenario | Mitigation / Defense |
|---|---|---|
| **On-Chain PII Leakage** | User or system accidentally submits raw names, phone numbers, UPI handles, or narrative text to contract state. | **Enforced Privacy Seam:** `canonicalizeEvidence` applies `maskPII` scrubbing recursively before computing SHA-256 digests. Smart contracts accept `bytes32` hashes only. No string text parameters exist in contract state for evidence or reports. |
| **Soulbound Token Transferability** | User attempts to sell or transfer a learning milestone credential to another wallet address. | **Custom ERC-721 Restriction:** `CredentialSBT.sol` overrides `_update` to revert on all secondary transfers, approvals, or delegate operations. |
| **Defamation / Blacklisting Abuse** | Malicious actor registers arbitrary real-world entity or competitor address as a "scam". | **Access Control & Neutral Terminology:** `ScamRegistry.sol` restricts registration to `OnlyIssuer`. Storage uses neutral hash descriptors (`isRegistered`, `sourceRefHash`) rather than defamatory labels. |
| **Domain Hash Collision** | Attackers craft an evidence payload that produces an identical hash to a learning achievement credential. | **Domain Separation:** Every digest calculation prepends distinct domain prefixes (`FINANCEX:EVIDENCE:v1:`, `FINANCEX:IDENTIFIER:v1:`, `FINANCEX:ACHIEVEMENT:v1:`). |
| **Private Key / Seed Phrase Theft** | Malicious script or third-party library attempts to inspect or extract user wallet credentials. | **Zero Storage Rule:** Web3 services interact strictly through standard browser providers (`window.ethereum` / Ethers `BrowserProvider`). No seed phrases or private keys are ever requested, logged, or stored. |

---

## 3. Cryptographic Verification & Privacy Guarantees

1. **Deterministic Hashes:** Canonical evidence serialization guarantees that identical evidence payloads generate identical digests regardless of JSON key ordering.
2. **Off-Chain Source of Truth for Raw Content:** The application index and user browser retain raw incident context privately. The blockchain acts purely as an immutability timestamp anchor.
3. **Public Independent Verification:** Verification endpoints (`/verify/credential/[tokenId]`, `/verify/evidence/[hash]`) query public RPC nodes directly, allowing third-party verifiers to validate state without trusting application database servers.

---

## 4. Contract Security & Standards Compliance

- Developed with **OpenZeppelin v5** contracts (`ERC721`, `Ownable`).
- Uses Solidity `0.8.20` arithmetic overflow protection.
- Adheres to **Checks-Effects-Interactions** pattern in minting, anchoring, and registration functions.
- Custom errors (`ErrNonTransferable`, `EvidenceAlreadyAnchored`, `HashAlreadyRegistered`) optimize gas consumption and prevent opaque reverts.

---

## 5. Explicit Limitations & Disclaimers

- **Testnet Scope:** Contracts are deployed on **Polygon Amoy Testnet** (Chain ID `80002`).
- **Audit Disclaimer:** Contracts have undergone internal automated checks and unit test verification, but have **not** undergone a third-party formal audit. They are intended for demonstration on testnet.
- **Verification Proof Scope:** On-chain anchoring proves that an evidence fingerprint was recorded at a given timestamp; it does not constitute legal proof of guilt or liability.
