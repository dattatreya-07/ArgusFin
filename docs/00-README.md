# SANGYAN Investor Resilience Hackathon: Project Docs

> Working name: **FinanceX: Investor Resilience** (rename is open; keep the tone "investor-protection infrastructure", not "fintech startup").
> Event: SANGYAN (SEBI + NSDL + IIT BHU SnTC), 1–4 Oct 2026. Build budget: ~50 hours.

## One-line pitch

**We don't predict markets. We show, with simple maths and cited sources, why 100% returns can't be real, in Hindi, Tamil and English, and we help people act fast when they've been targeted.**

## Document index

| File | Purpose |
|---|---|
| `00-README.md` | This file: index, hard rules, decision log, open items |
| `01-PRD.md` | Problem, users, goals, features, metrics, scope cuts |
| `02-FSD.md` | Functional spec per module, with acceptance criteria |
| `03-TDD.md` | Architecture, diagrams, data model, API contracts, build plan |

Read order for humans and AI agents: README → PRD → FSD → TDD.

## Hard rules (violating any of these can disqualify the project)

These come from the hackathon's Mandatory Guardrails. **AI coding agents must follow them too.**

1. **No investment advice.** No stock tips, buy/sell/hold signals, price predictions, trading algorithms, or promotion of any instrument, broker or platform. No "based on your profile, invest in X."
2. **No monetisation.** No ads, affiliate links, broker links, paid tiers, or upsell placeholders, not even in mock-ups or slides.
3. **Privacy by design.** Never read SMS/OTPs. Never store personal or financial identifiers (phone numbers, account numbers, UPI IDs, names). Mask them in the browser **before** any third-party API call. The server is stateless for user content.
4. **No naming and shaming.** Never label a specific company, coin, person, number or group as a scam in product content. Use **scam archetypes**. Only cite an official alert if it is in the corpus with a source URL and date.
5. **Numbers come from data, not from the model.** Every rate, return or statistic shown must come from `data/` with `source_url` and `as_of`. The LLM must never supply figures from memory.
6. **Grounded answers only.** The bot answers only from retrieved sources and shows citations. If retrieval is weak, it says **"I can't verify this"**. It never outputs "safe"; the lowest band is "No red flags found (this is not a guarantee)".
7. **No legal section citations** unless the text is in the corpus.
8. **Helplines and URLs** come only from `data/authorities.json`, and each entry must have `verified_at`. If unverified, the UI hides the number and shows the official site name only.
9. **Copyright.** Don't paste NISM or other copyrighted study material into the corpus. Use public official pages and write original summaries with source links.

## Decision log

| # | Decision |
|---|---|
| D1 | One product with two doors: **Check it** (scam check, report) and **Learn it** (lessons, simulators). The hero journey connects them. |
| D2 | Languages: Hindi, Tamil, English for all P0 flows. |
| D3 | Return range shown as **rolling 5–10 year CAGR range**, not a single number, with bad windows visible. |
| D4 | Drop: 3D, tax, login, public number blacklist, named schemes. Keep: glossary, economic-policy basics and "who regulates what" as compact content. |
| D5 | Typed decision layer via **Jev** (TypeSafe System One), with a fallback engine. Explanations come from RAG + LLM, not Jev. |
| D6 | Reporting = **report packet + victim first-record**, submitted by the user through official channels. We do not file on their behalf. |
| D7 | No user accounts. No server-side storage of user content. |

## Open items (resolve in hours 0–5)

- [ ] Jev early-access status; otherwise ship the fallback engine only.
- [ ] Verify every entry in `data/authorities.json` against official sites; set `verified_at`.
- [ ] Choose multilingual embedding model; test Tamil and Hindi retrieval quality.
- [ ] Compute ladder data (savings, FD range, bonds, index rolling CAGR) from official sources.
- [ ] Write the 30-case labelled test set (en/hi/ta).
- [ ] Confirm submission deadline and format on the official Discord.
- [ ] Final product name.

## Notes for AI agents working in this repo

- Work module by module following `02-FSD.md`; keep each change small and runnable.
- Do not add dependencies without a reason noted in `03-TDD.md` (bundle budget matters).
- Never invent data, helpline numbers, URLs, or legal sections. Leave a `TODO(verify)` marker instead.
- After any change to scoring or prompts, run the eval script and record results.
