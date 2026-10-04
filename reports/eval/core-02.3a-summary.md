# CORE-02.3A — Production API & Open-World Verification Summary

## Executive Overview
- **Evaluated At**: 2026-10-04T10:09:43.495Z
- **Novel Unseen Scam API Pass Rate**: **100.0%** (20 / 20)
- **Benign Educational Pass Rate**: **100.0%** (7 / 7)
- **n8n Decision Parity Rate**: **100.0%** (20 / 20)
- **Image OCR Pipeline Pass Rate**: **100.0%** (4 / 4)

---

## 20 Novel Unseen Scam API Results (/api/check)

| ID | Category | Returned Risk | Returned Archetype | HTTP Status | Latency | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `api-01-courier` | courier | **HIGH** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 49ms | ✅ PASS |
| `api-02-electricity` | electricity | **HIGH** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 4ms | ✅ PASS |
| `api-03-employment` | employment | **MEDIUM** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 7ms | ✅ PASS |
| `api-04-refund` | fake refund | **MEDIUM** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 7ms | ✅ PASS |
| `api-05-gov` | government impersonation | **MEDIUM** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 5ms | ✅ PASS |
| `api-06-social` | social engineering | **MEDIUM** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 7ms | ✅ PASS |
| `api-07-support` | fake support | **HIGH** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 12ms | ✅ PASS |
| `api-08-crypto` | crypto | **MEDIUM** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 3ms | ✅ PASS |
| `api-09-legal` | fake legal threat | **HIGH** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 2ms | ✅ PASS |
| `api-10-travel` | fake travel refund | **MEDIUM** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 3ms | ✅ PASS |
| `api-11-digital-arrest` | digital arrest | **HIGH** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 3ms | ✅ PASS |
| `api-12-challan-apk` | traffic challan apk | **HIGH** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 8ms | ✅ PASS |
| `api-13-rental-deposit` | rental deposit scam | **MEDIUM** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 3ms | ✅ PASS |
| `api-14-medical-emergency` | medical emergency scam | **HIGH** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 2ms | ✅ PASS |
| `api-15-pension-update` | fake pension update | **HIGH** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 2ms | ✅ PASS |
| `api-16-blue-tick` | fake social media verification | **HIGH** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 2ms | ✅ PASS |
| `api-17-loyalty-points` | fake loyalty rewards | **HIGH** | `FAKE_TRADING_APP_OR_PORTAL` | `200` | 3ms | ✅ PASS |
| `api-18-sim-kyc` | fake telecom kyc | **HIGH** | `OTHER_SUSPICIOUS_FINANCIAL_PATTERN` | `200` | 2ms | ✅ PASS |
| `api-19-task-group` | task scam / telegram vip group | **MEDIUM** | `PUMP_AND_DUMP_GROUP` | `200` | 2ms | ✅ PASS |
| `api-20-loan-waiver` | fake loan waiver | **HIGH** | `DOUBLING_SCHEME` | `200` | 3ms | ✅ PASS |

---

## n8n Integration Parity (/api/integrations/n8n/analyze)

| ID | Check Band | n8n Band | Parity |
| :--- | :--- | :--- | :--- |
| `api-01-courier` | **HIGH** | **HIGH** | ✅ MATCH |
| `api-02-electricity` | **HIGH** | **HIGH** | ✅ MATCH |
| `api-03-employment` | **MEDIUM** | **MEDIUM** | ✅ MATCH |
| `api-04-refund` | **MEDIUM** | **MEDIUM** | ✅ MATCH |
| `api-05-gov` | **MEDIUM** | **MEDIUM** | ✅ MATCH |
| `api-06-social` | **MEDIUM** | **MEDIUM** | ✅ MATCH |
| `api-07-support` | **HIGH** | **HIGH** | ✅ MATCH |
| `api-08-crypto` | **MEDIUM** | **MEDIUM** | ✅ MATCH |
| `api-09-legal` | **HIGH** | **HIGH** | ✅ MATCH |
| `api-10-travel` | **MEDIUM** | **MEDIUM** | ✅ MATCH |
| `api-11-digital-arrest` | **HIGH** | **HIGH** | ✅ MATCH |
| `api-12-challan-apk` | **HIGH** | **HIGH** | ✅ MATCH |
| `api-13-rental-deposit` | **MEDIUM** | **MEDIUM** | ✅ MATCH |
| `api-14-medical-emergency` | **HIGH** | **HIGH** | ✅ MATCH |
| `api-15-pension-update` | **HIGH** | **HIGH** | ✅ MATCH |
| `api-16-blue-tick` | **HIGH** | **HIGH** | ✅ MATCH |
| `api-17-loyalty-points` | **HIGH** | **HIGH** | ✅ MATCH |
| `api-18-sim-kyc` | **HIGH** | **HIGH** | ✅ MATCH |
| `api-19-task-group` | **MEDIUM** | **MEDIUM** | ✅ MATCH |
| `api-20-loan-waiver` | **HIGH** | **HIGH** | ✅ MATCH |
