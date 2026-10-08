# Workstream C: Explainable Scam Detection Technical Report

## 1. Structured Explanation Schema

The scam decision engine delivers transparent, itemized scoring breakdowns (`src/lib/scam/explanation.ts`) ensuring users understand the specific threat vectors:

```typescript
export interface RiskAnalysisExplanation {
  score: number; // 0..100
  band: RiskBand; // 'HIGH' | 'MEDIUM' | 'LOW_SIGNALS' | 'CANNOT_VERIFY'
  summary: string;
  detectedSignals: DetectedSignalContribution[];
  calculation: {
    baseScore: number;
    contributions: number[];
    finalScore: number;
  };
  confidence: number;
  limitations: string[];
  actionSteps: string[];
}
```

---

## 2. Deterministic Signal Contribution Points

| Threat Signal | Point Contribution | Pattern / Evidence Sample |
|---|---|---|
| **Unrealistic Return Promise** | `+25` | "Guaranteed 20% daily return", "Double your money" |
| **OTP / Credential Solicitation** | `+25` | "Share OTP to unblock account", "Enter net banking password" |
| **Remote Access / APK Directive** | `+25` | "Install AnyDesk/TeamViewer", "Download update APK" |
| **Recovery Scam Trap** | `+25` | "Lost crypto? Pay fee to retrieve stolen funds" |
| **Unregulated Investment Solicitation** | `+20` | "Join VIP WhatsApp trading group", "Exclusive insider channel" |
| **Urgency & Coercive Pressure** | `+20` | "Power cut tonight at 9:30 PM", "Arrest warrant within 2 hours" |
| **Advance Fee / Processing Charge** | `+20` | "Pay ₹5,000 fee to release ₹25 Lakh lottery prize" |
| **Suspicious Unverified URL** | `+15` | Shortened link (bit.ly, .xyz, .top, unverified domain) |
| **Unverified Regulatory Claim** | `+15` | "SEBI approved 100% safe" without verifiable license |

---

## 3. Mandatory Safety Rules

1. **Deterministic Authority:** The risk band and score are derived from rule triggers and extracted claims. LLMs never invent or override scores.
2. **Safe Framing for Low Risk:** The engine never declares a message "SAFE". Low-risk outputs state: *"No strong scam signals detected based on checked indicators. (This is not a guarantee of safety)."*
3. **No Financial Advice:** The system strictly educates and warns about deceptive patterns, providing no investment recommendations.
