# CORE-04 — Multilingual Content Hardening Report

## 1. Overview & Supported Languages

SANGYAN supports three primary locales and code-switched variants:

- **English (EN)**
- **Hindi (HI)**
- **Tamil (TA)**
- **Hinglish** (Hindi-English code-switched text)
- **Tanglish** (Tamil-English code-switched text)

---

## 2. Semantic Alignment & Safety Boundaries

- **Preservation of Uncertainty**: Localized risk explanations maintain safety wording:
  - English: *"This message shows several suspicious behavioral indicators."*
  - Hindi: *"यह संदेश कई संदिग्ध व्यावहारिक संकेत दिखाता है।"*
  - Tamil: *"இந்த செய்தி பல சந்தேகத்திற்கிடமான நடத்தைக் குறிகாட்டிகளைக் காட்டுகிறது."*
- **No Definitive Accusations**: Translation drift is strictly prevented; localized text never labels a specific person or company as a scam.
- **Preserved Statutory Terms**: Regulatory names (SEBI, RBI, NSE, BSE, NSDL, DICGC, ASBA, SCORES) are preserved across all languages.

---

## 3. Evaluation Results

The multilingual evaluation dataset (40 code-switched cases across EN, HI, TA, Hinglish, Tanglish) achieved **100% decision accuracy** without language-skewed false positives.
