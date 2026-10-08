# Workstream A: Multilingual Voice Technical Report

## 1. Objectives & Solved Defects

1. **Defect — Speech Continued After Pressing Stop:**
   - *Root Cause:* Previous implementations set a boolean flag `isSpeaking = false` or invoked `window.speechSynthesis.cancel()`, but the browser's asynchronous utterance completion/error handlers immediately triggered the next paragraph chunk in the queue.
   - *Resolution:* Implemented an atomic `currentSessionId` counter in `SpeechService`. Calling `stop()` or switching utterances synchronously increments `currentSessionId`, immediately calls `speechSynthesis.cancel()`, and locks out all queued chunk callbacks.
2. **Defect — Unreliable Tamil Voice Selection:**
   - *Root Cause:* Browser SpeechSynthesis often defaults to English or poorly mapped generic voice names.
   - *Resolution:* Created `isTamilCompatible()` checking normalized language tags (`ta-in`, `ta-lk`, `ta-sg`, `ta`, `tam`) and Indic neural identifiers (`Google தமிழ்`, `Valluvar`, `Latha`, `Pallavi`).
3. **Requirement — Add Malayalam (`ml-IN`) Support:**
   - Implemented `isMalayalamCompatible()` and full locale mapping for `ml-IN` (`Google മലയാളം`, `Natural Malayalam`).
4. **Strict No-Fake Invariant:**
   - If no compatible voice is installed on the user's browser, `selectBestVoice()` returns `null`. The system never plays an English voice while claiming it is speaking Tamil or Malayalam.
5. **Indic Currency Articulation:**
   - Automatically expands currency strings into native phonetic tokens (`₹10,000` -> `10000 ரூபாய்` / `10000 रुपये` / `10000 രൂപ`).

---

## 2. Voice Support Matrix

| Language | Primary Target | Fallback Order | Currency Expansion |
|---|---|---|---|
| **English** | `en-IN` | `en-GB`, `en-US`, `en` | "Rupees" |
| **Hindi** | `hi-IN` | `hi`, `Google हिन्दी` | "रुपये" |
| **Tamil** | `ta-IN` | `ta-LK`, `ta-SG`, `ta`, `Google தமிழ்` | "ரூபாய்" |
| **Malayalam** | `ml-IN` | `ml`, `Google മലയാളം` | "രൂപ" |

---

## 3. UI Controls & React Safety

- Component: `src/components/SpeechControl.tsx`
- Controls: `[🔊 Listen]`, `[⏸ Pause]`, `[▶ Resume]`, `[⏹ Stop]`
- Lifecycle Safety: React `useEffect` unmount handler unconditionally calls `speechService.stop()`, preventing stale background audio playback across page navigations.
