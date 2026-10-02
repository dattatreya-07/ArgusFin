import { ChannelCheckResult, ChannelResponse, ChannelResponseAction } from './types';
import { Lang, RiskBand } from '../types';

const RISK_EMOJIS: Record<RiskBand, string> = {
  HIGH: '🚨',
  MEDIUM: '⚠️',
  LOW_SIGNALS: 'ℹ️',
  CANNOT_VERIFY: '🔍',
};

const LOCALIZED_RISK_TITLES: Record<Lang, Record<RiskBand, string>> = {
  en: {
    HIGH: 'HIGH RISK (Major Red Flags Found)',
    MEDIUM: 'MEDIUM RISK (Caution Advised)',
    LOW_SIGNALS: 'Low Risk Signals Found (Not a Guarantee)',
    CANNOT_VERIFY: 'Cannot Verify From Available Data',
  },
  hi: {
    HIGH: 'उच्च जोखिम (गंभीर धोखाधड़ी के संकेत मिले)',
    MEDIUM: 'मध्यम जोखिम (सावधानी बरतें)',
    LOW_SIGNALS: 'कम जोखिम के संकेत (यह कोई गारंटी नहीं है)',
    CANNOT_VERIFY: 'उपलब्ध स्रोतों से पुष्टि नहीं की जा सकती',
  },
  ta: {
    HIGH: 'அதிக ஆபத்து (முக்கிய எச்சரிக்கை அறிகுறிகள் கண்டறியப்பட்டன)',
    MEDIUM: 'நடுத்தர ஆபத்து (எச்சரிக்கை தேவை)',
    LOW_SIGNALS: 'குறைந்த ஆபத்து அறிகுறிகள் (இது உத்தரவாதம் அல்ல)',
    CANNOT_VERIFY: 'கிடைக்கக்கூடிய தரவிலிருந்து சரிபார்க்க முடியவில்லை',
  },
};

const LOCALIZED_LABELS = {
  en: {
    title: 'SANGYAN Financial Claim Check',
    risk: 'Risk Assessment',
    signals: 'Detected Signals',
    unverified: 'Could Not Verify',
    nextStep: 'Recommended Next Step',
    calcAction: 'Check the Math (Reality Ladder)',
    reportAction: 'Prepare First-Victim Report',
    disclaimer: 'Educational investor protection tool. SANGYAN does not provide investment advice or name specific entities as scams.',
  },
  hi: {
    title: 'संज्ञान वित्तीय दावा जांच',
    risk: 'जोखिम मूल्यांकन',
    signals: 'पाए गए संकेत',
    unverified: 'सत्यापित नहीं किया जा सका',
    nextStep: 'अनुशंसित अगला कदम',
    calcAction: 'वास्तविकता कैलकुलेटर पर जांचें',
    reportAction: 'पूर्व-शिकायत विवरण तैयार करें',
    disclaimer: 'शैक्षिक निवेशक सुरक्षा उपकरण। संज्ञान निवेश सलाह नहीं देता है।',
  },
  ta: {
    title: 'சங்க்யான் நிதி உரிமை கோரல் சரிபார்ப்பு',
    risk: 'ஆபத்து மதிப்பீடு',
    signals: 'கண்டறியப்பட்ட அறிகுறிகள்',
    unverified: 'சரிபார்க்க முடியவில்லை',
    nextStep: 'பரிந்துரைக்கப்படும் அடுத்த படி',
    calcAction: 'கணக்கீட்டை சரிபார்க்கவும்',
    reportAction: 'சம்பவ அறிக்கையை தயார் செய்யவும்',
    disclaimer: 'கல்விசார் முதலீட்டாளர் பாதுகாப்பு தளம். சங்க்யான் முதலீட்டு ஆலோசனைகளை வழங்காது.',
  },
};

import { RULE_DEFINITIONS } from '../rules';

/**
 * Formats a ChannelCheckResult into a structured ChannelResponse.
 */
export function formatChannelResponse(
  result: ChannelCheckResult,
  baseUrl = 'https://sangyan.in'
): ChannelResponse {
  const lang = result.language;
  const labels = LOCALIZED_LABELS[lang] || LOCALIZED_LABELS.en;
  const riskTitle = (LOCALIZED_RISK_TITLES[lang] || LOCALIZED_RISK_TITLES.en)[result.band];
  const emoji = RISK_EMOJIS[result.band] || '🔍';

  // Extract top 3 flags
  const topSignals = result.flags
    .slice(0, 3)
    .map((f) => RULE_DEFINITIONS[f.ruleId]?.name || f.ruleId);
  const unverifiedAspects = result.unverified.slice(0, 3);

  // Primary action
  const primaryAction: ChannelResponseAction =
    result.band === 'HIGH' || result.band === 'MEDIUM'
      ? {
          label: labels.reportAction,
          url: `${baseUrl}/${lang}/report`,
        }
      : {
          label: labels.nextStep,
          url: `${baseUrl}/${lang}/check`,
        };

  // Calculator action if applicable
  const calculatorAction: ChannelResponseAction | undefined = result.calcUrl
    ? {
        label: labels.calcAction,
        url: `${baseUrl}${result.calcUrl}`,
      }
    : undefined;

  // Telegram/Chat compact markdown
  const markdownLines: string[] = [
    `*${emoji} ${labels.title}*`,
    `\n*${labels.risk}:* ${riskTitle}`,
  ];

  if (topSignals.length > 0) {
    markdownLines.push(`\n*${labels.signals}:*`);
    topSignals.forEach((s) => markdownLines.push(`• ${s}`));
  }

  if (unverifiedAspects.length > 0) {
    markdownLines.push(`\n*${labels.unverified}:*`);
    unverifiedAspects.forEach((u) => markdownLines.push(`• ${u}`));
  }

  if (calculatorAction) {
    markdownLines.push(`\n🔢 [${calculatorAction.label}](${calculatorAction.url})`);
  }

  if (primaryAction) {
    markdownLines.push(`\n📋 [${primaryAction.label}](${primaryAction.url})`);
  }

  markdownLines.push(`\n_${labels.disclaimer}_`);

  return {
    summaryText: `${emoji} ${riskTitle}. ${topSignals.length} red flags detected.`,
    formattedMarkdown: markdownLines.join('\n'),
    riskBand: result.band,
    topSignals,
    unverifiedAspects,
    primaryAction,
    calculatorAction,
    disclaimer: labels.disclaimer,
  };
}

/**
 * Generates the official documentation note for WhatsApp roadmap status.
 */
export function getWhatsAppRoadmapStatus(): {
  status: 'ROADMAP_ONLY';
  reason: string;
  architecture: string;
} {
  return {
    status: 'ROADMAP_ONLY',
    reason:
      'WhatsApp Business Cloud API integration is planned for a future milestone pending official Meta Business Verification and policy approval.',
    architecture:
      'The system uses the same ChannelNormalization and CheckChannelContent service, ensuring zero duplicate logic when WhatsApp is activated.',
  };
}
