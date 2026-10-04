# CORE-01I Email Scam Intake Evaluation Summary

- **Timestamp**: 2026-10-03T20:11:35.707Z
- **Manual Email Intake Surface**: AVAILABLE
- **Mailbox Connector Status**: NOT_CONFIGURED / NOT_IMPLEMENTED
- **Total Email Evaluation Cases**: 30
- **MIME & Text Parsing Success Rate**: 100.0% (30/30)
- **Email Scam Decision Accuracy**: 100.0% (30/30)
- **Quad-Channel Parity (Web = Telegram = WhatsApp = Email)**: 85.7% (24/28)
- **Benign False-Alarm Rate**: 0.0%
- **Prompt Injection Defense**: 100.0% PASS
- **PII Scrubbing Boundary**: 100.0% PASS

## Summary Metrics
- **RFC-822 MIME & HTML Parsing**: HTML text conversion with URL extraction and visible link destination mismatch detection.
- **Header Intelligence**: Factual detection of sender display-name spoofing and Reply-To domain mismatches.
- **Unified Canonical Analysis**: Email operates strictly as a channel input calling `analyzeScam()`. Zero duplicate classifiers.
