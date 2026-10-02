# AGENTS.md

Instructions for AI coding agents and human contributors. Detailed docs are in `docs/`.

## 9 Hard Rules (Mandatory Guardrails)
1. **No investment advice.** No stock tips, buy/sell/hold signals, price predictions, trading algorithms, or promotion of any instrument, broker or platform.
2. **No monetisation.** No ads, affiliate links, broker links, paid tiers, or upsell placeholders, not even in mock-ups or slides.
3. **Privacy by design.** Never read SMS/OTPs. Never store personal or financial identifiers (phone numbers, account numbers, UPI IDs, names). Mask them in the browser before any third-party API call. Server is stateless for user content.
4. **No naming and shaming.** Never label a specific company, coin, person, number or group as a scam in product content. Use scam archetypes. Only cite official alerts with source URL and date.
5. **Numbers come from data, not from the model.** Every rate, return, or statistic shown must come from `data/` with `source_url` and `as_of`. The LLM must never supply figures from memory.
6. **Grounded answers only.** The bot answers only from retrieved sources and shows citations. If retrieval is weak, it says "I can't verify this". It never outputs "safe"; lowest band is "No red flags found (this is not a guarantee)".
7. **No legal section citations** unless the text is in the corpus.
8. **Helplines and URLs** come only from `data/authorities.json`, and each entry must have `verified_at`. If unverified, UI hides the number and shows the official site name only.
9. **Copyright.** Don't paste copyrighted material into the corpus. Use public official pages and write original summaries with source links.

## How to Work in this Repo
- Documentation is ground truth: `00-README.md` -> `01-PRD.md` -> `02-FSD.md` -> `03-TDD.md`.
- Write small, typed, tested, plain functions. No extraneous abstractions or unapproved dependencies.
- Never invent data, phone numbers, URLs, or legal sections; use `TODO(verify)` or null.
- Mark placeholder translations as `TODO(review)`.
- Never log or store raw user content.

## Commands
- `npm run dev`: Start Next.js development server
- `npm run build`: Production Next.js build
- `npm run start`: Start production Next.js server
- `npm run lint`: Run ESLint checks
- `npm run typecheck`: Run TypeScript type checks (`tsc --noEmit`)
- `npm test`: Run unit tests with Vitest
- `npm run guardrails`: Run automated guardrail policy checks
