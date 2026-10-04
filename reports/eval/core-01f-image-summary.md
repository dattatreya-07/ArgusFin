# CORE-01F Image, OCR & QR Pipeline Evaluation Summary

- **Timestamp**: 2026-10-03T14:26:45.713Z
- **Total Image Test Cases**: 20
- **Image Validation Success Rate**: 100% (20/20)
- **Scam Decision Accuracy**: 100.0% (20/20)
- **Benign False-Alarm Rate**: 0.0%
- **Resource Limits & Safety Boundary**: VERIFIED PASS

## Metrics Breakdown
- **OCR Text & Numeric Preservation**: Preserved 100% of raw OCR digit strings without auto-conversion.
- **QR Code Extraction**: Safely parsed UPI payment URIs and URLs into structured evidence without auto-navigation.
- **Prompt Injection Defense**: 100% of injected instructions inside OCR text were treated purely as untrusted text DATA.
- **PII Scrubbing**: 100% of sensitive phone numbers, emails, and account numbers masked prior to evaluation.
