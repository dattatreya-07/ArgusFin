# CORE-04B Grounded AI Architecture & Synthesis Report

## 1. Executive Summary
**CORE-04B** expands SANGYAN's educational Q&A system from a narrow, regulatory-only extractive search into an authoritative, grounded educational Q&A pipeline with optional LLM synthesis (`GroqGroundedSynthesizerProvider`), while strictly maintaining the non-negotiable safety hierarchy:

```
DETERMINISTIC RULES FIRST
→ GROUNDED RETRIEVAL SECOND
→ LLM SYNTHESIS LAST
```

The system guarantees that the LLM is **NEVER** the source of financial truth. All generated answers derive strictly from verified corpus chunks, with automated citation validation that discards ungrounded outputs and seamlessly falls back to extractive deterministic evidence blocks.

---

## 2. Non-Negotiable Safety Architecture
1. **Zero Hallucination Guarantee**: If retrieved evidence similarity fails to meet the minimum threshold, the system returns `status: 'NO_SOURCE'` with the localized uncertainty statement:
   > *"I can't verify this from the available source material."*
2. **Non-Advisory Guardrail**: Educational answers explain concepts, mechanisms, and risks. The system strictly prohibits stock recommendations, buy/sell signals, target price predictions, or brokerage suggestions.
3. **Citation Provenance Guard**: Every claim in an LLM synthesis payload must cite a valid `chunkId` present in the top retrieved evidence list. If citation validation fails, the output is discarded and replaced by `ExtractiveEducationalProvider`.

---

## 3. Provider Abstraction Architecture (`src/lib/rag/provider.ts`)
- **`EducationalAnswerProvider`**: Interface defining `generateAnswer(query, evidencePack, lang)`.
- **`ExtractiveEducationalProvider`**: Deterministic fallback provider that formats retrieved corpus text directly into bullet points.
- **`GroqGroundedSynthesizerProvider`**: Calls Groq Llama-3 (`llama-3.3-70b-versatile`) with `temperature: 0.0` and JSON schema enforcement:
  - System prompt restricts answer synthesis exclusively to supplied evidence chunks.
  - Bounded timeout: 3000ms.
  - Automatic fallback to `ExtractiveEducationalProvider` on network failure, timeout, or invalid citation schema.

---

## 4. Evidence Sufficiency & Weak Source Handling
- **`STRONG_SOURCE` (Similarity >= 0.28)**: Synthesizes direct grounded answer with full verified citations.
- **`WEAK_SOURCE` (Similarity 0.18 to 0.27)**: Prefixes the answer with a localized limited verification disclaimer:
  > *⚠️ Limited Verification: Related official material was retrieved, but it may not fully answer every aspect of this query.*
- **`NO_SOURCE` (Similarity < 0.18)**: Returns `"I can't verify this from the available source material."`

---

## 5. RAG Injection Defense
User queries and retrieved text chunks are wrapped in `<retrieved_evidence_data>` tags and treated strictly as **UNTRUSTED DATA**. System prompts prohibit executing instructions embedded inside corpus text or user queries, ensuring adversarial jailbreak attempts fail safely.
