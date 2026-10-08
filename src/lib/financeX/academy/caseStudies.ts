export interface CaseStudy {
  slug: string;
  title: string;
  category: string;
  badge: string;
  summary: string;
  whatHappened: string;
  howVictimsApproached: string;
  warningSigns: string[];
  psychologicalManipulation: string;
  howMoneyLost: string;
  whatUsersShouldHaveChecked: string[];
  howToReport: string[];
  lessonsLearned: string[];
  officialSources: Array<{
    authority: string;
    advisoryTitle: string;
    url: string;
    verifiedAt: string;
  }>;
  shieldExamplePayload: string;
  relatedLessonSlug: string;
  relatedTrackId: string;
}

export const INDIA_SCAM_CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'digital-arrest-customs-parcel',
    title: 'The "Digital Arrest" & Fake Law Enforcement Video Call Trap',
    category: 'Impersonation & Coercion',
    badge: 'I4C High-Priority Alert',
    summary:
      'Scammers impersonate police, CBI, or customs officials on Skype/WhatsApp video calls with fake uniform backdrops, alleging illegal drugs were intercepted in a package sent under the victim\'s Aadhaar, coercing continuous video isolation ("digital arrest") and fund transfers to "verification escrow accounts".',
    whatHappened:
      'According to advisories from the Indian Cyber Crime Coordination Centre (I4C) and Ministry of Home Affairs (MHA), fraudsters contact victims claiming an international courier containing contraband was seized. Victims are intimidated into staying on uninterrupted video calls with fake digital court/police backdrops until life savings are transferred to designated bank accounts for "financial clearance".',
    howVictimsApproached:
      'Automated IVR call or WhatsApp audio claiming to be courier support (e.g. FedEx / DHL / India Post), immediately escalating to a "police investigation officer" transfer via video call.',
    warningSigns: [
      'Demand for continuous video call connection termed as "Digital Arrest".',
      'Display of forged identity cards, official-looking badges, or staged police station sets on camera.',
      'Urgent threats of immediate physical arrest if the call is disconnected.',
      'Demand to transfer money to a "RBI verification" or "police secret clearance" bank account.',
    ],
    psychologicalManipulation:
      'Weaponizes intense fear of legal prosecution, social stigma, and authority coercion. Isolates the victim from family and legal counsel through non-stop surveillance on video.',
    howMoneyLost:
      'Victims liquidate fixed deposits, mutual funds, or take instant personal loans, transferring funds via RTGS/IMPS to fraud mule accounts provided by the callers under the guise of temporary asset verification.',
    whatUsersShouldHaveChecked: [
      'Indian law and law enforcement agencies have NO provision for "Digital Arrest" or video call interrogations.',
      'Police and courts never demand money transfers to verify financial innocence.',
      'Check tracking numbers directly on official courier portals, not links provided by callers.',
    ],
    howToReport: [
      'Dial National Cyber Crime Helpline 1930 immediately to freeze transferred funds in the banking system.',
      'Register a formal complaint at https://cybercrime.gov.in under Financial Fraud.',
      'Report and block the sender phone numbers and Skype IDs on WhatsApp/Telecom portals (Chakshu / Sanchar Saathi).',
    ],
    lessonsLearned: [
      'No genuine law enforcement officer will ever detain you via video call or demand money transfers.',
      'Disconnect suspicious calls immediately and independently consult local police or 1930.',
    ],
    officialSources: [
      {
        authority: 'Ministry of Home Affairs / I4C',
        advisoryTitle: 'Advisory on Digital Arrest Cyber Scams',
        url: 'https://cybercrime.gov.in',
        verifiedAt: '2025-01-15',
      },
      {
        authority: 'Press Information Bureau (PIB)',
        advisoryTitle: 'Fact Check: Law Enforcement Agencies Do Not Make Video Calls for Arrests',
        url: 'https://pib.gov.in',
        verifiedAt: '2024-11-20',
      },
    ],
    shieldExamplePayload:
      'Customs department alert: A parcel containing narcotics was seized at Mumbai airport under your Aadhaar. Connect immediately on Skype video ID cbi-investigation-desk for verification bail or face immediate non-bailable arrest warrant.',
    relatedLessonSlug: 'impersonation-and-authority-traps',
    relatedTrackId: 'track_resilience',
  },
  {
    slug: 'institutional-fake-ipo-allotment',
    title: 'The Fake Institutional VIP IPO Allocation Scam',
    category: 'Investment Fraud',
    badge: 'SEBI Investor Alert',
    summary:
      'Fraudsters create fake institutional trading applications claiming exclusive Foreign Portfolio Investor (FPI) or Institutional quota access to guarantee 100% allotment in oversubscribed mainline IPOs.',
    whatHappened:
      'SEBI issued public warnings regarding unauthorized entities masquerading as SEBI-registered FPIs or investment advisers. Fraudsters lure retail investors into WhatsApp/Telegram groups, offering exclusive access to oversubscribed IPO allotments through proprietary APK trading apps. Initial simulated profits are displayed on fake dashboards, but withdrawals are blocked demanding exorbitant "taxes" or "security deposits".',
    howVictimsApproached:
      'Social media ads on Instagram, Facebook, and YouTube advertising "Exclusive Institutional IPO Allotments" and "VIP Stock Recommendations", directing users to private WhatsApp groups.',
    warningSigns: [
      'Guarantee of 100% allotment in heavily oversubscribed IPOs.',
      'Instruction to download custom Android APKs outside Google Play Store or Apple App Store.',
      'Payment requests directed to individual savings accounts or current accounts under unrelated business names rather than through ASBA (Application Supported by Blocked Amount).',
      'Demands for "tax clearance fee" or "payout margin" when attempting to withdraw profits.',
    ],
    psychologicalManipulation:
      'Exploits FOMO (Fear Of Missing Out) on hot IPO listing gains, coupled with false exclusivity ("Institutional VIP Quota") and counterfeit regulatory certificates.',
    howMoneyLost:
      'Investors transfer capital directly to scam mule accounts instead of utilizing the standard ASBA banking mechanism. The balance shown in the app is completely fabricated.',
    whatUsersShouldHaveChecked: [
      'Genuine IPO applications in India can ONLY be made via ASBA through your bank account or registered stockbroker with UPI mandate.',
      'Verify entity registration on the official SEBI Intermediaries portal (https://www.sebi.gov.in).',
      'No broker or FPI has a legal mechanism to guarantee 100% allotment in oversubscribed retail tranches.',
    ],
    howToReport: [
      'Lodge a complaint on SEBI SCORES portal (https://scores.sebi.gov.in).',
      'Report cyber financial fraud to 1930 and https://cybercrime.gov.in.',
      'Notify your primary bank immediately to request beneficiary account freeze.',
    ],
    lessonsLearned: [
      'Never apply for IPOs by transferring money directly to third-party bank accounts. Always use ASBA.',
      'Never install unverified trading APKs distributed over WhatsApp or Telegram.',
    ],
    officialSources: [
      {
        authority: 'Securities and Exchange Board of India (SEBI)',
        advisoryTitle: 'SEBI Advisory on Fraudulent Trading Platforms claiming FPI/Institutional Access',
        url: 'https://www.sebi.gov.in',
        verifiedAt: '2024-12-10',
      },
    ],
    shieldExamplePayload:
      'Exclusive FPI VIP Institutional Allotment: Guaranteed 100% allotment in high-demand IPO. Transfer subscription funds to institutional escrow account and download the VIP Institutional Trading APK.',
    relatedLessonSlug: 'guaranteed-return-claims',
    relatedTrackId: 'track_resilience',
  },
  {
    slug: 'part-time-prepaid-task-fraud',
    title: 'The Part-Time Work / YouTube Like & Review Trap',
    category: 'Task-Based Advance Fee',
    badge: 'I4C / CyberDost Advisory',
    summary:
      'Victims are hired for trivial tasks like liking YouTube videos or writing hotel reviews, paid small rewards initially (₹150-₹500), then lured into "prepaid crypto/merchant tasks" requiring escalating deposits to unlock locked balances.',
    whatHappened:
      'Fraud syndicates send unsolicited messages offering flexible work-from-home jobs paying ₹3,000–₹8,000 daily. After completing 2-3 introductory tasks and receiving real UPI payments to build trust, victims are added to Telegram groups and instructed to perform "crypto prepaid merchant tasks" where large sums are deposited with promises of 30%-50% commissions.',
    howVictimsApproached:
      'WhatsApp or SMS messages from unknown international (+84, +62, +254) or spoofed numbers offering part-time review/rating tasks for international marketing firms.',
    warningSigns: [
      'Unsolicited job offer offering high pay for trivial tasks (liking videos, reviewing products).',
      'Small initial payouts sent via UPI to establish psychological credibility.',
      'Requirement to deposit your own money ("prepaid recharge") to upgrade VIP task level.',
      'Frozen funds with excuses like "system error" or "combo task bonus" requiring higher recharges.',
    ],
    psychologicalManipulation:
      'Sunk cost fallacy combined with initial reciprocity. Because the victim already received ₹500, they trust the operator and progressively deposit larger amounts to recover trapped funds.',
    howMoneyLost:
      'Victims execute multiple UPI / IMPS transfers across escalating task tiers (₹5,000 -> ₹25,000 -> ₹1,00,000) before realizing the platform balance cannot be withdrawn.',
    whatUsersShouldHaveChecked: [
      'Legitimate employers NEVER ask employees to pay money or recharge crypto balances to perform tasks.',
      'Check company domain and contact details through official recruitment channels.',
    ],
    howToReport: [
      'Call 1930 immediately to report the transaction UPI IDs and bank account details.',
      'File an incident on https://cybercrime.gov.in with screenshots of chat logs and payment receipts.',
    ],
    lessonsLearned: [
      'If you have to pay money to earn money from a job, it is an advance fee scam.',
      'Disconnect immediately at the first request for a deposit, regardless of prior small payouts.',
    ],
    officialSources: [
      {
        authority: 'I4C CyberDost',
        advisoryTitle: 'Public Warning on Work From Home and Part-Time Task Scams',
        url: 'https://cybercrime.gov.in',
        verifiedAt: '2024-10-05',
      },
    ],
    shieldExamplePayload:
      'Part-time remote work: Earn ₹3,000 daily just by rating hotels and liking videos. Completed 3 tasks? Now recharge ₹5,000 for VIP merchant task to withdraw ₹8,500 total bonus.',
    relatedLessonSlug: 'advance-fee-and-processing-charges',
    relatedTrackId: 'track_resilience',
  },
  {
    slug: 'electricity-bill-disconnection-panic',
    title: 'The Urgent Electricity Bill Disconnection Phishing Scam',
    category: 'Urgency & Remote Access',
    badge: 'Discom & State Police Warning',
    summary:
      'SMS alerts sent late afternoon warning that power supply will be disconnected at 9:30 PM due to unpaid bills, prompting the victim to call an unauthorized mobile number and install screen-sharing software.',
    whatHappened:
      'Power distribution companies (DISCOMs) across India reported mass SMS phishing campaigns where consumers receive urgent disconnect notices. When anxious consumers call the helpline number provided in the SMS, fraudsters pose as electricity officers and instruct them to make a ₹10 test payment via an APK or screen-sharing application (AnyDesk / TeamViewer), stealing net banking credentials.',
    howVictimsApproached:
      'SMS sent from standard 10-digit mobile numbers or unverified sender headers (e.g., VM-POWRBK) creating immediate panic.',
    warningSigns: [
      'SMS specifies a strict same-day deadline (e.g., "power cut tonight at 9:30 PM").',
      'Helpline number in SMS is a personal 10-digit mobile number, not official DISCOM customer care.',
      'Officer demands installation of remote management apps (QuickSupport, AnyDesk) to "update bill".',
      'Request to share screen or enter banking PIN during test verification payment.',
    ],
    psychologicalManipulation:
      'Manufactures immediate panic of darkness and disruption, disabling critical thinking and pushing the victim to act before family members can intervene.',
    howMoneyLost:
      'Once screen-sharing software is installed, fraudsters view user passwords, OTPs, and debit card PINs in real time, siphoning account balances via unauthorized fund transfers.',
    whatUsersShouldHaveChecked: [
      'Official DISCOMs send bills with Consumer Number (CA/Consumer ID) from registered shortcodes, never personal mobile numbers.',
      'DISCOMs never disconnect power at night without statutory prior physical notice.',
      'Check bill payment status directly on the official electricity board website or trusted bill-pay app.',
    ],
    howToReport: [
      'Report the phishing number to DISCOM customer support and national portal (1930 / cybercrime.gov.in).',
      'Block the number on Chakshu facility on Sanchar Saathi (https://sancharsaathi.gov.in).',
    ],
    lessonsLearned: [
      'Never call telephone numbers sent in unsolicited warning SMS messages.',
      'Never install screen-sharing apps on the instruction of anyone claiming to be a customer care representative.',
    ],
    officialSources: [
      {
        authority: 'Ministry of Power & State DISCOMs',
        advisoryTitle: 'Consumer Advisory: Beware of Fake Electricity Bill Disconnection Messages',
        url: 'https://cybercrime.gov.in',
        verifiedAt: '2024-09-15',
      },
    ],
    shieldExamplePayload:
      'Dear Consumer, Your electricity supply will be disconnected tonight at 9:30 PM from the power office because your previous month bill was not updated. Immediately call our electricity officer at +919876543210.',
    relatedLessonSlug: 'remote-access-and-screen-sharing',
    relatedTrackId: 'track_resilience',
  },
  {
    slug: 'bank-kyc-pan-update-apk',
    title: 'The Fake Bank KYC / PAN Card Expiry APK Trap',
    category: 'Credential Phishing',
    badge: 'RBI Public Caution Notice',
    summary:
      'Phishing SMS claiming bank account or debit card is suspended due to expired KYC / PAN link, directing users to click a shortened link to download a malicious trojan APK.',
    whatHappened:
      'Reserve Bank of India (RBI) has repeatedly alerted bank customers against sharing credentials or clicking third-party links for KYC updates. Fraudsters spoof major Indian banks (SBI, HDFC, ICICI, PNB) with messages stating accounts will be blocked unless KYC is completed within 24 hours. The link downloads an Android package that intercepts SMS OTPs and forwards them to attacker command servers.',
    howVictimsApproached:
      'SMS text messages containing urgent suspension notices with shortened links (bit.ly, tinyurl, .xyz domains).',
    warningSigns: [
      'Threat of imminent bank account freeze within 12-24 hours.',
      'Link points to a non-bank domain (e.g. sbi-kyc-verify.top, hdfc-update.xyz).',
      'Website downloads an APK file instead of redirecting to the official bank website or app store.',
      'App requests SMS, Call Log, and Notification read permissions upon install.',
    ],
    psychologicalManipulation:
      'Triggers fear of loss of access to funds and banking services, prompting urgent compliance.',
    howMoneyLost:
      'The malicious app logs net banking credentials entered by the user, reads incoming 2FA OTPs in the background, and drains bank accounts.',
    whatUsersShouldHaveChecked: [
      'Banks never send links in SMS to update KYC or PAN details.',
      'KYC updates are carried out through official banking branches, official net banking portals, or the official bank mobile app downloaded from Google Play / Apple App Store.',
    ],
    howToReport: [
      'Immediately disable internet on mobile, uninstall the malicious APK, and call your bank to block net banking.',
      'Dial 1930 to register the fraud incident with cyber police.',
    ],
    lessonsLearned: [
      'Never click links in SMS regarding KYC or account blockage.',
      'Never install APK files directly from web links.',
    ],
    officialSources: [
      {
        authority: 'Reserve Bank of India (RBI)',
        advisoryTitle: 'RBI Cautions Public Against Frauds in the Name of KYC Updation',
        url: 'https://rbi.org.in',
        verifiedAt: '2024-08-18',
      },
    ],
    shieldExamplePayload:
      'Important Notice: Your bank account will be blocked today due to pending PAN card verification. Click http://bank-kyc-update.xyz/login to download update tool and verify net banking credentials.',
    relatedLessonSlug: 'otp-and-credential-security',
    relatedTrackId: 'track_resilience',
  },
  {
    slug: 'crypto-arbitrage-doubling-platform',
    title: 'The High-Yield Forex & Crypto Arbitrage Scam',
    category: 'Ponzi & Fake Trading',
    badge: 'RBI Alert List & SEBI Warning',
    summary:
      'Unregistered offshore platforms promising 5%–10% daily returns through AI algorithmic arbitrage trading bots, paying initial referral bonuses before vanishing with deposits.',
    whatHappened:
      'RBI maintains an "Alert List" of unauthorized forex and cryptocurrency trading portals. Fraudulent operators set up high-yield investment programs (HYIP) claiming proprietary AI algorithms generate risk-free daily profits in international currency arbitrage. Investors are encouraged to recruit friends and family with multi-level referral commissions before the entire site suddenly ceases withdrawals.',
    howVictimsApproached:
      'Direct messages on Instagram, Telegram investment channels, and referral links shared by acquaintances who believed the scheme was genuine due to initial simulated dashboard gains.',
    warningSigns: [
      'Promises of daily or weekly fixed returns (e.g., 2% daily, 100% monthly).',
      'Claims of "AI automated risk-free trading algorithm".',
      'Entity is not registered with SEBI as an investment adviser or broker.',
      'Heavy emphasis on multi-tier referral compensation (MLM structure).',
    ],
    psychologicalManipulation:
      'Combines mathematical illusion of exponential compounding with social validation from peer referrals and fake high-tech "AI bot" buzzwords.',
    howMoneyLost:
      'Deposits are converted into unbacked internal platform tokens or transferred to offshore crypto wallets, leaving victims with zero recourse once the server shuts down.',
    whatUsersShouldHaveChecked: [
      'Check RBI Alert List for unauthorized foreign exchange trading portals (https://rbi.org.in).',
      'High guaranteed daily returns are mathematically impossible in regulated financial markets.',
    ],
    howToReport: [
      'File a complaint with SEBI and cyber police helpline (1930).',
      'Report the domain on the National Cyber Crime Reporting Portal.',
    ],
    lessonsLearned: [
      'Any platform promising daily guaranteed profits is a Ponzi/pyramid scheme.',
      'Always cross-reference international trading entities against the RBI Alert List.',
    ],
    officialSources: [
      {
        authority: 'Reserve Bank of India (RBI)',
        advisoryTitle: 'Alert List of Entities Neither Authorised to Deal in Forex Nor Authorised to Operate Electronic Trading Platform',
        url: 'https://rbi.org.in',
        verifiedAt: '2024-11-01',
      },
    ],
    shieldExamplePayload:
      'Revolutionary AI Crypto Trading Bot: Earn 8% daily return guaranteed on auto-pilot. Deposit ₹20,000 to start earning passive income every 24 hours. Withdraw anytime with zero risk.',
    relatedLessonSlug: 'unrealistic-yields-and-daily-roi',
    relatedTrackId: 'track_resilience',
  },
];

export function getAllCaseStudies(): CaseStudy[] {
  return INDIA_SCAM_CASE_STUDIES;
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return INDIA_SCAM_CASE_STUDIES.find((c) => c.slug === slug);
}
