# 01: Product Requirements Document (PRD)

**Status:** Draft v0.1 · **Event:** SANGYAN Investor Resilience Hackathon · **Build window:** ~50 hours

## 1. Problem

India's retail investor base has grown fast (16+ crore Demat accounts; 70%+ of new retail accounts from non-metro, Tier-2 and Tier-3 cities, per the hackathon brief). Market access has outrun financial confidence. Many first-time investors, and the relatives who forward them offers, don't know how real returns work, so promises of "double your money" (courses, tip groups, copy trading, crypto staking, fake apps) sound plausible. SEBI's own study cited in the brief says 9 in 10 individual F&O traders lose money.

**Root cause we target:** people can't judge a promise because they've never seen what normal returns look like, or how a scheme can pay "returns" without earning any.

## 2. Target users

| ID | User | Needs |
|---|---|---|
| A | **First-time investor**, 22–35, Tier-2/3, regional-language-first | Understand returns and terms without jargon; check an offer before paying |
| B | **Family member / senior** who receives forwarded offers | Quick, voice-friendly, language-friendly check; something to forward back to the sender |
| C | **Recent victim** (or near-victim) | Know what to do in the first hour; produce a clear record for officials |

Constraints: low-end Android, patchy 4G, low literacy in English, high cognitive load under pressure.

## 3. Goals and non-goals

**Goals**
1. Make unrealistic promises *visibly* unrealistic in under 30 seconds, using maths and cited sources.
2. Explain core concepts (returns, CAGR, volatility, compounding, regulators) in Hindi, Tamil and English with interactive simulators.
3. Check a suspicious message, link or screenshot and return an **explainable, uncertainty-honest** result.
4. Route the user to the **right authority** and generate a structured first-victim record.

**Non-goals**
- No advice, tips, signals, predictions, or product/broker promotion.
- No monetisation, no accounts, no data storage, no public blacklist, no accusations against named entities.
- No 3D, no tax module, no filing on the user's behalf.

## 4. Hero user journey (the demo)

1. A relative forwards: "Invest ₹10,000, get ₹20,000 in 30 days via copy trading. Limited slots, join our VIP group."
2. User B opens the app, taps the mic, and speaks or pastes it (Tamil/Hindi/English).
3. **Promise-to-Reality Calculator** shows the annualised equivalent next to the Reality Ladder (savings, FD, bonds, index CAGR range).
4. **Scam Check** returns the type (e.g. copy-trading scheme), risk band, red flags with reasons, signals found with sources, and what could not be verified.
5. **"How these schemes pay you"** simulator shows early payouts funded by new deposits, then collapse.
6. The bot explains in the user's language, with citation chips.
7. **Pause checklist** (5 questions) and a **share card** for the family WhatsApp group.
8. If already paid: **First 60 minutes** flow → responsible-authority router → AI-drafted **first-victim record** (bilingual PDF).

## 5. Feature list and priority

| ID | Feature | Priority | Maps to criterion |
|---|---|---|---|
| F1 | Promise-to-Reality Calculator | P0 | Resilience (30%) |
| F2 | Reality Ladder (data-driven, with ranges and bad years) | P0 | Resilience, Trust |
| F3 | Scam Check (text, link, screenshot, voice) with typed decision + rules | P0 | Resilience, Technical |
| F4 | Responsible-authority router | P0 | Resilience |
| F5 | Victim first-record generator (guided intake → PDF) | P0 | Resilience, Feasibility |
| F6 | "How scams pay you" simulator | P0 | Resilience, Bharat-first |
| F7 | Cited RAG bot (hi/ta/en, text + audio) | P0 | Technical, Trust |
| F8 | Language + voice (STT/TTS) | P0 | Bharat-first (25%) |
| F9 | Pause-before-you-pay checklist | P1 | Resilience (Track D) |
| F10 | Share card (language-specific, forwardable) | P1 | Impact, Feasibility |
| F11 | Lessons (6–8) + glossary + "who regulates what" | P1 | Bharat-first, Education |
| F12 | Volatility / crash simulator (zero money) | P1 | Education |
| F13 | PWA offline caching for lessons | P2 | Bharat-first |
| F14 | Bhashini integration (translation/speech) | P2 | Technical |

**Cut line:** if behind schedule at hour 32, drop F12–F14, then F10, then reduce F11 to glossary only. F1–F8 are the product.

## 6. Success metrics (demonstrable at submission)

| Metric | Target |
|---|---|
| Scam-type top-1 accuracy on labelled test set (30 cases, en/hi/ta) | ≥ 85% |
| High-risk recall (known scam samples flagged HIGH or MEDIUM) | ≥ 90% |
| Calibration check (higher confidence → higher accuracy) | Reported in deck |
| Time to first result on throttled 4G | < 5 s |
| Initial JS for the main flow | < 150 KB gzipped |
| P0 flows complete in all three languages | 100% |
| Answers with at least one citation or an explicit "can't verify" | 100% |

## 7. Guardrail compliance

See `00-README.md`, Hard rules. Compliance is a release gate: the checklist in `03-TDD.md` §12 must pass before submission.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Scope too large for 50 h | Strict cut line; P0 only until hour 32 |
| LLM hallucination in Tamil/Hindi | Retrieval-only answers, citation required, "can't verify" fallback, human-reviewed translations of fixed UI text |
| Jev early access unavailable | `DecisionEngine` interface + Groq structured-output fallback |
| Tamil/Hindi OCR quality on screenshots | Test early (hours 0–5); text-paste path always available |
| Third-party API limits/outage during demo | Cached demo scenarios; recorded fallback video |
| Misreading "ladder" as advice | Descriptive only; ranges including bad years; "not a recommendation" note; no "buy this" language |
| Privacy of screenshots sent to a vision API | Consent notice, no storage, crop option (P1), text-only path |

## 9. Timeline (50 h)

| Hours | Focus |
|---|---|
| 0–5 | Scope lock, data collection, test set, RAG corpus, authority verification, Jev/embedding decisions |
| 5–22 | F3, F4, F1, F2, F5 core |
| 22–32 | F6, F7, F8, F11 (lite), language packs |
| 32–40 | F9, F10, voice polish, deploy, eval run, bundle check |
| **40** | **Feature freeze** |
| 40–50 | Demo video, deck, submission, buffer |
