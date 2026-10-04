# CORE-04B Verified Knowledge Corpus & Provenance Report

## 1. Corpus Domain Expansion
The verified educational corpus (`src/lib/rag/corpus.ts` and `data/kb/sources.json`) was expanded across 10 financial domains:

1. **Fixed Income**: Bank FDs, Sovereign G-Secs, Treasury Bills, Corporate Bonds, Coupon, Yield, Maturity, Duration, Interest Rate Risk, Credit Risk, Market Price vs Face Value.
2. **Mutual Funds**: NAV, Annual Expense Ratio, Units, SIP (Rupee Cost Averaging) vs Lump Sum, Fund Redemption, Equity/Debt/Hybrid categories, Benchmark Index.
3. **Equities & Shares**: Share Ownership, Stock Price mechanics, Market Capitalization, Dividends vs Capital Gains, Equity Dilution, Stockbrokers, Stock Exchanges (NSE/BSE), Depositories (NSDL/CDSL), T+1 Settlement.
4. **IPO & Allotment**: Primary vs Secondary market, ASBA payment mechanism, Allotment process, Oversubscription, Listing Price Band.
5. **Futures & Options (F&O)**: Derivatives contracts, Futures, Call/Put Options, Premium, Expiry date, Strike price, Initial Margin, Leverage Risk (SEBI risk study: 9/10 retail loss rate).
6. **Commodities**: Commodity futures (MCX), Physical vs Financial settlement, Margin requirements, Price volatility.
7. **Crypto & Virtual Digital Assets (VDA)**: Blockchain ledgers, Wallet security (Hot vs Cold), Unregulated Staking/Mining risks, Volatility, Counterparty risks, Transaction Irreversibility.
8. **Copy Trading**: Leader/follower mirror trading, Unregistered advisory warnings, API key sharing risks, Slippage risk, SEBI advisory compliance.
9. **Financial Safety & Cybercrime**: 1930 Golden Hour SOP, Beneficiary bank freezing, AnyDesk/TeamViewer remote access risks, DoT Chakshu reporting, Phishing links, Mule accounts, TDS advance-fee traps.
10. **Regulatory Ecosystem**: SEBI, RBI, IRDAI, PFRDA, SCORES portal, RBI Sachet, 1930 Cyber Helpline, Sanchar Saathi.

---

## 2. Source Tiering Hierarchy
- **TIER 1 (Primary Official Regulators)**: SEBI, RBI, MHA / I4C, DoT, NSE, BSE, NSDL, CDSL.
- **TIER 2 (Official Institutional Education)**: AMFI, MCX Investor Education.
- **TIER 3 (Secondary Context)**: Labeled secondary context (0 ungrounded claims permitted).

---

## 3. Provenance Schema
Every document entry enforces:
- `id`, `sourceId`, `title`, `publisher`, `sourceUrl`
- `publishedAt`, `verifiedAt: "2026-10-01"`
- `trustTier`, `topic`, `language` ('en', 'hi', 'ta')
- `numericClaimPolicy: "STRICT_PROVENANCE"`

---

## 4. Numeric Claim Governance
- Financial statistics and figures require strict source provenance (`validateNumericClaimProvenance`).
- Historical returns are never formatted as future yield guarantees or investment advice.
