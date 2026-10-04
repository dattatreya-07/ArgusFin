# SANGYAN / FinanceX — n8n Integration Architecture & Workflow Specifications

This directory contains official n8n workflow templates, API specifications, and deployment requirements for integrating **Telegram Bot API** and **WhatsApp Business Cloud API** with SANGYAN via n8n.

---

## Architectural Decision & Ownership Boundary

```
Telegram / WhatsApp Users
         │
         ▼
 ┌────────────────┐
 │ n8n Workflow   │  ◄── Orchestration & Transport Layer
 └───────┬────────┘      (Owns Bot Tokens, Webhooks, outbound messaging)
         │
         │ HTTP POST (x-n8n-secret)
         ▼
 ┌────────────────┐
 │ SANGYAN API    │  ◄── Analysis Engine & Intelligence Authority
 └────────────────┘      (POST /api/integrations/n8n/analyze)
                         (Owns rules, OCR, RAG, PII masking, decisions)
```

### Responsibility Matrix

| Capability / Task | Owner | Notes |
|---|---|---|
| **Bot Token & Webhook Hosting** | **n8n** | `TELEGRAM_BOT_TOKEN`, Meta Cloud API App Credentials, Webhook URLs. |
| **Outbound Message Formatting & Delivery** | **n8n** | Converts SANGYAN `N8NIntegrationResponse` into native Telegram/WhatsApp text messages. |
| **Retry & Transmit Logic** | **n8n** | Handles network exponential backoff for Telegram / Meta APIs. |
| **Authentication Gate** | **SANGYAN** | Validates incoming n8n requests via `N8N_INTEGRATION_SECRET`. |
| **Idempotency Deduplication** | **SANGYAN** | Bounded cache keyed on `channel:messageId` suppressing duplicate retries. |
| **PII Scrubbing & Anonymization** | **SANGYAN** | Edge/server zero-knowledge PII scrubbing before analysis. |
| **Scam Detection & Fusion Engine** | **SANGYAN** | Multilingual deterministic rules, confidence scoring, and archetype classification. |
| **OCR & Image Evidence Extraction** | **SANGYAN** | Tesseract.js image text parsing & QR code extraction. |
| **Grounded RAG Knowledge Retrieval** | **SANGYAN** | Vector/lexical lookup over verified SEBI/RBI/CyberCrime corpus. |

---

## Canonical API Boundary Reference

- **Endpoint**: `POST /api/integrations/n8n/analyze`
- **Authentication**: `x-n8n-secret: <N8N_INTEGRATION_SECRET>` OR `Authorization: Bearer <N8N_INTEGRATION_SECRET>`

### Request Body Schema
```json
{
  "channel": "TELEGRAM",
  "message": {
    "id": "telegram_update_1001",
    "text": "Invest ₹10,000 get ₹20,000 in 30 days guaranteed.",
    "caption": "Check this screenshot",
    "media": [
      {
        "type": "image",
        "mimeType": "image/jpeg",
        "data": "<BASE64_ENCODED_IMAGE_STRING>",
        "filename": "proof.jpg"
      }
    ]
  },
  "locale": "en",
  "provenance": {
    "senderId": "user_12345",
    "timestamp": "2026-10-04T11:00:00Z"
  }
}
```

### Response DTO Schema
```json
{
  "status": "SUCCESS",
  "decision": {
    "band": "HIGH",
    "archetype": {
      "top": "DOUBLING_SCHEME",
      "prob": 0.85
    },
    "confidence": 0.85
  },
  "summary": "This claim promises fixed doubling returns without regulatory authorization...",
  "signals": ["GUARANTEED_RETURN", "UNREALISTIC_YIELD"],
  "unverified": ["Entity registration status", "Physical address"],
  "nextSteps": [
    { "id": "calculator", "label": "Check Reality Ladder Math", "url": "https://sangyan.in/en/calculator?invested=10000&payout=20000&days=30" },
    { "id": "report", "label": "Prepare First-Victim Report", "url": "https://sangyan.in/en/report" }
  ],
  "citations": [
    { "title": "SEBI Investor Advisory", "sourceUrl": "https://sebi.gov.in" }
  ],
  "formattedMessage": "🚨 *Argus Fin / SANGYAN Claim Check*\n\n*Risk Assessment:* HIGH RISK...",
  "locale": "en",
  "requestId": "req_abc123",
  "timestamp": "2026-10-04T11:00:01Z"
}
```

---

## Workflows Included

1. **Workflow A: Telegram → SANGYAN Analysis** (`docs/n8n/telegram-sangyan-analysis.json`)
   - **Trigger**: Telegram Trigger node (or Webhook)
   - **Action**: Extract message text/photo, send HTTP POST to `YOUR_SANGYAN_API_URL/api/integrations/n8n/analyze`, receive response, and send Telegram reply message.
2. **Workflow B: WhatsApp → SANGYAN Analysis** (`docs/n8n/whatsapp-sangyan-analysis.json`)
   - **Trigger**: WhatsApp Trigger node (or Webhook)
   - **Action**: Extract message body/image, send HTTP POST to `YOUR_SANGYAN_API_URL/api/integrations/n8n/analyze`, receive response, and send WhatsApp reply message.

---

## Deployment Requirements

1. Environment variable in SANGYAN `.env.local`:
   ```bash
   N8N_INTEGRATION_SECRET="YOUR_SECURE_RANDOM_SECRET_KEY"
   ```
2. Import `telegram-sangyan-analysis.json` and `whatsapp-sangyan-analysis.json` into your n8n instance.
3. Configure n8n environment credentials:
   - `YOUR_SANGYAN_API_URL`: Base URL of your deployed SANGYAN app (e.g., `https://sangyan.in`)
   - `YOUR_N8N_SECRET`: Matches `N8N_INTEGRATION_SECRET` in SANGYAN
   - `YOUR_TELEGRAM_CREDENTIAL`: Telegram Bot API Token
   - `YOUR_WHATSAPP_CREDENTIAL`: Meta WhatsApp Cloud API credentials
