import { VERIFIED_SOURCES, SourceRef } from './curriculum';

export type QuestionType = 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'TRUE_FALSE';

export interface QuizOption {
  id: string;
  label: string;
}

/** Client-safe Question model (no correct answer leaked) */
export interface PublicQuizQuestion {
  id: string;
  lessonId: string;
  type: QuestionType;
  prompt: string;
  options: QuizOption[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  sourceIds: string[];
}

/** Private internal question record with answer key and explanation */
export interface PrivateQuizQuestion extends PublicQuizQuestion {
  correctAnswer: string | string[]; // e.g. 'opt_b' or ['opt_a', 'opt_c']
  explanation: string;
}

export interface QuizAttemptResult {
  quizId: string;
  totalQuestions: number;
  correctCount: number;
  scorePct: number;
  passed: boolean;
  questionResults: Array<{
    questionId: string;
    prompt: string;
    userAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
    explanation: string;
  }>;
  weakAreas: string[];
}

/**
 * Server-side / Isolated Answer Store (never sent to client in public API)
 */
const PRIVATE_QUIZ_BANK: Record<string, PrivateQuizQuestion[]> = {
  quiz_money_income_expenses: [
    {
      id: 'q_mie_1',
      lessonId: 'les_money_income_expenses',
      type: 'SINGLE_CHOICE',
      prompt: 'According to the 50/30/20 budgeting rule, what percentage of income should ideally go to savings & debt repayment?',
      options: [
        { id: 'a', label: '10%' },
        { id: 'b', label: '20%' },
        { id: 'c', label: '50%' },
        { id: 'd', label: '70%' },
      ],
      correctAnswer: 'b',
      explanation: 'The 50/30/20 framework allocates 50% to Needs, 30% to Wants, and a minimum of 20% to Savings & Debt Repayment.',
      difficulty: 'EASY',
      sourceIds: ['rbi_financial_ed'],
    },
    {
      id: 'q_mie_2',
      lessonId: 'les_money_income_expenses',
      type: 'TRUE_FALSE',
      prompt: 'True or False: Earning a high income automatically guarantees wealth creation without budgeting.',
      options: [
        { id: 'a', label: 'True' },
        { id: 'b', label: 'False' },
      ],
      correctAnswer: 'b',
      explanation: 'Wealth is accumulated from what remains after controlling expenses, regardless of initial income scale.',
      difficulty: 'EASY',
      sourceIds: ['rbi_financial_ed'],
    },
  ],

  quiz_saving_vs_investing: [
    {
      id: 'q_svi_1',
      lessonId: 'les_saving_vs_investing',
      type: 'SINGLE_CHOICE',
      prompt: 'What is the primary objective of keeping cash in a savings account?',
      options: [
        { id: 'a', label: 'High compounding equity growth' },
        { id: 'b', label: 'Emergency liquidity and capital safety' },
        { id: 'c', label: 'Beating 10% market benchmarks' },
        { id: 'd', label: 'Guaranteed 20% returns' },
      ],
      correctAnswer: 'b',
      explanation: 'Savings accounts prioritize immediate access (liquidity) and capital safety rather than long-term asset growth.',
      difficulty: 'EASY',
      sourceIds: ['rbi_financial_ed'],
    },
  ],

  quiz_inflation: [
    {
      id: 'q_inf_1',
      lessonId: 'les_understanding_inflation',
      type: 'SINGLE_CHOICE',
      prompt: 'If an FD yields 5% annual interest while CPI inflation is 6%, what is your real rate of return?',
      options: [
        { id: 'a', label: '+1%' },
        { id: 'b', label: '-1%' },
        { id: 'c', label: '+11%' },
        { id: 'd', label: '0%' },
      ],
      correctAnswer: 'b',
      explanation: 'Real Rate of Return = Nominal Return (5%) - Inflation Rate (6%) = -1% (loss of real purchasing power).',
      difficulty: 'MEDIUM',
      sourceIds: ['rbi_financial_ed'],
    },
  ],

  quiz_compounding: [
    {
      id: 'q_cmp_1',
      lessonId: 'les_simple_compound_interest',
      type: 'SINGLE_CHOICE',
      prompt: 'What makes compound interest fundamentally more powerful than simple interest over long periods?',
      options: [
        { id: 'a', label: 'It charges extra maintenance fees' },
        { id: 'b', label: 'Earned interest is added back to principal to earn future interest' },
        { id: 'c', label: 'It guarantees zero risk in equities' },
        { id: 'd', label: 'It doubles money every 10 days' },
      ],
      correctAnswer: 'b',
      explanation: 'Compounding adds accumulated interest back to the principal balance for exponential multi-year growth.',
      difficulty: 'EASY',
      sourceIds: ['sebi_investor_ed'],
    },
  ],

  quiz_emergency_funds: [
    {
      id: 'q_ef_1',
      lessonId: 'les_emergency_funds',
      type: 'SINGLE_CHOICE',
      prompt: 'How many months of essential living expenses should ideally be maintained in an emergency fund?',
      options: [
        { id: 'a', label: '1 to 2 weeks' },
        { id: 'b', label: '3 to 6 months' },
        { id: 'c', label: '5 to 10 years' },
        { id: 'd', label: 'Zero months' },
      ],
      correctAnswer: 'b',
      explanation: 'Financial planners recommend maintaining 3 to 6 months of essential living expenses in liquid, safe reserves.',
      difficulty: 'EASY',
      sourceIds: ['rbi_financial_ed'],
    },
  ],

  quiz_risk_return: [
    {
      id: 'q_rr_1',
      lessonId: 'les_risk_and_return',
      type: 'SINGLE_CHOICE',
      prompt: 'Which claim violates the fundamental risk-and-return economic principle?',
      options: [
        { id: 'a', label: 'Equity investments carry price volatility' },
        { id: 'b', label: 'Government bonds offer lower yields than equities' },
        { id: 'c', label: 'An offer promising 2% daily return with zero risk' },
        { id: 'd', label: 'Fixed deposits carry early withdrawal penalties' },
      ],
      correctAnswer: 'c',
      explanation: 'No legal financial asset can offer extremely high returns without corresponding risk or volatility.',
      difficulty: 'EASY',
      sourceIds: ['sebi_investor_ed'],
    },
  ],

  quiz_fixed_deposits: [
    {
      id: 'q_fd_1',
      lessonId: 'les_fixed_deposits',
      type: 'SINGLE_CHOICE',
      prompt: 'What is the maximum deposit insurance coverage provided per depositor per bank by DICGC (RBI)?',
      options: [
        { id: 'a', label: '₹1 Lakh' },
        { id: 'b', label: '₹5 Lakhs' },
        { id: 'c', label: '₹50 Lakhs' },
        { id: 'd', label: 'Unlimited' },
      ],
      correctAnswer: 'b',
      explanation: 'DICGC (a wholly-owned subsidiary of RBI) insures bank deposits up to ₹5,00,000 per depositor per bank.',
      difficulty: 'EASY',
      sourceIds: ['rbi_financial_ed'],
    },
  ],

  quiz_bonds: [
    {
      id: 'q_bnd_1',
      lessonId: 'les_bonds',
      type: 'SINGLE_CHOICE',
      prompt: 'Why do Indian Government Securities (G-Secs) carry virtually zero credit default risk?',
      options: [
        { id: 'a', label: 'They are backed by private finfluencer groups' },
        { id: 'b', label: 'They carry sovereign backing from the Government of India' },
        { id: 'c', label: 'They double money in 30 days' },
        { id: 'd', label: 'They are unrated offshore tokens' },
      ],
      correctAnswer: 'b',
      explanation: 'Sovereign G-Secs are backed by the sovereign guarantee of the Government of India.',
      difficulty: 'EASY',
      sourceIds: ['rbi_financial_ed'],
    },
  ],

  quiz_mutual_funds: [
    {
      id: 'q_mf_1',
      lessonId: 'les_mutual_funds',
      type: 'SINGLE_CHOICE',
      prompt: 'Which statutory authority regulates all Mutual Funds and Asset Management Companies in India?',
      options: [
        { id: 'a', label: 'SEBI' },
        { id: 'b', label: 'TRAI' },
        { id: 'c', label: 'IRDAI' },
        { id: 'd', label: 'NITI Aayog' },
      ],
      correctAnswer: 'a',
      explanation: 'SEBI (Securities and Exchange Board of India) regulates mutual funds to protect investor interests.',
      difficulty: 'EASY',
      sourceIds: ['sebi_investor_ed'],
    },
  ],

  quiz_equity_shares: [
    {
      id: 'q_eq_1',
      lessonId: 'les_equity_shares',
      type: 'SINGLE_CHOICE',
      prompt: 'What does purchasing equity shares of a listed company represent?',
      options: [
        { id: 'a', label: 'A guaranteed loan to the government' },
        { id: 'b', label: 'Fractional ownership of the company' },
        { id: 'c', label: 'A pre-approved personal loan' },
        { id: 'd', label: 'A fixed 20% annual payout guarantee' },
      ],
      correctAnswer: 'b',
      explanation: 'Equity shares represent fractional ownership in a business and its future corporate cashflows.',
      difficulty: 'EASY',
      sourceIds: ['sebi_investor_ed'],
    },
  ],

  quiz_sips: [
    {
      id: 'q_sip_1',
      lessonId: 'les_sips',
      type: 'SINGLE_CHOICE',
      prompt: 'How does Rupee Cost Averaging benefit an investor during market downturns?',
      options: [
        { id: 'a', label: 'It stops all future investments' },
        { id: 'b', label: 'It automatically buys more fund units when prices are lower' },
        { id: 'c', label: 'It guarantees negative returns' },
        { id: 'd', label: 'It doubles money instantly' },
      ],
      correctAnswer: 'b',
      explanation: 'Fixed monthly SIP contributions buy more units when prices fall, lowering average cost per unit over time.',
      difficulty: 'EASY',
      sourceIds: ['sebi_investor_ed'],
    },
  ],

  quiz_ipos_allotment: [
    {
      id: 'q_ipo_1',
      lessonId: 'les_ipos_allotment',
      type: 'SINGLE_CHOICE',
      prompt: 'Where do funds remain during a safe official IPO application submitted via ASBA?',
      options: [
        { id: 'a', label: 'Transferred to a Telegram admin UPI' },
        { id: 'b', label: 'Blocked inside your own bank account until allotment' },
        { id: 'c', label: 'Mailed in physical cash' },
        { id: 'd', label: 'Deposited into an offshore wallet' },
      ],
      correctAnswer: 'b',
      explanation: 'Under ASBA (Application Supported by Blocked Amount), application funds remain inside your own bank account.',
      difficulty: 'EASY',
      sourceIds: ['sebi_investor_ed'],
    },
  ],

  quiz_guaranteed_returns: [
    {
      id: 'q_gr_1',
      lessonId: 'les_guaranteed_return_claims',
      type: 'SINGLE_CHOICE',
      prompt: 'What should an investor immediately suspect if a platform offers "Guaranteed 2% Daily Return"?',
      options: [
        { id: 'a', label: 'It is a legitimate SEBI-approved product' },
        { id: 'b', label: 'It is a Ponzi or doubling scam structure' },
        { id: 'c', label: 'It is a government savings scheme' },
        { id: 'd', label: 'It is an ordinary bank FD' },
      ],
      correctAnswer: 'b',
      explanation: 'Daily fixed returns compound to impossible mathematical numbers (over 137,000% annualised) and indicate a Ponzi fraud.',
      difficulty: 'EASY',
      sourceIds: ['sebi_investor_ed'],
    },
  ],

  quiz_advance_fees: [
    {
      id: 'q_af_1',
      lessonId: 'les_advance_fee_scams',
      type: 'SINGLE_CHOICE',
      prompt: 'A caller claims you won a ₹10 Lakh prize but demands ₹5,000 upfront as "GST tax via UPI". What should you do?',
      options: [
        { id: 'a', label: 'Pay ₹5,000 immediately to get the prize' },
        { id: 'b', label: 'Refuse payment and report to 1930 / cybercrime.gov.in' },
        { id: 'c', label: 'Send your debit card PIN' },
        { id: 'd', label: 'Ask for a 50% discount on the tax' },
      ],
      correctAnswer: 'b',
      explanation: 'Demanding upfront money to receive promised money is a classic advance-fee fraud.',
      difficulty: 'EASY',
      sourceIds: ['cyber_crime_portal'],
    },
  ],

  quiz_fake_apps: [
    {
      id: 'q_fa_1',
      lessonId: 'les_fake_investment_apps',
      type: 'SINGLE_CHOICE',
      prompt: 'What is the primary risk of installing trading APK files sent over WhatsApp or Telegram?',
      options: [
        { id: 'a', label: 'They increase battery life' },
        { id: 'b', label: 'They display fake manipulated profits and steal credentials' },
        { id: 'c', label: 'They are automatically SEBI approved' },
        { id: 'd', label: 'They reduce tax liability' },
      ],
      correctAnswer: 'b',
      explanation: 'Sideloaded APKs bypass official app store security reviews and can contain malware or fake trading dashboards.',
      difficulty: 'EASY',
      sourceIds: ['cyber_crime_portal'],
    },
  ],

  quiz_copy_trading: [
    {
      id: 'q_ct_1',
      lessonId: 'les_copy_trading',
      type: 'SINGLE_CHOICE',
      prompt: 'Whose financial guidance is legally authorized under SEBI regulations in India?',
      options: [
        { id: 'a', label: 'Anonymous admins in VIP Telegram channels' },
        { id: 'b', label: 'SEBI-Registered Investment Advisors (RIA) or Research Analysts (RA)' },
        { id: 'c', label: 'Unverified social media finfluencers promising 10x returns' },
        { id: 'd', label: 'Automated WhatsApp bots offering signal packs' },
      ],
      correctAnswer: 'b',
      explanation: 'Only SEBI-registered RIAs or RAs are authorized to provide investment advisory or research services.',
      difficulty: 'EASY',
      sourceIds: ['sebi_investor_ed'],
    },
  ],

  quiz_otp_safety: [
    {
      id: 'q_otp_1',
      lessonId: 'les_otp_credential_theft',
      type: 'SINGLE_CHOICE',
      prompt: 'When receiving money via UPI (GPay, PhonePe, Paytm), when do you enter your UPI PIN?',
      options: [
        { id: 'a', label: 'Always enter PIN to receive money' },
        { id: 'b', label: 'NEVER — UPI PIN is required ONLY to debit/send money' },
        { id: 'c', label: 'Enter PIN if the sender is a bank official' },
        { id: 'd', label: 'Enter PIN for amounts over ₹1,000' },
      ],
      correctAnswer: 'b',
      explanation: 'UPI PIN is strictly used to AUTHORIZE DEBITS from your account. Receiving funds NEVER requires entering a PIN.',
      difficulty: 'EASY',
      sourceIds: ['rbi_financial_ed'],
    },
  ],

  quiz_remote_access: [
    {
      id: 'q_ra_1',
      lessonId: 'les_remote_access_scams',
      type: 'SINGLE_CHOICE',
      prompt: 'An unknown caller asking you to install AnyDesk or TeamViewer to "fix a bank issue" intends to do what?',
      options: [
        { id: 'a', label: 'Upgrade your phone software' },
        { id: 'b', label: 'Remotely view your screen and steal banking passwords/OTPs' },
        { id: 'c', label: 'Increase your bank transfer limit safely' },
        { id: 'd', label: 'Provide free mobile recharge' },
      ],
      correctAnswer: 'b',
      explanation: 'Remote access tools allow fraudsters to mirror your screen and capture sensitive banking credentials in real time.',
      difficulty: 'EASY',
      sourceIds: ['rbi_financial_ed'],
    },
  ],

  quiz_withdrawal_fees: [
    {
      id: 'q_wf_1',
      lessonId: 'les_withdrawal_fee_scams',
      type: 'SINGLE_CHOICE',
      prompt: 'A trading portal demands a ₹20,000 "withdrawal clearance deposit" before releasing your funds. What should you do?',
      options: [
        { id: 'a', label: 'Pay the ₹20,000 fee quickly' },
        { id: 'b', label: 'Stop sending money and report to CyberCrime 1930 immediately' },
        { id: 'c', label: 'Send double the fee to speed up clearance' },
        { id: 'd', label: 'Share your net banking password' },
      ],
      correctAnswer: 'b',
      explanation: 'Demanding fresh deposits to release funds is a classic trap; legitimate platforms deduct tax at source (TDS).',
      difficulty: 'EASY',
      sourceIds: ['cyber_crime_portal'],
    },
  ],

  quiz_recovery_scams: [
    {
      id: 'q_rec_1',
      lessonId: 'les_recovery_scams',
      type: 'SINGLE_CHOICE',
      prompt: 'Who is authorized to investigate cyber fraud and attempt fund recovery in India?',
      options: [
        { id: 'a', label: 'Unverified "hacker" accounts on Instagram or Quora' },
        { id: 'b', label: 'Official law enforcement via National Cyber Crime Helpline (1930)' },
        { id: 'c', label: 'Private Telegram crypto recovery bots' },
        { id: 'd', label: 'Unregistered offshore agencies' },
      ],
      correctAnswer: 'b',
      explanation: 'Only official law enforcement agencies operating through cybercrime.gov.in (1930) can freeze stolen funds.',
      difficulty: 'EASY',
      sourceIds: ['cyber_crime_portal'],
    },
  ],

  quiz_wallet_basics: [
    {
      id: 'q_wb_1',
      lessonId: 'les_wallet_basics',
      type: 'SINGLE_CHOICE',
      prompt: 'Which information is safe to share with others to receive cryptocurrency transfers?',
      options: [
        { id: 'a', label: 'Your 12-word seed phrase' },
        { id: 'b', label: 'Your Public Wallet Address' },
        { id: 'c', label: 'Your Private Key' },
        { id: 'd', label: 'Your net banking password' },
      ],
      correctAnswer: 'b',
      explanation: 'Public Wallet Addresses function like bank account numbers and are safe to share for receiving transfers.',
      difficulty: 'EASY',
      sourceIds: ['rbi_financial_ed'],
    },
  ],

  quiz_seed_phrases: [
    {
      id: 'q_sp_1',
      lessonId: 'les_private_keys_seed_phrases',
      type: 'SINGLE_CHOICE',
      prompt: 'What happens if you enter your 12-word seed phrase into a website form?',
      options: [
        { id: 'a', label: 'It increases wallet transaction speed' },
        { id: 'b', label: 'Anyone obtaining the seed phrase gets full control to steal all wallet funds' },
        { id: 'c', label: 'It generates free airdrop coins safely' },
        { id: 'd', label: 'It backs up your phone contacts' },
      ],
      correctAnswer: 'b',
      explanation: 'Seed phrases are master keys; entering them online gives scammers full access to drain your wallet.',
      difficulty: 'EASY',
      sourceIds: ['cyber_crime_portal'],
    },
  ],

  quiz_contract_risk: [
    {
      id: 'q_cr_1',
      lessonId: 'les_token_contract_risk',
      type: 'SINGLE_CHOICE',
      prompt: 'What risk is associated with signing an "Unlimited Token Allowance" on an unverified Web3 dApp?',
      options: [
        { id: 'a', label: 'The contract can drain specified tokens from your wallet without secondary prompt' },
        { id: 'b', label: 'Your internet speed decreases' },
        { id: 'c', label: 'It pays your electricity bill' },
        { id: 'd', label: 'Zero risk' },
      ],
      correctAnswer: 'a',
      explanation: 'Unlimited allowances authorize smart contracts to transfer all approved tokens directly out of your wallet.',
      difficulty: 'MEDIUM',
      sourceIds: ['cyber_crime_portal'],
    },
  ],

  quiz_crypto_scams: [
    {
      id: 'q_cs_1',
      lessonId: 'les_crypto_investment_scams',
      type: 'SINGLE_CHOICE',
      prompt: 'What compliance standard should Indian crypto / Virtual Digital Asset (VDA) platforms meet?',
      options: [
        { id: 'a', label: 'Registration with FIU-IND (Financial Intelligence Unit - India)' },
        { id: 'b', label: 'No registration needed if based overseas' },
        { id: 'c', label: 'Telegram group admin approval' },
        { id: 'd', label: 'Zero regulatory oversight' },
      ],
      correctAnswer: 'a',
      explanation: 'VDA service providers operating in India must be registered with FIU-IND to comply with AML laws.',
      difficulty: 'EASY',
      sourceIds: ['rbi_financial_ed'],
    },
  ],

  quiz_fake_airdrops: [
    {
      id: 'q_fa_2',
      lessonId: 'les_fake_airdrops',
      type: 'SINGLE_CHOICE',
      prompt: 'A message claims you won "$5,000 Free Airdrop Tokens" if you connect your wallet to a link. What is this usually?',
      options: [
        { id: 'a', label: 'A legitimate bank reward' },
        { id: 'b', label: 'A wallet drainer phishing trap' },
        { id: 'c', label: 'An official government subsidy' },
        { id: 'd', label: 'A fixed deposit interest payment' },
      ],
      correctAnswer: 'b',
      explanation: 'Unsolicited free token claims requiring wallet connection are overwhelmingly wallet-draining phishing attempts.',
      difficulty: 'EASY',
      sourceIds: ['cyber_crime_portal'],
    },
  ],

  quiz_phishing_drainers: [
    {
      id: 'q_pd_1',
      lessonId: 'les_phishing_and_wallet_drainers',
      type: 'SINGLE_CHOICE',
      prompt: 'How can you protect yourself against typosquatting phishing links (e.g., lookalike website names)?',
      options: [
        { id: 'a', label: 'Click sponsored Google Search ads' },
        { id: 'b', label: 'Bookmark verified official websites and check domain spelling carefully' },
        { id: 'c', label: 'Use random links sent on Telegram' },
        { id: 'd', label: 'Disable browser security settings' },
      ],
      correctAnswer: 'b',
      explanation: 'Bookmarking official sites and inspecting domain URLs protects against lookalike phishing domains.',
      difficulty: 'EASY',
      sourceIds: ['cyber_crime_portal'],
    },
  ],
};

export class QuizService {
  /**
   * Returns client-safe public quiz questions without revealing correct answer keys.
   */
  public getPublicQuiz(quizId: string): PublicQuizQuestion[] {
    const questions = PRIVATE_QUIZ_BANK[quizId] || [];
    return questions.map(({ correctAnswer, ...publicQ }) => publicQ);
  }

  /**
   * Evaluates user quiz submissions server-side.
   */
  public evaluateQuiz(quizId: string, userAnswers: Record<string, string | string[]>): QuizAttemptResult {
    const questions = PRIVATE_QUIZ_BANK[quizId] || [];
    if (questions.length === 0) {
      return {
        quizId,
        totalQuestions: 0,
        correctCount: 0,
        scorePct: 0,
        passed: false,
        questionResults: [],
        weakAreas: ['No questions found for this quiz.'],
      };
    }

    let correctCount = 0;
    const weakAreas: string[] = [];
    const questionResults = questions.map((q) => {
      const userAns = userAnswers[q.id];
      let isCorrect = false;

      if (Array.isArray(q.correctAnswer)) {
        const userArr = Array.isArray(userAns) ? userAns.sort() : [userAns].filter(Boolean).sort();
        const correctArr = [...q.correctAnswer].sort();
        isCorrect = JSON.stringify(userArr) === JSON.stringify(correctArr);
      } else {
        isCorrect = String(userAns || '').trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
      }

      if (isCorrect) {
        correctCount += 1;
      } else {
        weakAreas.push(q.prompt);
      }

      return {
        questionId: q.id,
        prompt: q.prompt,
        userAnswer: userAns || 'Not Answered',
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    const passed = scorePct >= 70;

    return {
      quizId,
      totalQuestions: questions.length,
      correctCount,
      scorePct,
      passed,
      questionResults,
      weakAreas,
    };
  }
}

export const quizService = new QuizService();
