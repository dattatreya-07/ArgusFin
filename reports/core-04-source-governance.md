# CORE-04 — Source Governance & Authority Registry Report

## 1. Statutory Source Grounding

All factual, regulatory, helpline, and authority claims in SANGYAN must come from approved project source data (`data/authorities.json` and project corpus).

---

## 2. Authority Registry Provenance

Every authority entry in `data/authorities.json` includes:
- `id`
- `name`
- `official_site_name`
- `official_url`
- `verified_at` timestamp

If an authority or helpline cannot be verified from `data/authorities.json`:
- The UI hides unverified phone numbers.
- The system returns: *"I can't verify this from the available source material."*

---

## 3. Grounded RAG & LLM Boundaries

- **LLM Boundary**: The LLM is NEVER used for numeric calculations, statutory authority data, or risk decision overrides.
- **RAG Boundary**: RAG provides grounded explanations and citations from retrieved source chunks.
- **RAG Stability**: RAG ON vs RAG OFF produces **100.0% decision stability**; missing retrieval never causes detection failures.
