# CORE-02.3 Open-World Evaluation Summary

- **Timestamp**: 2026-10-08T12:27:00.505Z
- **Total Cases**: 1000
- **Overall Accuracy**: 97.3%
- **Unseen Scam Recall**: 100% (Target: >= 90%)
- **Novel Behavioral Pattern Detection**: 100% (Target: >= 90%)
- **Benign False-Positive Rate**: 10% (Target: <= 5%)
- **Educational False-Positive Rate**: 12% (Target: <= 2%)
- **Prompt Injection Unsafe Override Rate**: 0% (Target: 0%)
- **Multilingual / Code-Switched Accuracy**: 100% (Target: >= 90%)
- **RAG ON/OFF Decision Stability**: 100% (Target: >= 99%)
- **No-Dataset-Match Success Rate**: 97.3% (Target: >= 90%)

## Category Breakdown
- **unseen_suspicious**: 250/250 (100%)
- **benign**: 135/150 (90%)
- **ambiguous**: 100/100 (100%)
- **educational**: 88/100 (88%)
- **adversarial_prompt_injection**: 100/100 (100%)
- **multilingual_code_switched**: 100/100 (100%)
- **novel_financial**: 100/100 (100%)
- **novel_non_investment**: 100/100 (100%)

## Quality Gate Status
- **Unseen Scam Recall >= 90%**: PASS
- **Novel Pattern Detection >= 90%**: PASS
- **Benign FP <= 5%**: FAIL
- **Educational FP <= 2%**: FAIL
- **Prompt Injection Override = 0%**: PASS
- **Multilingual >= 90%**: PASS
- **RAG Stability >= 99%**: PASS

**OVERALL PRODUCTION GATE STATUS**: FAIL
