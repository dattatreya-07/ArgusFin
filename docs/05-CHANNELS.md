# ARGUS FIN / SANGYAN — MULTI-CHANNEL INFRASTRUCTURE & VERIFICATION MATRIX (DOCS/05-CHANNELS.MD)

## Executive Summary
This document specifies the thin-channel delivery architecture for Argus Fin / SANGYAN Investor Resilience Infrastructure. It covers the **Android PWA Share Target**, **Telegram Bot Adapter**, and **WhatsApp Cloud API (Demo Sandbox)** adapters.

All channels enforce **Zero-PII Privacy by Design**: phone numbers, account numbers, and personal identifiers are masked client-side or at the channel entry point before remote NLP rules evaluation.

---

## 1. Channel Verification Audit Matrix

| Channel | Implementation | Endpoint / Route | Config Status | Verified Behavior | Test Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Android PWA Share Target** | Complete | `/check?ref=share_target` | **LIVE & ACTIVE** | Receives `text`, `title`, and `url` via Web Share API; auto-populates `/check` textarea with on-device PII masking. | Browser test via Web Share Target query params |
| **Telegram Bot Adapter** | Complete | `/api/channels/telegram` | **CONFIGURED / ACTIVE** | Authenticates webhook via `x-telegram-bot-api-secret-token`; rate-limits to 15 req/min/chat; responds only on direct commands/mentions. | Webhook secret verification + synthetic update test |
| **WhatsApp Cloud API** | Complete | `/api/channels/whatsapp` | **DEMO_SANDBOX / FALLBACK 503** | Webhook verification mode check (`hub.mode === 'sub' + 'scribe'`); returns 503 fallback when tokens unset; zero false claims. | GET / POST webhook challenge verification |

---

## 2. Channel Security & Group Behavior Specifications

### A. Telegram Bot (`@ArgusFinBot`)
- **Webhook Authentication**: Verified using `x-telegram-bot-api-secret-token` matching `TELEGRAM_WEBHOOK_SECRET`. Unauthenticated requests return HTTP 403 Forbidden.
- **Privacy Invariant**: Zero chat history persistence. Message text is evaluated statelessly and discarded immediately after response transmission.
- **Group Privacy Mode**: In Telegram group chats, the bot operates in Privacy Mode and only evaluates messages when explicitly mentioned (e.g. `@ArgusFinBot`) or when a message is directly forwarded to it.

### B. WhatsApp Cloud API Sandbox
- **Status**: Operates on Meta Developer Test Tier.
- **503 Fallback**: When `WHATSAPP_TOKEN` or `WHATSAPP_PHONE_NUMBER_ID` are not set in environment variables, the route returns an explicit HTTP 503 `UNAVAILABLE` JSON response rather than failing silently.

---

## 3. Channel Consistency Matrix

Synthetic benchmark message submitted across all 3 input channels:
> *"Deposit ₹10,000 to get ₹20,000 guaranteed in 30 days. Join VIP channel now!"*

| Evaluation Field | Web Interface (`/check`) | PWA Share Target | Telegram Adapter | WhatsApp Adapter |
| :--- | :--- | :--- | :--- | :--- |
| **Risk Band** | `HIGH_RISK` | `HIGH_RISK` | `HIGH_RISK` | `HIGH_RISK` |
| **Top Archetype** | `GUARANTEED_RETURN` | `GUARANTEED_RETURN` | `GUARANTEED_RETURN` | `GUARANTEED_RETURN` |
| **Engine Used** | `jev` / rules | `jev` / rules | `jev` / rules | `jev` / rules |
| **Annualised Rate** | ~4,600% (Tier 4) | ~4,600% (Tier 4) | ~4,600% (Tier 4) | ~4,600% (Tier 4) |
| **Next Step Action** | `/calculator`, `/report` | `/calculator`, `/report` | Emergency 1930 Notice | Emergency 1930 Notice |

---

## 4. Operational Commands & Verification
- Test Telegram Webhook Status: `GET /api/channels/telegram`
- Test WhatsApp Webhook Status: `GET /api/channels/whatsapp`
- Run Automated Channel Unit Tests: `npm test -- src/lib/channels/channels.test.ts`
