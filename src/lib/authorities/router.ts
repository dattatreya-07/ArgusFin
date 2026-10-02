import { getVerifiedAuthorities, getAuthorityById } from './data';
import {
  AuthorityRouteResult,
  AuthorityRouteStatus,
  RoutedAuthorityItem,
  RoutingInput,
} from './types';

const ROUTING_EXPLANATIONS: Record<
  string,
  {
    reason: string;
    actionGuidance: string;
    isEmergency: boolean;
  }
> = {
  national_cyber_helpline: {
    reason:
      'The National Cyber Crime Helpline (1930) coordinates immediate transaction freezing across beneficiary banks during the initial golden hour.',
    actionGuidance:
      'Call 1930 immediately with your transaction UTR / UPI reference numbers, debit bank details, and timestamp to request a temporary lien on recipient accounts.',
    isEmergency: true,
  },
  cybercrime_portal: {
    reason:
      'The National Cyber Crime Reporting Portal (cybercrime.gov.in) provides the formal digital repository for cyber financial fraud incidents.',
    actionGuidance:
      'Register an official incident report under Financial Fraud, attaching transaction receipts, communication screenshots, and bank statements.',
    isEmergency: false,
  },
  sebi_scores: {
    reason:
      'SEBI SCORES 2.0 handles complaints concerning securities trading, unregistered investment advisors, and unauthorized share allotment claims.',
    actionGuidance:
      'Search the SEBI Intermediary Database to verify claimed registration, and lodge a formal complaint on scores.gov.in if an entity is falsely claiming SEBI authorization.',
    isEmergency: false,
  },
  rbi_sachet: {
    reason:
      'RBI Sachet is the State Level Coordination Committee portal for reporting unauthorized deposit-taking, collective schemes, and unregistered finance apps.',
    actionGuidance:
      'File an alert or complaint regarding unauthorized deposit collection or non-banking financial solicitation on sachet.rbi.org.in.',
    isEmergency: false,
  },
  telecom_fraud_reporting: {
    reason:
      'DoT Chakshu Facility enables citizens to report suspected fraudulent SMS, WhatsApp invitations, fake advisory groups, and malicious calling numbers.',
    actionGuidance:
      'Submit the suspect phone number, message text, and group link at sancharsaathi.gov.in/sfc/ to trigger telecom-level verification and disconnection.',
    isEmergency: false,
  },
  user_bank: {
    reason:
      'Your issuing bank dispute cell can execute card hotlisting, UPI VPA revoking, and initiate interbank chargeback requests.',
    actionGuidance:
      'Contact the official 24/7 fraud helpline number printed on the reverse of your debit/credit card or within your verified banking app.',
    isEmergency: true,
  },
};

const DISCLAIMER =
  'This routing is an informational pre-filing guide based on your supplied incident characteristics. SANGYAN is an educational system and does not file official complaints or make legal determinations.';

/**
 * Deterministic Authority Router
 */
export function routeAuthorities(input: RoutingInput): AuthorityRouteResult {
  const allAuthorities = getVerifiedAuthorities();
  if (allAuthorities.length === 0) {
    return {
      status: 'UNAVAILABLE',
      category: input.category || input.situation || 'UNKNOWN',
      authorityIds: [],
      routes: [],
      reasons: ['Verified authority database is temporarily unavailable.'],
      disclaimer: DISCLAIMER,
    };
  }

  const selectedIds = new Set<string>();
  const situationReasons: string[] = [];

  // 1. Evaluate emergency / lost funds / golden hour
  const hasMoneyLost =
    input.moneySent === true ||
    input.situation === 'money_lost_recent' ||
    input.category === 'PAYMENT_FRAUD' ||
    (typeof input.hoursElapsed === 'number' && input.hoursElapsed <= 48);

  const hasCredentialsCompromised =
    input.credentialsShared === true ||
    input.otpShared === true ||
    input.remoteAccessGranted === true;

  if (hasMoneyLost || hasCredentialsCompromised) {
    selectedIds.add('national_cyber_helpline');
    selectedIds.add('user_bank');
    selectedIds.add('cybercrime_portal');

    if (input.remoteAccessGranted) {
      situationReasons.push(
        'Remote access software or credentials reported: Immediate bank account protection and cyber helpline notification prioritized.'
      );
    } else {
      situationReasons.push(
        'Recent financial transaction reported: Golden hour cyber helpline (1930) and bank freeze procedures prioritized.'
      );
    }
  }

  // 2. Evaluate securities / investment advisory / fake IPO / Ponzi
  const isSecuritiesOrAdvisory =
    input.category === 'SECURITIES_FRAUD' ||
    input.category === 'UNREGISTERED_ADVISORY' ||
    input.category === 'PROMISED_RETURN' ||
    input.category === 'TRADING_PLATFORM' ||
    input.category === 'IPO_ALLOTMENT' ||
    input.situation === 'unregistered_adviser' ||
    input.archetype === 'UNREGISTERED_ADVISORY' ||
    input.archetype === 'FAKE_IPO' ||
    input.archetype === 'COPY_TRADING_SCHEME';

  if (isSecuritiesOrAdvisory) {
    selectedIds.add('sebi_scores');
    selectedIds.add('rbi_sachet');
    situationReasons.push(
      'Securities, trading, or investment advisory claims detected: Regulated under SEBI and RBI investor grievance frameworks.'
    );
  }

  // 3. Evaluate deposit schemes / Ponzi / MLM
  const isDepositOrPonzi =
    input.category === 'DEPOSIT_SCHEME' ||
    input.category === 'CRYPTO_STAKING' ||
    input.archetype === 'PONZI_PYRAMID' ||
    input.archetype === 'TASK_SCAM';

  if (isDepositOrPonzi) {
    selectedIds.add('rbi_sachet');
    if (!selectedIds.has('sebi_scores')) {
      selectedIds.add('sebi_scores');
    }
    situationReasons.push(
      'Unauthorized deposit-taking or collective investment scheme patterns identified: Managed via RBI Sachet portal.'
    );
  }

  // 4. Evaluate communication channels (WhatsApp / Telegram / SMS / Phone)
  const isTelecomOrSocial =
    input.situation === 'social_media_fraud' ||
    input.category === 'TELECOM_FRAUD' ||
    input.category === 'IMPERSONATION' ||
    input.category === 'GROUP_SOLICITATION' ||
    (input.platform &&
      /whatsapp|telegram|sms|instagram|facebook|phone/i.test(input.platform));

  if (isTelecomOrSocial) {
    selectedIds.add('telecom_fraud_reporting');
    if (!hasMoneyLost) {
      selectedIds.add('cybercrime_portal');
    }
    situationReasons.push(
      'Suspicious communication originated via telecom, messaging, or social media: Reporting via DoT Chakshu recommended.'
    );
  }

  // 5. Preventive / Offer Only
  if (input.situation === 'offer_only' && selectedIds.size === 0) {
    selectedIds.add('sebi_scores');
    selectedIds.add('rbi_sachet');
    selectedIds.add('telecom_fraud_reporting');
    situationReasons.push(
      'Preventive verification: Verification via official regulatory registers and reporting unverified channels advised.'
    );
  }

  // Fallback if no specific trigger matched
  if (selectedIds.size === 0) {
    if (input.situation || input.category) {
      selectedIds.add('cybercrime_portal');
      selectedIds.add('sebi_scores');
      selectedIds.add('telecom_fraud_reporting');
      situationReasons.push(
        'General financial grievance: Cross-jurisdictional reporting resources provided.'
      );
    } else {
      return {
        status: 'NO_MATCH',
        category: 'UNSPECIFIED',
        authorityIds: [],
        routes: [],
        reasons: ['No matching incident category or situation provided for routing.'],
        disclaimer: DISCLAIMER,
      };
    }
  }

  const authorityIdList = Array.from(selectedIds);
  const routedItems: RoutedAuthorityItem[] = [];

  for (const id of authorityIdList) {
    const auth = getAuthorityById(id);
    if (!auth) continue;

    const explanation = ROUTING_EXPLANATIONS[id] || {
      reason: auth.scope,
      actionGuidance: 'Review official reporting requirements and submit details on the verified portal.',
      isEmergency: false,
    };

    routedItems.push({
      id: auth.id,
      name: auth.name,
      scope: auth.scope,
      channels: auth.channels,
      verified_at: auth.verified_at,
      source_url: auth.source_url,
      reason: explanation.reason,
      actionGuidance: explanation.actionGuidance,
      isEmergency: explanation.isEmergency,
    });
  }

  // Sort so emergency authorities appear first
  routedItems.sort((a, b) => (b.isEmergency ? 1 : 0) - (a.isEmergency ? 1 : 0));

  const resolvedCategory =
    input.category ||
    (hasMoneyLost ? 'PAYMENT_FRAUD' : isSecuritiesOrAdvisory ? 'SECURITIES_FRAUD' : input.situation || 'GENERAL_GRIEVANCE');

  return {
    status: 'ROUTED',
    category: resolvedCategory,
    authorityIds: routedItems.map((r) => r.id),
    routes: routedItems,
    reasons: situationReasons,
    disclaimer: DISCLAIMER,
  };
}
