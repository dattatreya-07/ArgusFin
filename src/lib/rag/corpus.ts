import { CorpusDoc, CorpusChunk } from './types';
import { SOURCE_REGISTRY } from './sources';

export const VERIFIED_CORPUS_DOCS: CorpusDoc[] = [
  {
    id: 'doc-sebi-copy-trading',
    sourceId: 'src-sebi-copy-trading-2022',
    title: 'SEBI Advisory on Algorithmic and Copy Trading by Unregistered Entities',
    publisher: 'Securities and Exchange Board of India (SEBI)',
    sourceUrl: 'https://www.sebi.gov.in/enforcement/clarifications-on-sebi/may-2022/caution-against-unregistered-entities-offering-algorithmic-trading-to-retail-investors_59092.html',
    publishedAt: '2022-05-19',
    verifiedAt: '2026-10-01',
    language: 'en',
    trustTier: 'TIER_1_PRIMARY',
    topic: 'copy_trading',
    content: `SEBI cautions retail investors against unregistered entities and platforms offering automated copy trading, mirror trading, and automated algo bots promising assured or high returns. Under SEBI regulations, no person shall act as an investment adviser or portfolio manager without obtaining registration from SEBI. Sharing trading account credentials, API tokens, or OTPs with third-party software risks total capital loss and unauthorized fund siphoning. Any claim of guaranteed return in the securities market is fraudulent.`,
  },
  {
    id: 'doc-sebi-fii-ipo',
    sourceId: 'src-sebi-fii-ipo-2024',
    title: 'SEBI Warning on Fake Institutional Accounts and Pre-IPO Allotment Scams',
    publisher: 'Securities and Exchange Board of India (SEBI)',
    sourceUrl: 'https://www.sebi.gov.in/media-and-notifications/press-releases/feb-2024/sebi-cautions-investors-against-fraudulent-trading-platforms-luring-investors-with-fake-fii-sub-accounts_81776.html',
    publishedAt: '2024-02-26',
    verifiedAt: '2026-10-01',
    language: 'en',
    trustTier: 'TIER_1_PRIMARY',
    topic: 'fake_ipo_allotment',
    content: `SEBI has warned against syndicates posing as institutional entities or FII sub-accounts offering 100% guaranteed IPO allotments or off-market block shares at huge discounts. SEBI states that retail investors cannot directly invest through FII/institutional sub-accounts. Legitimate IPO applications must be routed strictly through ASBA (Application Supported by Blocked Amount) via authorized banks or registered stock brokers. Never transfer money to individual personal bank accounts or private UPI IDs for IPO applications.`,
  },
  {
    id: 'doc-mha-cybercrime-1930',
    sourceId: 'src-mha-cybercrime-1930',
    title: 'MHA National Cyber Crime Reporting Portal & 1930 Golden Hour SOP',
    publisher: 'Ministry of Home Affairs / I4C',
    sourceUrl: 'https://cybercrime.gov.in',
    publishedAt: '2023-01-15',
    verifiedAt: '2026-10-01',
    language: 'en',
    trustTier: 'TIER_1_PRIMARY',
    topic: 'helpline_reporting',
    content: `If you have lost money to a financial fraud or UPI scam, immediately dial 1930 (Citizen Financial Cyber Fraud Reporting and Management System) within the golden hour (first 2 to 4 hours). Calling 1930 alerts the beneficiary banks and payment gateways to freeze the siphoned funds before the scammer withdraws cash at an ATM or converts to crypto. You must also register a formal complaint on cybercrime.gov.in with transaction IDs, UPI reference numbers, beneficiary bank account details, and chat screenshots.`,
  },
  {
    id: 'doc-rbi-sachet-deposits',
    sourceId: 'src-rbi-sachet-2023',
    title: 'RBI Sachet Portal and Prohibition of Unlawful Deposit Schemes',
    publisher: 'Reserve Bank of India (RBI)',
    sourceUrl: 'https://sachet.rbi.org.in',
    publishedAt: '2023-08-10',
    verifiedAt: '2026-10-01',
    language: 'en',
    trustTier: 'TIER_1_PRIMARY',
    topic: 'unrealistic_returns',
    content: `Under the Banning of Unregulated Deposit Schemes Act (BUDS Act), accepting deposits or investment funds from the public with promises of unrealistic doubling or fixed daily/monthly interest without regulatory registration is a cognizable criminal offence. The RBI Sachet portal allows citizens to check whether an entity is registered with RBI, SEBI, IRDAI, or PFRDA before investing, and provides a direct mechanism to file complaints against illegal deposit mobilization schemes.`,
  },
  {
    id: 'doc-dot-chakshu-advisory',
    sourceId: 'src-dot-chakshu-2024',
    title: 'Department of Telecommunications Chakshu Fraud Communication Facility',
    publisher: 'Department of Telecommunications (DoT)',
    sourceUrl: 'https://sancharsaathi.gov.in/sfc/',
    publishedAt: '2024-03-04',
    verifiedAt: '2026-10-01',
    language: 'en',
    trustTier: 'TIER_1_PRIMARY',
    topic: 'phishing_links',
    content: `The Chakshu facility on Sanchar Saathi allows citizens to report suspected fraudulent communications received via SMS, voice calls, or WhatsApp related to fake KYC, financial fraud, impersonation of government officials, or lottery scams. Reporting such numbers triggers immediate carrier verification, IMEI barring, and disconnection of telecom resources used by cybercrime networks.`,
  },
  {
    id: 'doc-sebi-hi-advisory',
    sourceId: 'src-sebi-hi-advisory-2023',
    title: 'सेबी परामर्श: अनधिकृत ट्रेडिंग ऐप और कॉपी ट्रेडिंग से सावधान रहें',
    publisher: 'Securities and Exchange Board of India (SEBI)',
    sourceUrl: 'https://www.sebi.gov.in',
    publishedAt: '2023-11-20',
    verifiedAt: '2026-10-01',
    language: 'hi',
    trustTier: 'TIER_1_PRIMARY',
    topic: 'copy_trading',
    content: `सेबी निवेशकों को आगाह करता है कि किसी भी अपंजीकृत व्यक्ति या संस्था को अपना पैसा या ट्रेडिंग खाता क्रेडेंशियल न सौंपें। सोशल मीडिया, टेलीग्राम या व्हाट्सएप पर गारंटीड रिटर्न या 100% मुनाफा देने का दावा करने वाले ऐप पूरी तरह अवैध हैं। सेबी में पंजीकृत सलाहकारों की सूची सेबी की आधिकारिक वेबसाइट पर जांची जा सकती है। यदि आपके साथ धोखाधड़ी हुई है, तो तुरंत 1930 पर कॉल करें और cybercrime.gov.in पर रिपोर्ट दर्ज करें।`,
  },
  {
    id: 'doc-sebi-ta-advisory',
    sourceId: 'src-sebi-ta-advisory-2023',
    title: 'செபி எச்சரிக்கை: அங்கீகரிக்கப்படாத வர்த்தக செயலிகள் மற்றும் போலி திட்டங்கள்',
    publisher: 'Securities and Exchange Board of India (SEBI)',
    sourceUrl: 'https://www.sebi.gov.in',
    publishedAt: '2023-11-20',
    verifiedAt: '2026-10-01',
    language: 'ta',
    trustTier: 'TIER_1_PRIMARY',
    topic: 'copy_trading',
    content: `செபி பதிவு பெறாத எந்தவொரு தனிநபரோ அல்லது நிறுவனமோ முதலீட்டு ஆலோசனைகளை வழங்கவோ அல்லது உத்தரவாதமான லாபத்தை உறுதியளிக்கவோ அனுமதி இல்லை. டெலிகிராம் அல்லது வாட்ஸ்அப் வழியாக போலி ஐபிஓ ஒதுக்கீடு அல்லது காப்பி டிரேடிங் வழங்கும் மோசடிகளை தவிர்க்கவும். பணம் இழந்தால் உடனடியாக 1930 தேசிய உதவி எண்ணை அழைக்கவும் அல்லது cybercrime.gov.in இணையதளத்தில் புகார் அளிக்கவும்.`,
  },
  {
    id: 'doc-sebi-fixed-income',
    sourceId: 'src-sebi-fixed-income-2024',
    title: 'SEBI & RBI Investor Guide: Fixed Income, Bonds, Treasury Bills and Fixed Deposits',
    publisher: 'Securities and Exchange Board of India (SEBI) / RBI',
    sourceUrl: 'https://investor.sebi.gov.in/bonds_and_fd_guide.html',
    publishedAt: '2024-01-10',
    verifiedAt: '2026-10-01',
    language: 'en',
    trustTier: 'TIER_1_PRIMARY',
    topic: 'fixed_income',
    content: `Fixed income instruments include bank Fixed Deposits (FDs), Government Securities (G-Secs), Treasury Bills, and Corporate Bonds. In fixed deposits, the bank pays a stated interest rate over a fixed tenure. In bonds, the issuer pays a periodic coupon and returns principal at maturity. Bond yield fluctuates inversely with bond market price: when interest rates rise, existing bond prices fall. Corporate bonds carry credit risk or default risk depending on issuer credit rating, whereas Sovereign G-Secs backed by the government have zero sovereign default risk. Historical yield is not a guarantee of future secondary market prices. Premature FD withdrawal may incur minor penalty charges.`,
  },
  {
    id: 'doc-sebi-mutual-funds',
    sourceId: 'src-sebi-mutual-funds-2024',
    title: 'SEBI & AMFI Investor Handbook: Net Asset Value (NAV), Expense Ratio and SIP Mechanics',
    publisher: 'Securities and Exchange Board of India (SEBI) / AMFI',
    sourceUrl: 'https://investor.sebi.gov.in/mutual_funds.html',
    publishedAt: '2024-02-15',
    verifiedAt: '2026-10-01',
    language: 'en',
    trustTier: 'TIER_1_PRIMARY',
    topic: 'mutual_funds',
    content: `A mutual fund pools money from investors to purchase a diversified portfolio of stocks, bonds, or short-term debt securities under an Asset Management Company (AMC). Net Asset Value (NAV) represents the market value of one fund unit, calculated daily after subtracting fund liabilities and the annual expense ratio. In a Systematic Investment Plan (SIP), investors make recurring monthly contributions to average out purchase costs across market volatility (rupee cost averaging). Lump-sum investing deploys capital all at once. Redemption converts fund units back to cash at the applicable NAV. Mutual fund returns are market-linked and past CAGR performance is never a guarantee of future returns.`,
  },
  {
    id: 'doc-sebi-equity-shares',
    sourceId: 'src-sebi-equity-market-2024',
    title: 'SEBI, NSE & BSE Educational Guide: Equities, Stock Valuation, Settlement and Depositories',
    publisher: 'Securities and Exchange Board of India (SEBI) / NSE',
    sourceUrl: 'https://investor.sebi.gov.in/equity_market_basics.html',
    publishedAt: '2024-03-01',
    verifiedAt: '2026-10-01',
    language: 'en',
    trustTier: 'TIER_1_PRIMARY',
    topic: 'equity_shares',
    content: `Equity shares represent fractional ownership in a publicly traded corporation. Stock prices fluctuate based on market capitalization, company earnings, sector growth expectations, and liquidity. Shareholders earn returns via dividend payouts declared by the board or capital gains when selling shares above purchase price. Equity share dilution occurs when a company issues additional shares, expanding share count. Securities transactions are cleared on a T+1 settlement cycle where stockbrokers execute orders on stock exchanges (NSE/BSE) and shares are safely credited to Demat accounts held with depositories (NSDL/CDSL). Equity markets carry price volatility risk.`,
  },
  {
    id: 'doc-sebi-derivatives-fo',
    sourceId: 'src-sebi-derivatives-fo-2024',
    title: 'SEBI Investor Risk Warning: Futures & Options (F&O) Derivatives Trading',
    publisher: 'Securities and Exchange Board of India (SEBI)',
    sourceUrl: 'https://www.sebi.gov.in/reports-and-statistics/research/jan-2023/study-analysis-of-profit-and-loss-in-individual-traders-fo-segment_67586.html',
    publishedAt: '2024-01-25',
    verifiedAt: '2026-10-01',
    language: 'en',
    trustTier: 'TIER_1_PRIMARY',
    topic: 'futures_and_options',
    content: `Futures and Options (F&O) are financial derivative contracts deriving value from underlying assets such as stock indices or commodities. Futures oblige buyers and sellers to transact at a specified strike price on an expiry date. Options give the buyer the right (Call for buying, Put for selling) to transact upon paying a premium. Derivatives require maintaining initial margin balances; leverage amplifies both potential profits and rapid capital losses. SEBI studies show 9 out of 10 individual retail traders in F&O incur net financial losses. F&O is suitable only for informed hedging, not retail speculative doubling schemes.`,
  },
  {
    id: 'doc-rbi-crypto-vda',
    sourceId: 'src-rbi-crypto-vda-2024',
    title: 'RBI & SEBI Advisory: Virtual Digital Assets, Crypto Volatility & Counterparty Risks',
    publisher: 'Reserve Bank of India (RBI) / FIU-IND',
    sourceUrl: 'https://rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=51658',
    publishedAt: '2024-02-10',
    verifiedAt: '2026-10-01',
    language: 'en',
    trustTier: 'TIER_1_PRIMARY',
    topic: 'crypto_digital_assets',
    content: `Virtual Digital Assets (VDA) and cryptocurrencies are decentralized digital tokens operating on distributed blockchain ledgers. Crypto assets carry extreme price volatility, platform liquidity restrictions, hot wallet hack vulnerabilities, and counterparty risks. Unregulated staking platforms promising fixed daily income or yield mining are frequent covers for Ponzi schemes. Crypto transactions are mathematically irreversible; once funds are transferred to a private blockchain wallet, regulatory recovery is virtually impossible. Regulatory bodies warn that crypto is not legal tender in India.`,
  },
];

/**
 * Splits corpus documents into deterministic sentence/paragraph chunks.
 */
export function buildCorpusChunks(docs: CorpusDoc[] = VERIFIED_CORPUS_DOCS): CorpusChunk[] {
  const chunks: CorpusChunk[] = [];

  for (const doc of docs) {
    const sentences = doc.content
      .split(/(?<=[.!?।])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    let currentChunkText = '';
    let chunkIndex = 1;

    for (let i = 0; i < sentences.length; i++) {
      currentChunkText += (currentChunkText ? ' ' : '') + sentences[i];

      if (currentChunkText.length >= 450 || i === sentences.length - 1) {
        chunks.push({
          id: `${doc.id}-chk-${chunkIndex++}`,
          docId: doc.id,
          sourceId: doc.sourceId,
          title: doc.title,
          publisher: doc.publisher,
          sourceUrl: doc.sourceUrl,
          publishedAt: doc.publishedAt,
          verifiedAt: doc.verifiedAt,
          language: doc.language,
          trustTier: doc.trustTier,
          topic: doc.topic,
          text: currentChunkText,
        });
        currentChunkText = '';
      }
    }
  }

  return chunks;
}

export const ALL_CORPUS_CHUNKS = buildCorpusChunks();
