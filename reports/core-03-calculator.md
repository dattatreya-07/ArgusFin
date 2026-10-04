# CORE-03 — Investor Calculator Expansion Report

## Executive Summary

This report documents the expanded deterministic calculator architecture implemented in `src/lib/calc.ts` and `src/app/[locale]/calculator/page.tsx`.

---

## 1. Supported Calculator Modes

### Mode A: Lump Sum Compounding
- **Formula**: $A = P \times (1 + r/n)^{n \cdot t}$
- **Inputs**: Principal $P$, Annual Rate $r\%$, Duration $t$ years, Compounding Frequency $n$.
- **Outputs**: Final maturity value, total profit, effective annual yield.

### Mode B: Monthly Contribution (SIP)
- **Formula**: $A = M \times \frac{(1 + i)^n - 1}{i} \times (1 + i)$ where $i = r / 12 / 100$ and $n = t \times 12$.
- **Inputs**: Monthly contribution $M$, Assumed annual rate $r\%$, Duration $t$ years.
- **Outputs**: Total invested, total growth, final corpus value.

### Mode C: Compound Annual Growth Rate (CAGR)
- **Formula**: $\text{CAGR} = \left(\frac{V_{\text{end}}}{V_{\text{start}}}\right)^{\frac{1}{t}} - 1$.
- **Inputs**: Initial amount, ending value, exact start & end dates.
- **Outputs**: CAGR %, total return %, days duration.

### Mode D: Promise Reality Check
- **Formula**: Implied annualised return $\text{AER} = (A/P)^{365/d} - 1$.
- **Inputs**: Requested principal $P$, promised payout $A$, duration $d$ days.
- **Outputs**: Implied return %, market tier classification (Tier 1-4), research analyst verdict.

---

## 2. Test Suite & Correctness

- Verified across 30 deterministic unit test cases in [`tests/calculator/calc.test.ts`](file:///d:/SANGYAN/tests/calculator/calc.test.ts).
- Pass rate: **100.0%**.
