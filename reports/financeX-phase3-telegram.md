# Workstream E: Telegram & n8n Integration Reliability Report

## 1. Trace & Failure Analysis

Previous workflow failures yielding *"SANGYAN could not complete the analysis right now"* were audited along the full communication pipeline:

```
Telegram User -> Telegram Bot Webhook -> n8n Workflow Trigger -> /api/integrations/n8n/analyze -> SANGYAN Engine -> Telegram Response
```

### Identified Points of Failure & Fixes:
1. **Missing / Unmatched Secret Header:**
   - *Fix:* Timing-safe comparison supporting both `x-n8n-secret` and `Authorization: Bearer <token>` headers.
2. **Generic Error Fallbacks:**
   - *Fix:* Explicit diagnostic error responses returning structured codes (`N8N_AUTH_FAILED`, `N8N_BAD_REQUEST`, `SANGYAN_TIMEOUT`, `SANGYAN_INTERNAL_ERROR`, `RATE_LIMITED`) so n8n execution nodes accurately branch on failures.
3. **Payload Malformation Guard:**
   - *Fix:* Strict schema validation enforcing `channel: 'TELEGRAM' | 'WHATSAPP'`, `message.id`, and max text bounds (15,000 chars).
4. **Analysis Timeout Protection:**
   - *Fix:* 10-second `Promise.race` timeout guard returning HTTP 504 with `SANGYAN_TIMEOUT` error response.

---

## 2. Structured Error Code Reference

| HTTP Status | Error Code | Diagnostic Meaning |
|---|---|---|
| **401** | `N8N_AUTH_FAILED` | Secret header missing or timing-safe token mismatch |
| **400** | `N8N_BAD_REQUEST` | Malformed JSON or invalid schema parameters |
| **413** | `OVERSIZED_INPUT` | Message text or attachment exceeds bounds |
| **415** | `UNSUPPORTED_MEDIA` | Attachment MIME type not supported |
| **429** | `RATE_LIMITED` | Request rate exceeds 60 req/min threshold |
| **504** | `SANGYAN_TIMEOUT` | Computation exceeded 10s timeout budget |
| **500** | `SANGYAN_INTERNAL_ERROR` | Internal server evaluation exception |

---

## 3. Live Deployment Status Notice

> [!IMPORTANT]
> **Live Integration Verification Notice:**
> - Mock Integration Tests: **6 / 6 PASSED** (`tests/integrations/n8n.test.ts`).
> - Live Telegram Verification: **LIVE TELEGRAM VERIFICATION BLOCKED — credentials/deployment access required** (Production Telegram bot token, live webhook registration, and Vercel environment secrets must be configured in active production deployment).
