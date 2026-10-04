# CORE-05 — Evidence Provenance & Data Integrity Model

## Evidence Provenance Schema

Every item of evidence captured across Web, Telegram, and WhatsApp includes typed provenance metadata:

```typescript
export interface EvidenceProvenanceItem {
  evidenceId: string;
  type: 'text' | 'ocr_image' | 'url' | 'user_input' | 'n8n_payload';
  sourceChannel: 'website' | 'telegram' | 'whatsapp';
  captureTimestamp: string;
  contentHash: string; // SHA-256 hash of original input
  ocrConfidence?: number;
  urlProvenance?: string;
  extractionProvenance: 'USER_INPUT' | 'OCR_PARSER' | 'DETERMINISTIC_PARSER' | 'N8N_ADAPTER';
  maskingState: 'PII_MASKED' | 'UNMASKED_EXPORT';
  originalVsNormalized: {
    originalTextSnippet: string; // PII-masked original snippet
    normalizedText: string;
  };
}
```

## Immutable Integrity Hashing

Each `CanonicalReportPacket` generates a cryptographic SHA-256 hash over its contents:
```typescript
const exportIntegrityHash = sha256(JSON.stringify(packetWithoutHash));
```
This hash guarantees that any subsequent editing or tampering of the report text after export can be identified by comparing content hashes.

## Fact vs Allegation Distinction

SANGYAN enforces defensive legal language to avoid defamation or premature factual declarations:
- **Allowed**: `"Observed claim"`, `"Reported request"`, `"Potential concern"`, `"Could not verify"`, `"Suggested reporting route"`.
- **Forbidden**: `"Person X is a fraud"`, `"Company Y is a scam"`.
- User statements are stored explicitly under `userStatements` and wrapped with `"User Statement: ..."` labeling.
