import { PaymentScenario } from './types';

export const EDUCATIONAL_PAYMENT_SCENARIOS: PaymentScenario[] = [
  {
    id: 'task_scam_escalation',
    title: 'Prepaid Task & Rating Escalation Scheme',
    category: 'TASK_SCAM',
    description:
      'Simulates how small initial payouts (e.g. ₹200 for liking videos) escalate into demands for thousands in prepaid merchant tasks.',
    initialPromisedReturn: '₹500 deposit promised to yield ₹1,500 within 2 hours',
    educationalTakeaway:
      'Legitimate employers never require workers to pay money upfront to complete tasks or withdraw earned wages. Demands for "recharge tasks" or "credit repair fees" are hallmark advance-fee traps.',
    steps: [
      {
        id: 'task_step_1',
        stepNumber: 1,
        title: 'Initial "Trial VIP Merchant Task"',
        demandAmount: 1000,
        pretext:
          'You are asked to deposit ₹1,000 into a personal UPI handle to unlock a "Level 1 Merchant Rating" with an instant promised credit of ₹1,800 on the dashboard.',
        pretextType: 'INITIAL_DEPOSIT',
        psychologicalTrigger: 'Low initial hurdle with instant artificial dashboard profit.',
        whatToCheck: 'Check if the beneficiary is a registered corporate merchant or an individual personal UPI VPA.',
        stopRecommendation:
          'Stop here. Genuine work never requires paying deposits to receive salaries.',
      },
      {
        id: 'task_step_2',
        stepNumber: 2,
        title: 'Consecutive "Multi-Order Task Unlock"',
        demandAmount: 5000,
        pretext:
          'The system informs you that you hit a "Lucky Combo Task" and must deposit ₹5,000 to complete the batch before any prior funds can be withdrawn.',
        pretextType: 'VIP_UPGRADE',
        psychologicalTrigger: 'Sunk Cost Fallacy: Victim pays more to recover the initial ₹1,000.',
        whatToCheck: 'Observe how withdrawal rules change dynamically after you have sent money.',
        stopRecommendation:
          'Stop immediately. No withdrawal will be allowed; every step will invent a new requirement.',
      },
      {
        id: 'task_step_3',
        stepNumber: 3,
        title: 'Fake 30% "Income Tax & Withdrawal Clearance"',
        demandAmount: 15000,
        pretext:
          'Your dashboard shows ₹32,000, but customer support states your account is frozen until you pay a 30% "Direct Tax Clearance Fee" of ₹15,000.',
        pretextType: 'WITHDRAWAL_TAX',
        psychologicalTrigger: 'Artificial Bureaucracy & Urgency: Using official tax terms to justify fees.',
        whatToCheck: 'Income Tax in India is deducted at source (TDS) or paid to official IT department portals, never via UPI transfers to third parties.',
        stopRecommendation:
          'Stop. Paying "withdrawal taxes" to release dashboard balances never results in payouts.',
      },
      {
        id: 'task_step_4',
        stepNumber: 4,
        title: '"Credit Score Repair" Final Demands',
        demandAmount: 30000,
        pretext:
          'Support claims your "Credit Index" dropped to 80% due to delayed task completion and demands ₹30,000 to restore it to 100% for an instant payout.',
        pretextType: 'FROZEN_ACCOUNT_UNLOCK',
        psychologicalTrigger: 'Fear of total loss and shifting blame onto the victim.',
        whatToCheck: 'Notice that the goalposts continuously shift regardless of how much money is sent.',
        stopRecommendation:
          'Stop all communication. File a formal cybercrime complaint on 1930 / cybercrime.gov.in.',
      },
    ],
  },
  {
    id: 'fii_ipo_escalation',
    title: 'FII Institutional IPO Quota Escalation',
    category: 'FAKE_IPO',
    description:
      'Simulates how scammers impersonating institutional wealth managers demand repeated deposits for fictitious high-allotment IPO shares.',
    initialPromisedReturn: 'Guaranteed 100% allotment of multi-bagger IPO at 50% discount',
    educationalTakeaway:
      'Retail investors can only apply for IPOs via ASBA through SEBI-registered brokers with money blocked in their own bank accounts. Nobody can guarantee institutional quota allocations outside the exchange.',
    steps: [
      {
        id: 'ipo_step_1',
        stepNumber: 1,
        title: 'Initial "Institutional Seat Application"',
        demandAmount: 25000,
        pretext:
          'The group admin claims to have private institutional allocation for an upcoming hot IPO and asks you to transfer ₹25,000 to secure 500 shares.',
        pretextType: 'INITIAL_DEPOSIT',
        psychologicalTrigger: 'Fear of Missing Out (FOMO) and exclusivity illusion.',
        whatToCheck: 'Check if the broker is listed on SEBI Recognized Stock Brokers register (sebi.gov.in).',
        stopRecommendation:
          'Stop. Legitimate IPO applications are processed via ASBA in your own bank account.',
      },
      {
        id: 'ipo_step_2',
        stepNumber: 2,
        title: '"Super-Allotment Margin Shortfall"',
        demandAmount: 75000,
        pretext:
          'The admin announces you were "allotted" 2,000 shares (4x your application) worth ₹2,00,000 and demands an additional ₹75,000 margin payment within 24 hours or legal penalties will apply.',
        pretextType: 'SECURITY_MARGIN',
        psychologicalTrigger: 'Intimidation and artificial legal pressure.',
        whatToCheck: 'Allotment in genuine IPOs never exceeds the quantity applied for.',
        stopRecommendation:
          'Stop. Intimidation with fake legal notices is a standard extortion tactic.',
      },
      {
        id: 'ipo_step_3',
        stepNumber: 3,
        title: 'Fake "SEBI Anti-Laundering Audit Fee"',
        demandAmount: 100000,
        pretext:
          'The app dashboard shows ₹6,50,000 in listing gains, but customer service insists you must transfer ₹1,00,000 for a "SEBI Compliance Certificate" before shares can be sold.',
        pretextType: 'TDS_DEPOSIT',
        psychologicalTrigger: 'Greed vs Sunk Cost: Showing huge fake profits to justify large real deposits.',
        whatToCheck: 'SEBI never charges audit fees to retail investors to release stock sales.',
        stopRecommendation:
          'Stop. Do not pay. Report the fake app and banking details to 1930 and SEBI SCORES.',
      },
    ],
  },
];
