# 02: Functional Specification (FSD)

**Status:** Draft v0.1 · Companion to `01-PRD.md` and `03-TDD.md`
Languages: `en`, `hi`, `ta`. "Language pack" = UI strings + LLM output language + TTS/STT locale (`en-IN`, `hi-IN`, `ta-IN`).

## 0. Global behaviour

- **G1: Language switcher** on every screen; choice persists in the browser only (localStorage).
- **G2: Voice** where a text input exists: mic button (STT) and speaker button (TTS) on result text. If the device lacks a voice for the language, hide the button and show text only.
- **G3: Disclaimers** (short, translated): "Educational tool. Not investment advice. Not a legal document."
- **G4: No-"safe" rule:** the lowest risk band reads "No red flags found. This is not a guarantee."
- **G5: Citations:** every generated explanation shows source chips (title, publisher, date, link). No sources → "I can't verify this."
- **G6: Privacy notice** on first use: what is masked, what is sent to third parties, that nothing is stored.
- **G7: Low-bandwidth:** each screen usable with JS-light fallback text; images optional; simulators lazy-load.

---

## M1: Promise-to-Reality Calculator (F1)

**Purpose:** Convert any promise into an annualised figure and place it beside real-world ranges.

**Inputs:** invested amount `P` (₹), promised payout `A` (₹), duration `d` with unit (days / weeks / months / years), optional toggle "promised as guaranteed".

**Calculations (deterministic, no LLM):**
- `multiple = A / P`
- `total_gain_pct = (multiple − 1) × 100`
- `days = d converted to days`
- `annualised_multiple = multiple^(365 / days)`
- `annualised_return_pct = (annualised_multiple − 1) × 100`
- `vs_ladder`: ratio of `annualised_return_pct` to each ladder reference (see M2)
- `reinvest_view`: value of ₹P after 12 months if the same promised rate repeated (display in scientific notation if > 10^12)

**Worked example:** ₹10,000 → ₹20,000 in 30 days. `multiple = 2`; `annualised_multiple = 2^(365/30) ≈ 4,600×`; annualised return ≈ 4,59,700%.

**Output tiers (descriptive, not accusatory):**
1. Within the typical savings/FD range
2. Above savings/FD, within long-term index range (shown with the *range*, including weak periods)
3. Above any long-term range in our data
4. Not sustainable as a repeating rate (annualised multiple > 100×)

Tier text always includes: "Returns this high cannot be guaranteed. Check who is registered and who regulates this." No named instruments.

**Acceptance criteria**
- Given ₹10,000 → ₹20,000 in 30 days, the app shows ≈ 4,600× annualised and tier 4.
- Given ₹10,000 → ₹10,600 in 365 days, the app shows 6% and tier 1 or 2 depending on ladder data.
- Invalid or zero inputs show a friendly inline message; no crash.
- Works fully offline once loaded (pure client-side).

---

## M2: Reality Ladder (F2)

**Purpose:** Show what normal looks like.

**Rungs (data in `data/ladder.json`, each with `source_url`, `as_of`):**
1. Savings account interest range
2. Bank fixed deposit range
3. Government securities / small-savings reference range
4. Equity index **rolling CAGR over 5-year and 10-year windows**: min, median, max, and the share of windows below the FD range
5. "The promise" (injected from M1)

**Rules**
- Values are computed or copied from official data and never typed from memory. Empty value → rung hidden with "data being verified".
- Always display the **range**, plus a note that past returns don't predict future ones.
- No instrument is recommended, and the copy never says "invest in" any rung.

**Acceptance criteria**
- Every number shows an `as_of` date and a source link.
- The bad-window statistic is visible without scrolling on mobile.
- Ladder renders as accessible bars with text alternatives.

---

## M3: Scam Check (F3)

**Inputs (any):** pasted text, URL, screenshot (image), voice (converted to text).

**Pipeline**
1. **Mask** phone numbers, account-like digit runs, UPI IDs and emails in the browser. Show the user the masked text.
2. **Image path:** after consent, send the image to the vision model to extract text and claims; no storage.
3. **Extract** (structured JSON): promised returns, deadlines/urgency phrases, requests (OTP, app install, payment, group join), claimed registration numbers, links, handles, claimed credentials.
4. **Signals (verifiable only):** domain age and registrar via RDAP; lookalike check against a list of known broker brand names; claimed-registration format check; match against the official-alerts snapshot (if the corpus has any); app-install or remote-access requests.
5. **Rules engine:** deterministic red-flag set (see below) → rule score and reasons.
6. **Decision engine (typed):** returns probabilities over scam type, risk band, urgency, and a confidence value.
7. **Fusion:** final band = max severity of (rules, decision), unless confidence < 0.5 and no rules fire → `CANNOT_VERIFY`.
8. **Explain:** retrieve scam-pattern and official-source chunks → generate explanation in the user's language, constrained to retrieved text and signals.
9. **Next steps:** M4 router + lesson links (M11) + calculator prefilled with the extracted promise (M1).

**Red-flag rules (initial set)**
`GUARANTEED_RETURN`, `RETURN_TOO_HIGH` (via M1), `URGENCY_LIMITED_SLOTS`, `ASKS_OTP_OR_APP_INSTALL`, `PAY_TO_PERSONAL_ACCOUNT_OR_UPI`, `VIP_GROUP_OR_PRIVATE_CHANNEL`, `UNVERIFIABLE_REGISTRATION_CLAIM`, `LOOKALIKE_DOMAIN`, `NEW_DOMAIN`, `SCREENSHOT_PROFIT_PROOF`, `COURSE_OR_MENTORSHIP_UPSELL`.

**Scam archetypes (enum):** `DOUBLING_SCHEME`, `COPY_TRADING`, `COURSE_FINFLUENCER`, `CRYPTO_STAKING_MINING`, `FAKE_TRADING_APP_OR_PORTAL`, `FAKE_ADVISORY_OR_REG_CLAIM`, `PUMP_AND_DUMP_GROUP`, `REMOTE_ACCESS_SCAM`, `FAKE_IPO_OR_ALLOTMENT`, `OTHER_OR_NONE`.

**Risk bands:** `HIGH`, `MEDIUM`, `LOW_SIGNALS`, `CANNOT_VERIFY`.

**Result card shows**
- Band + one-line reason
- Archetype with probability and confidence ("likely" language, not certainty)
- Red flags found, each with a plain-language reason
- **Signals found** (source + date) and **Could not verify** (explicit list)
- Explanation (translated, cited) with audio button
- "What to do next" buttons: Calculator, Pause checklist, Report packet, Share card

**Acceptance criteria**
- On the 30-case test set, top-1 archetype accuracy ≥ 85%, high-risk recall ≥ 90%.
- No result ever shows "safe" or names a specific company/person as a scam.
- If the decision engine is unavailable, the app falls back and still returns a rules-based result with a banner "limited mode".
- Masked values never appear in any network request.

---

## M4: Responsible-Authority Router (F4)

**Purpose:** Map scam type + situation to who to contact and how.

**Data:** `data/authorities.json` (each entry: `id`, `name`, `scope`, `channels[]` (phone/URL), `verified_at`, `source_url`).

**Routing logic (deterministic table, editable):**

| Archetype | Primary | Secondary |
|---|---|---|
| Money already paid (any) | National cyber-crime helpline + portal | User's bank (freeze/dispute) |
| `FAKE_ADVISORY_OR_REG_CLAIM`, `COURSE_FINFLUENCER`, `PUMP_AND_DUMP_GROUP`, `COPY_TRADING`, `DOUBLING_SCHEME` | SEBI complaint system | Platform report button |
| `CRYPTO_STAKING_MINING` | Cyber-crime portal | Platform report; relevant financial regulator per source |
| `FAKE_TRADING_APP_OR_PORTAL` | Cyber-crime portal | Broker/exchange verification page; app-store report |
| `REMOTE_ACCESS_SCAM` | Cyber-crime helpline (urgent) | Bank |
| Suspicious call/message source | Telecom fraud-reporting channel (verify name/URL) | Platform report |

**Rules:** only show channels with `verified_at`; otherwise show the authority name and "check the official website".

**Acceptance criteria**
- Every archetype maps to at least one authority.
- Tapping a channel opens `tel:` or the official URL; nothing is submitted by the app.

---

## M5: First-Victim Record (F5)

**Purpose:** Produce a clear, structured record for officials.

**Flow:** Guided intake (one question per screen, voice allowed) → review screen → generated record → bilingual PDF (user's language + English).

**Intake fields**
- When and how first contacted (platform, date)
- Who/what approached (handle, link, group name as the user saw it; no verification claimed)
- What was promised
- What the user did (steps in order)
- Money: amount(s), date(s), method, reference numbers (entered by user, **not stored**)
- Apps installed / access granted (e.g. remote-access)
- When and how they realised
- Actions already taken (called bank, reported, etc.)
- Evidence available (screenshots, chats, receipts)

**Generation rules**
- LLM **only** organises user-provided facts into a chronological narrative.
- Missing items listed under "Information not provided".
- No legal sections, no speculation about who is responsible, no invented amounts or dates.
- User must confirm the record before PDF generation.
- Footer: "Prepared by the user with an assistive tool. Submit through official channels."

**Acceptance criteria**
- Generated narrative contains no fact absent from the user's inputs (checked by an automated test comparing extracted entities).
- PDF is created in the browser; no server-side file storage.
- Both-language PDF opens offline.

---

## M6: "How Scams Pay You" Simulator (F6)

**Purpose:** Show how a scheme can pay early investors without earning anything.

**Behaviour:** 2D animation with a slider for promised rate and number of rounds. Round by round: new deposits arrive, early investors are paid from them, deposits slow down, payouts exceed deposits, collapse. Counter shows "money earned from real business: ₹0".

**Constraints:** zero real money; copy states this is a simplified model of a pattern, not a claim about any entity. Under 100 KB, lazy-loaded.

**Acceptance criteria**
- Running to collapse takes < 30 s; replay works.
- Keyboard and screen-reader accessible (text transcript of the animation).

---

## M7: Cited Q&A Bot (F7)

**Purpose:** Explain concepts and scam patterns in the user's language, as text and audio.

**Behaviour**
- Retrieve top-k chunks from the corpus (similarity threshold `τ`).
- If no chunk ≥ τ → "I can't verify this" + suggest official sources.
- Answers cite chunks; each claim maps to ≥ 1 chunk.
- Refuses investment advice ("which stock/fund should I buy?") with a plain-language explanation and a pointer to what it *can* explain.
- Numeric claims come only from `data/`.

**Acceptance criteria**
- Out-of-corpus questions return "I can't verify this", not an answer.
- Advice requests are refused in all three languages.
- 100% of answers carry citations or the fallback message.

---

## M8: Language and Voice (F8)

- UI strings in `locales/{en,hi,ta}.json`, human-reviewed.
- LLM output language set by `lang` parameter; never auto-switch mid-answer.
- STT: Web Speech API (`en-IN`, `hi-IN`, `ta-IN`). TTS: `speechSynthesis` with the matching voice if available.
- Fallbacks: no voice → text only; STT error → inline retry plus typed input.

**Acceptance:** every P0 screen is reachable and complete in all three languages; verified on a mid-range Android device.

---

## M9: Pause-Before-You-Pay Checklist (F9)

Five yes/no questions (translated): Was this unexpected? Is there a deadline? Are returns promised or guaranteed? Do they want payment to a personal account or an app install? Can I verify who they are through an official source? Result: a summary and "wait 24 hours, talk to someone you trust." No scoring of the person.

## M10: Share Card (F10)

Generate a language-specific card (image or text) summarising: "I checked this offer: here is why it's risky, and where to verify." Contains no personal data from the original message. Uses the Web Share API; falls back to copy.

## M11: Lessons, Glossary, Regulators (F11)

- 6–8 short lessons (≤ 3 min): what is a return, CAGR, compounding, FD vs bonds vs index (descriptive), volatility, market crash, who regulates what, how scams pay.
- Glossary of ~40 terms (yield, NAV, index, diversification, inflation, repo rate, etc.), with an economic-policy basics section.
- Content is original, sourced from public official material, and carries source links.

## M12: Volatility/Crash Simulator (F12)

Interactive chart showing how an index-like series can fall and recover; user "holds" or "panics" in a zero-money scenario and sees the result. Uses historical *shapes*, not predictions.
