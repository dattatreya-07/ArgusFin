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
    'கிரிப்டோ', // TODO(review)
    'ஸ்டேக்கிங்', // TODO(review)
  ],
  FAKE_TRADING_APP_OR_PORTAL: [
    'download apk',
    'install custom app',
    'trading apk',
    'portal login',
    'institutional terminal',
    'ऐप डाउनलोड', // TODO(review)
    'APK பதிவிறக்கம்', // TODO(review)
  ],
  FAKE_ADVISORY_OR_REG_CLAIM: [
    'sure shot',
    'jackpot call',
    '99% accuracy tips',
    'sebi tips',
    'guaranteed jackpot',
    'सटीक टिप्स', // TODO(review)
    'துல்லியமான டிப்ஸ்', // TODO(review)
  ],
  PUMP_AND_DUMP_GROUP: [
    'penny stock',
    'pump',
    'circuit stock',
    'operator call',
    'huge breakout call',
    'पेनी स्टॉक', // TODO(review)
    'பங்கு உயர்வு', // TODO(review)
  ],
  REMOTE_ACCESS_SCAM: [
    'anydesk',
    'teamviewer',
    'rustdesk',
    'quicksupport',
    'screen share',
    'एनीडेस्क', // TODO(review)
    'டீம்வியூவர்', // TODO(review)
  ],
  FAKE_IPO_OR_ALLOTMENT: [
    'pre-ipo',
    'guaranteed ipo',
    'special quota ipo',
    'hni quota allotment',
    'आईपीओ अलॉटमेंट', // TODO(review)
    'ஐபிஓ ஒதுக்கீடு', // TODO(review)
  ],
  OTHER_OR_NONE: [],
};
