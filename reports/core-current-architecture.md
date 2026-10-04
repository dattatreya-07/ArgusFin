# CORE Current & Target Architecture Map

**Project**: SANGYAN / ArgusFin (Investor Resilience Infrastructure)  
**Task**: CORE-01A Architecture & Pipeline Audit  
**Date**: October 3, 2026  

---

## 1. Actual Current Architecture Diagram

The diagram below reflects **strictly implemented** components currently in `src/` and `data/`:

```mermaid
flowchart TD
    subgraph Clients ["User Interfaces & Input Channels"]
        WEB["Web App (/check, /ask, /calculator, /ladder)"]
        OCR_UI["OCR Image Upload"]
        VOICE_UI["Web Speech API (STT)"]
        SHARE["Android PWA Share Target"]
        TG_BOT["Telegram Bot Webhook (/api/channels/telegram)"]
        WA_BOT["WhatsApp Adapter (Sandbox / 503 Fallback)"]
    end

    subgraph Privacy ["Privacy & Security Boundary"]
        MASK["Client/Edge PII Masker (src/lib/privacy/mask.ts)\n- Phone, Email, UPI, Bank Acc, OTP"]
    end

    subgraph Detection ["Deterministic Detection Engine"]
        EXTRACT["Claim & Signal Extractor (src/lib/detector/extract.ts)"]
        RULES["Rule Evaluator & Archetype Mapper (src/lib/detector/rules.ts)"]
        FUSION["Decision Fusion Engine (src/lib/detector/decision/engine.ts)"]
    end

    subgraph Knowledge ["Grounded Knowledge & RAG"]
        RAG["Micro RAG Engine (src/lib/rag/index.ts)"]
        DATA_KB[("Local KB Corpus\ndata/kb/*.md")]
        DATA_AUTH[("Authority Registry\ndata/authorities.json")]
    end

    subgraph External ["External Services"]
        LLM["Google Gemini / OpenAI LLM Fallback (src/lib/ask/llm.ts)"]
        TESS["Tesseract.js OCR Engine"]
    end

    WEB --> MASK
    OCR_UI --> TESS --> MASK
    VOICE_UI --> MASK
    SHARE --> MASK
    TG_BOT --> MASK
    WA_BOT --> MASK

    MASK --> EXTRACT --> RULES --> FUSION
    FUSION --> RAG
    DATA_KB --> RAG
    RAG --> LLM
    FUSION --> DATA_AUTH
```

---

## 2. Planned Target Architecture Diagram (CORE-01 Engine)

The diagram below maps how the existing infrastructure will evolve into the unified **CORE-01 Scam Detection Engine**. All future/unbuilt modules are explicitly marked **`[PLANNED]`**.

```mermaid
flowchart TD
    subgraph Inputs ["Unified Multi-Modal Channel Receivers"]
        IN_TEXT["Text / Chat Pastes"]
        IN_OCR["OCR Image Upload"]
        IN_VOICE["STT Voice Audio"]
        IN_URL["URL / Domain Inspector"]
        IN_TG["Telegram Bot Endpoint"]
        IN_WA["WhatsApp Business API Endpoint"]
        IN_EM["[PLANNED] Email Ingest Adapter"]
    end

    subgraph Pipeline ["CORE-01 Unified Engine Pipeline"]
        STAGE1["Stage 1: Input Normalization & Sanitize"]
        STAGE2["Stage 2: PII Masking & Scrubbing"]
        STAGE3["Stage 3: Multi-Modal Claim Extraction"]
        STAGE4["Stage 4: Pattern & Lexicon Signal Extraction"]
        STAGE5["Stage 5: Grounded Rule & Domain Evaluator"]
        STAGE6["Stage 6: Multi-Signal Decision Fusion Matrix"]
    end

    subgraph TargetArchetypes ["Archetype Classification (Expanded)"]
        ARCH_RULES["Target Archetype Classifier\n(20+ Financial Scam Patterns)"]
    end

    subgraph Augmentation ["Grounded Knowledge & RAG"]
        RAG_CORE["Grounded RAG Engine (src/lib/rag)"]
        AUTH_ROUTER["Authority & Helpline Router (data/authorities.json)"]
    end

    subgraph Outputs ["Response & Channel Formatters"]
        OUT_WEB["Web Risk Breakdown & Report Card"]
        OUT_TG["Telegram Formatted Alert"]
        OUT_WA["WhatsApp Formatted Alert"]
        OUT_EM["[PLANNED] Email Summary Packet"]
    end

    IN_TEXT --> STAGE1
    IN_OCR --> STAGE1
    IN_VOICE --> STAGE1
    IN_URL --> STAGE1
    IN_TG --> STAGE1
    IN_WA --> STAGE1
    IN_EM --> STAGE1

    STAGE1 --> STAGE2 --> STAGE3 --> STAGE4 --> STAGE5 --> STAGE6
    STAGE6 --> ARCH_RULES
    ARCH_RULES --> RAG_CORE
    ARCH_RULES --> AUTH_ROUTER

    RAG_CORE --> OUT_WEB
    RAG_CORE --> OUT_TG
    RAG_CORE --> OUT_WA
    RAG_CORE --> OUT_EM
```

---

## 3. End-to-End Pipeline Stage Documentation

| Stage | Responsible Component / File | Input | Output | Safety & Privacy Enforcement |
|---|---|---|---|---|
| **1. Normalization** | `src/lib/detector/extract.ts` | Raw string / OCR text / Transcript | Unicode-normalized UTF-8 string | Strips control characters, normalizes confusable homoglyphs. |
| **2. PII Masking** | `src/lib/privacy/mask.ts` | Normalized string | Anonymized string with `[PHONE_MASKED]`, etc. | 100% client/edge executed. Zero raw PII leaves browser/channel receiver. |
| **3. Claim Extraction** | `src/lib/detector/extract.ts` | Anonymized string | Extracted claims (Return %, Timeframe, Guaranteed flags) | RegEx parsing with numerical extraction validation. |
| **4. Signal Extraction** | `src/lib/detector/rules.ts` | Extracted claims | Match signals & weights | Match against verified financial scam lexicons. |
| **5. Decision Fusion** | `src/lib/detector/decision/engine.ts` | Signals + Claims | Risk Band (`HIGH_RISK`, `MEDIUM_RISK`, `NO_RED_FLAGS`) | Mathematical score thresholding. Never returns "SAFE". |
| **6. LLM Explanation** | `src/lib/ask/llm.ts` | Risk Band + Masked Claims | Grounded concise explanation + citations | RAG context injection. Strict prompt ban on financial advice. |

---

## 4. LLM Usage & Prompt Inventory

| Location | Provider | Model | Purpose | Input Sent | Output Format | Grounding Constraint |
|---|---|---|---|---|---|---|
| `src/lib/ask/llm.ts` | Google Gemini / OpenAI | `gemini-1.5-flash` / `gpt-4o-mini` | Grounded explanation for scam checks & RAG QA | Masked text + RAG chunks | Structured JSON (`explanation`, `citations`, `band`) | Strictly grounded in `data/kb/` |
| `src/app/api/ask/route.ts` | Google Gemini / OpenAI | `gemini-1.5-flash` / `gpt-4o-mini` | Interactive Q&A conversational responses | Masked user prompt + context | Markdown stream / JSON | No investment advice, no stock tips |

---

## 5. Navigation & Deep-Link Audit Matrix

| Route Target | Purpose / Page | Semantic Target (`href` / Action) | Status |
|---|---|---|---|
| `/` | Homepage Hero & Features | Main Navigation / CTA links | **AVAILABLE** |
| `/check` | Multi-channel Scam Checker | Header, Footer, Hero CTA | **AVAILABLE** |
| `/ask` | Grounded RAG Assistant | Header & Quick Actions | **AVAILABLE** |
| `/calculator` | CAGR & Realistic Return Calculator | Navigation bar & Tools dropdown | **AVAILABLE** |
| `/ladder` | Risk Ladder & Archetypes | Tools & Educational Links | **AVAILABLE** |
| `/authorities` | Verified Helplines & Contacts | Emergency banner & Footer | **AVAILABLE** |
| `/report` | Evidence & Incident Reporting | Secondary navigation | **AVAILABLE** |
