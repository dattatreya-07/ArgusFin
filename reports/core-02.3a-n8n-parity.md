# CORE-02.3A — Production n8n Integration Decision Parity Report

## Executive Summary

This report documents the verification of decision parity between the Web Check API (`POST /api/check`) and the n8n Integration API (`POST /api/integrations/n8n/analyze`).

---

## 1. Parity Architecture

Both entry points call the canonical open-world detection engine (`analyzeScam()` in `src/lib/scam/analyze.ts`):

- **`/api/check`**: Accepts web text inputs, executes `analyzeScam()`, and formats web UI response JSON.
- **`/api/integrations/n8n/analyze`**: Accepts n8n Telegram/WhatsApp webhook payloads, validates secret token, normalizes channel input, executes `analyzeScam()`, and formats Markdown response DTO.

---

## 2. Decision Parity Evaluation Results

All 20 novel unseen scam messages were executed in parallel through `/api/check` and `/api/integrations/n8n/analyze`:

| Test ID | Category | Web `/api/check` Band | n8n `/api/integrations/n8n/analyze` Band | Decision Parity |
| :--- | :--- | :--- | :--- | :--- |
| `api-01-courier` | courier | **HIGH** | **HIGH** | ✅ PERFECT MATCH |
| `api-02-electricity` | electricity | **HIGH** | **HIGH** | ✅ PERFECT MATCH |
| `api-03-employment` | employment | **MEDIUM** | **MEDIUM** | ✅ PERFECT MATCH |
| `api-04-refund` | fake refund | **MEDIUM** | **MEDIUM** | ✅ PERFECT MATCH |
| `api-05-gov` | government impersonation | **MEDIUM** | **MEDIUM** | ✅ PERFECT MATCH |
| `api-06-social` | social engineering | **MEDIUM** | **MEDIUM** | ✅ PERFECT MATCH |
| `api-07-support` | fake support | **HIGH** | **HIGH** | ✅ PERFECT MATCH |
| `api-08-crypto` | crypto | **MEDIUM** | **MEDIUM** | ✅ PERFECT MATCH |
| `api-09-legal` | fake legal threat | **HIGH** | **HIGH** | ✅ PERFECT MATCH |
| `api-10-travel` | fake travel refund | **MEDIUM** | **MEDIUM** | ✅ PERFECT MATCH |
| `api-11-digital-arrest` | digital arrest | **HIGH** | **HIGH** | ✅ PERFECT MATCH |
| `api-12-challan-apk` | traffic challan apk | **HIGH** | **HIGH** | ✅ PERFECT MATCH |
| `api-13-rental-deposit` | rental deposit scam | **MEDIUM** | **MEDIUM** | ✅ PERFECT MATCH |
| `api-14-medical-emergency` | medical emergency scam | **HIGH** | **HIGH** | ✅ PERFECT MATCH |
| `api-15-pension-update` | fake pension update | **HIGH** | **HIGH** | ✅ PERFECT MATCH |
| `api-16-blue-tick` | fake social media verification | **HIGH** | **HIGH** | ✅ PERFECT MATCH |
| `api-17-loyalty-points` | fake loyalty rewards | **HIGH** | **HIGH** | ✅ PERFECT MATCH |
| `api-18-sim-kyc` | fake telecom kyc | **HIGH** | **HIGH** | ✅ PERFECT MATCH |
| `api-19-task-group` | task scam / telegram vip group | **MEDIUM** | **MEDIUM** | ✅ PERFECT MATCH |
| `api-20-loan-waiver` | fake loan waiver | **HIGH** | **HIGH** | ✅ PERFECT MATCH |

- **Decision Parity Rate**: **100.0%** (20/20 matches).
