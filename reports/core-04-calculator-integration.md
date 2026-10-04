# CORE-04 — Calculator Education Integration Report

## 1. Overview

The SANGYAN Calculator Engine provides 100% deterministic, client-side arithmetic evaluation across four distinct modes:

- **Mode D — Promise Reality Check**
- **Mode A — Lump Sum Compounding**
- **Mode B — Monthly Contribution / SIP**
- **Mode C — Research CAGR & Period Analysis**

Each mode integrates plain-language mathematical interpretations, explicit assumption disclosures, uncertainty wording, and deep links to relevant educational topics.

---

## 2. Mode Specifications & Integration

### Mode D — Promise Reality Check
- **Inputs**: Stated Principal ($\text{Invested}$), Promised Payout ($\text{Payout}$), Promised Duration ($\text{Days}$).
- **Formulas**:
  $$\text{Multiple} = \frac{\text{Payout}}{\text{Invested}}$$
  $$\text{Daily Rate} = \left(\text{Multiple}\right)^{\frac{1}{\text{Days}}} - 1$$
  $$\text{Annualised Return Pct} = \left( (1 + \text{Daily Rate})^{365} - 1 \right) \times 100$$
- **Interpretation**: Computes exact compound daily yield and annualized CAGR equivalent.
- **Educational Integration**: Links directly to `/learn/lessons/cagr` and `/learn/lessons/compounding`.

### Mode A — Lump Sum Compounding
- **Inputs**: Principal, Assumed Rate (% p.a.), Duration (Years), Compounding Frequency ($n$).
- **Formulas**:
  $$\text{Final Value} = P \times \left(1 + \frac{r}{n}\right)^{n \times t}$$
- **Interpretation**: Shows deterministic future value and total profit.
- **Educational Integration**: Links directly to `/learn/instruments/fixed-deposits` and `/learn/instruments/mutual-funds`.

### Mode B — Monthly Contribution / SIP
- **Inputs**: Monthly Contribution ($P$), Assumed Annual Rate ($r$), Duration (Years, $t$).
- **Formulas**:
  $$M = P \times \left[ \frac{(1 + i)^n - 1}{i} \right] \times (1 + i) \quad \text{where } i = \frac{r}{12}, n = 12 \times t$$
- **Interpretation**: Computes total invested vs total wealth growth.
- **Educational Integration**: Links directly to `/learn/lessons/compounding`.

### Mode C — CAGR & Period Analysis
- **Inputs**: Starting Value ($V_{\text{start}}$), Ending Value ($V_{\text{end}}$), Start Date, End Date.
- **Formulas**:
  $$\text{CAGR} = \left(\frac{V_{\text{end}}}{V_{\text{start}}}\right)^{\frac{365}{\text{Days}}} - 1$$
- **Interpretation**: Calculates exact annualized growth rate over historical periods.
- **Educational Integration**: Links directly to `/learn/lessons/cagr`.

---

## 3. Product Safety Boundaries

1. **Arithmetic vs Detection Separation**: The calculator evaluates pure mathematical implication. It does NOT label a claim as a scam by itself. The detector independently performs open-world behavioral risk analysis.
2. **Deterministic & Offline**: Computations are performed client-side without calling LLMs for arithmetic.
3. **56-Case Test Verification**: All 56 unit test cases pass with 100% precision.
