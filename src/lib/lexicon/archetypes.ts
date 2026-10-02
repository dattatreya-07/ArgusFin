import { Archetype } from '../types';

export const ARCHETYPE_KEYWORDS: Record<Archetype, string[]> = {
  DOUBLING_SCHEME: [
    'double',
    '2x',
    '3x',
    '5x',
    '10x',
    'triple',
    'double money',
    'दोगुना', // TODO(review)
    '2 गुना', // TODO(review)
    'डबल', // TODO(review)
    'இரட்டிப்பு', // TODO(review)
    '2 மடங்கு', // TODO(review)
  ],
  COPY_TRADING: [
    'copy trading',
    'copy trade',
    'mirror trading',
    'auto trading bot',
    'automated copy',
    'कॉपी ट्रेडिंग', // TODO(review)
    'காப்பி டிரேடிங்', // TODO(review)
  ],
  COURSE_FINFLUENCER: [
    'mentorship',
    'trading course',
    'finfluencer',
    'masterclass',
    'secret strategy course',
    'ट्रेडिंग कोर्स', // TODO(review)
    'मास्टरक्लास', // TODO(review)
    'பயிற்சி வகுப்பு', // TODO(review)
    'மாஸ்டர்கிளாஸ்', // TODO(review)
  ],
  CRYPTO_STAKING_MINING: [
    'crypto',
    'staking',
    'cloud mining',
    'usdt',
    'btc',
    'bitcoin',
    'crypto staking',
    'क्रिप्टो', // TODO(review)
    'माइनिंग', // TODO(review)
    'स्टேக்கிங்', // TODO(review)
    'கிரிப்டோ', // TODO(review)
    'ஸ்டேக்கிங்', // TODO(review)
    'மைனிங்', // TODO(review)
  ],
  FAKE_TRADING_APP_OR_PORTAL: [
    'download apk',
    'install custom app',
    'trading apk',
    'portal login',
    'institutional terminal',
    'संस्थागत पोर्टल', // TODO(review)
    'ऐप डाउनलोड', // TODO(review)
    'APK பதிவிறக்கம்', // TODO(review)
    'வர்த்தக செயலியை', // TODO(review)
  ],
  FAKE_ADVISORY_OR_REG_CLAIM: [
    'sure shot',
    'jackpot call',
    '99% accuracy tips',
    'sebi tips',
    'guaranteed jackpot',
    'सटीक टिप्स', // TODO(review)
    'जैकपॉट कॉल', // TODO(review)
    'துல்லியமான டிப்ஸ்', // TODO(review)
    'ஜாக்பாட் கால்ஸ்', // TODO(review)
  ],
  PUMP_AND_DUMP_GROUP: [
    'penny stock',
    'pump',
    'circuit stock',
    'operator call',
    'huge breakout call',
    'पेनी स्टॉक', // TODO(review)
    'ऑपरेटर कॉल', // TODO(review)
    'सर्किट स्टॉक', // TODO(review)
    'பங்கு உயர்வு', // TODO(review)
    'பென்னி ஸ்டாக்', // TODO(review)
    'ஆபரேட்டர் கால்', // TODO(review)
  ],
  REMOTE_ACCESS_SCAM: [
    'anydesk',
    'teamviewer',
    'rustdesk',
    'quicksupport',
    'screen share',
    'स्क्रीन शेयर', // TODO(review)
    'திரையை பகிரவும்', // TODO(review)
    'एनीडेस्क', // TODO(review)
    'டீம்வியூவர்', // TODO(review)
  ],
  FAKE_IPO_OR_ALLOTMENT: [
    'pre-ipo',
    'guaranteed ipo',
    'special quota ipo',
    'hni quota allotment',
    'आईपीओ अलॉटमेंट', // TODO(review)
    'एचएनआई कोटा', // TODO(review)
    'ஐபிஓ ஒதுக்கீடு', // TODO(review)
    'பிரீ-ஐபிஓ', // TODO(review)
  ],
  OTHER_OR_NONE: [],
};
