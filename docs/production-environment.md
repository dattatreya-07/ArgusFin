# SANGYAN Production Environment Contract

## Environment Variable Schema & Classification

This document specifies all runtime environment variables utilized by SANGYAN / FinanceX. Secrets must NEVER be committed to source control or exposed via `NEXT_PUBLIC_` prefixes unless strictly required for public client UI handles.

| Variable Name | Scope | Classification | Description | Production Default / Guidance |
|---|---|---|---|---|
| `GROQ_API_KEY` | Server-only | REQUIRED (OPTIONAL FALLBACK) | API key for Groq Llama-3 grounded educational synthesis. If absent, system gracefully falls back to deterministic extractive RAG. | Secret string from Groq console |
| `N8N_INTEGRATION_SECRET` | Server-only | REQUIRED FOR N8N | Secret header (`x-sangyan-n8n-secret`) required to authenticate n8n Telegram/WhatsApp webhook payloads. | High-entropy random hex string |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Client & Server | OPTIONAL | Public Telegram bot handle rendered in UI connection modals. | e.g. `SangyanSafetyBot` |
| `NODE_ENV` | Server | REQUIRED | Execution environment indicator (`development`, `test`, `production`). | `production` |

## Security & Isolation Rules

1. **No Client Leakage**: `GROQ_API_KEY` and `N8N_INTEGRATION_SECRET` MUST NOT be prefixed with `NEXT_PUBLIC_`.
2. **Stateless Operations**: No database connection strings or storage bucket credentials are required; server operates statelessly for citizen privacy.
3. **Build Validation**: The build process checks that secrets are absent from static bundles and client JS output.
