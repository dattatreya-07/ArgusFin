import { CorpusDoc, CorpusChunk } from './types';

export const VERIFIED_CORPUS_DOCS: CorpusDoc[] = [
  {
    id: 'doc-sebi-copy-trading',
    title: 'SEBI Advisory on Algorithmic and Copy Trading by Unregistered Entities',
    publisher: 'Securities and Exchange Board of India (SEBI)',
    sourceUrl: 'https://www.sebi.gov.in/enforcement/clarifications-on-sebi/may-2022/caution-against-unregistered-entities-offering-algorithmic-trading-to-retail-investors_59092.html',
    publishedAt: '2022-05-19',
    verifiedAt: '2026-10-01',
    language: 'en',
    content: `SEBI cautions retail investors against unregistered entities and platforms offering automated copy trading, mirror trading, and automated algo bots promising assured or high returns. Under SEBI regulations, no person shall act as an investment adviser or portfolio manager without obtaining registration from SEBI. Sharing trading account credentials, API tokens, or OTPs with third-party software risks total capital loss and unauthorized fund siphoning. Any claim of guaranteed return in the securities market is fraudulent.`,
  },
  {
    id: 'doc-sebi-fii-ipo',
    title: 'SEBI Warning on Fake Institutional Accounts and Pre-IPO Allotment Scams',
    publisher: 'Securities and Exchange Board of India (SEBI)',
    sourceUrl: 'https://www.sebi.gov.in/media-and-notifications/press-releases/feb-2024/sebi-cautions-investors-against-fraudulent-trading-platforms-luring-investors-with-fake-fii-sub-accounts_81776.html',
    publishedAt: '2024-02-26',
    verifiedAt: '2026-10-01',
    language: 'en',
    content: `SEBI has warned against syndicates posing as institutional entities or FII sub-accounts offering 100% guaranteed IPO allotments or off-market block shares at huge discounts. SEBI states that retail investors cannot directly invest through FII/institutional sub-accounts. Legitimate IPO applications must be routed strictly through ASBA (Application Supported by Blocked Amount) via authorized banks or registered stock brokers. Never transfer money to individual personal bank accounts or private UPI IDs for IPO applications.`,
  },
  {
    id: 'doc-mha-cybercrime-1930',
    title: 'MHA National Cyber Crime Reporting Portal & 1930 Golden Hour SOP',
    publisher: 'Ministry of Home Affairs / I4C',
    sourceUrl: 'https://cybercrime.gov.in',
    publishedAt: '2023-01-15',
    verifiedAt: '2026-10-01',
    language: 'en',
    content: `If you have lost money to a financial fraud or UPI scam, immediately dial 1930 (Citizen Financial Cyber Fraud Reporting and Management System) within the golden hour (first 2 to 4 hours). Calling 1930 alerts the beneficiary banks and payment gateways to freeze the siphoned funds before the scammer withdraws cash at an ATM or converts to crypto. You must also register a formal complaint on cybercrime.gov.in with transaction IDs, UPI reference numbers, beneficiary bank account details, and chat screenshots.`,
  },
  {
    id: 'doc-rbi-sachet-deposits',
    title: 'RBI Sachet Portal and Prohibition of Unlawful Deposit Schemes',
    publisher: 'Reserve Bank of India (RBI)',
    sourceUrl: 'https://sachet.rbi.org.in',
    publishedAt: '2023-08-10',
    verifiedAt: '2026-10-01',
    language: 'en',
    content: `Under the Banning of Unregulated Deposit Schemes Act (BUDS Act), accepting deposits or investment funds from the public with promises of unrealistic doubling or fixed daily/monthly interest without regulatory registration is a cognizable criminal offence. The RBI Sachet portal allows citizens to check whether an entity is registered with RBI, SEBI, IRDAI, or PFRDA before investing, and provides a direct mechanism to file complaints against illegal deposit mobilization schemes.`,
  },
  {
    id: 'doc-dot-chakshu-advisory',
    title: 'Department of Telecommunications Chakshu Fraud Communication Facility',
    publisher: 'Department of Telecommunications (DoT)',
    sourceUrl: 'https://sancharsaathi.gov.in/sfc/',
    publishedAt: '2024-03-04',
    verifiedAt: '2026-10-01',
    language: 'en',
    content: `The Chakshu facility on Sanchar Saathi allows citizens to report suspected fraudulent communications received via SMS, voice calls, or WhatsApp related to fake KYC, financial fraud, impersonation of government officials, or lottery scams. Reporting such numbers triggers immediate carrier verification, IMEI barring, and disconnection of telecom resources used by cybercrime networks.`,
  },
  {
    id: 'doc-sebi-hi-advisory',
    title: 'सेबी परामर्श: अनधिकृत ट्रेडिंग ऐप और कॉपी ट्रेडिंग से सावधान रहें',
    publisher: 'Securities and Exchange Board of India (SEBI)',
    sourceUrl: 'https://www.sebi.gov.in',
    publishedAt: '2023-11-20',
    verifiedAt: '2026-10-01',
    language: 'hi',
    content: `सेबी निवेशकों को आगाह करता है कि किसी भी अपंजीकृत व्यक्ति या संस्था को अपना पैसा या ट्रेडिंग खाता क्रेडेंशियल न सौंपें। सोशल मीडिया, टेलीग्राम या व्हाट्सएप पर गारंटीड रिटर्न या 100% मुनाफा देने का दावा करने वाले ऐप पूरी तरह अवैध हैं। सेबी में पंजीकृत सलाहकारों की सूची सेबी की आधिकारिक वेबसाइट पर जांची जा सकती है। यदि आपके साथ धोखाधड़ी हुई है, तो तुरंत 1930 पर कॉल करें और cybercrime.gov.in पर रिपोर्ट दर्ज करें।`,
  },
  {
    id: 'doc-sebi-ta-advisory',
    title: 'செபி எச்சரிக்கை: அங்கீகரிக்கப்படாத வர்த்தக செயலிகள் மற்றும் போலி திட்டங்கள்',
    publisher: 'Securities and Exchange Board of India (SEBI)',
    sourceUrl: 'https://www.sebi.gov.in',
    publishedAt: '2023-11-20',
    verifiedAt: '2026-10-01',
    language: 'ta',
    content: `செபி பதிவு பெறாத எந்தவொரு தனிநபரோ அல்லது நிறுவனமோ முதலீட்டு ஆலோசனைகளை வழங்கவோ அல்லது உத்தரவாதமான லாபத்தை உறுதியளிக்கவோ அனுமதி இல்லை. டெலிகிராம் அல்லது வாட்ஸ்அப் வழியாக போலி ஐபிஓ ஒதுக்கீடு அல்லது காப்பி டிரேடிங் வழங்கும் மோசடிகளை தவிர்க்கவும். பணம் இழந்தால் உடனடியாக 1930 தேசிய உதவி எண்ணை அழைக்கவும் அல்லது cybercrime.gov.in இணையதளத்தில் புகார் அளிக்கவும்.`,
  },
];

/**
 * Splits corpus documents into deterministic sentence/paragraph chunks.
 */
export function buildCorpusChunks(docs: CorpusDoc[] = VERIFIED_CORPUS_DOCS): CorpusChunk[] {
  const chunks: CorpusChunk[] = [];

  for (const doc of docs) {
    // Split into chunks by sentences (approx 2-3 sentences per chunk)
    const sentences = doc.content
      .split(/(?<=[.!?।])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    let currentChunkText = '';
    let chunkIndex = 1;

    for (let i = 0; i < sentences.length; i++) {
      currentChunkText += (currentChunkText ? ' ' : '') + sentences[i];

      if (currentChunkText.length >= 180 || i === sentences.length - 1) {
        chunks.push({
          id: `${doc.id}-chk-${chunkIndex++}`,
          docId: doc.id,
          title: doc.title,
          publisher: doc.publisher,
          sourceUrl: doc.sourceUrl,
          publishedAt: doc.publishedAt,
          verifiedAt: doc.verifiedAt,
          language: doc.language,
          text: currentChunkText,
        });
        currentChunkText = '';
      }
    }
  }

  return chunks;
}

export const ALL_CORPUS_CHUNKS = buildCorpusChunks();
