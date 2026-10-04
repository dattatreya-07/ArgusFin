import { KnowledgeRequirement, SemanticEvidence, SemanticIntent } from './types';

/**
 * Determines whether authoritative RAG knowledge retrieval is required for an input.
 * CRITICAL RULE: RAG is NOT the scam detector. Behavioral scam messages do NOT require RAG.
 */
export function detectKnowledgeRequirement(
  text: string,
  intent: SemanticIntent = 'CONTENT_ANALYSIS'
): KnowledgeRequirement {
  const normalized = text.toLowerCase();

  // 1. Regulatory source required: queries explicitly asking for SEBI/RBI rules, circulars, or legal bans
  if (
    /\b(what does sebi say|what does rbi say|sebi regulation|rbi circular|buds act|banning of unregulated|sebi rule|rbi rule|section 80c|is it legal under sebi|is it legal under rbi)\b/i.test(
      normalized
    )
  ) {
    return {
      type: 'REGULATORY_SOURCE_REQUIRED',
      topic: 'sebi_rbi_regulation',
      reason: 'User explicitly asks for regulatory provisions, circulars, or statutory rules.',
    };
  }

  // 2. Authoritative source required: registration checks, regulatory standing
  if (
    /\b(is (?:this|the) (?:company|entity|broker|advisor|platform) registered|check sebi registration|verify sebi license|how to check if registered|is .* registered with sebi|rbi registered nbfc list)\b/i.test(
      normalized
    )
  ) {
    return {
      type: 'AUTHORITATIVE_SOURCE_REQUIRED',
      topic: 'entity_registration',
      reason: 'User asks for formal intermediary registration status or regulatory verification procedure.',
    };
  }

  // 3. Authority lookup required: reporting portals, helplines, cybercrime reporting
  if (
    /\b(how to report|where to report|cyber crime helpline|cybercrime portal|scores portal|sachet portal|chakshu facility|national cyber helpline|report number)\b/i.test(
      normalized
    )
  ) {
    return {
      type: 'AUTHORITY_LOOKUP_REQUIRED',
      topic: 'authority_channels',
      reason: 'User explicitly requests statutory reporting portals or official helpline contacts.',
    };
  }

  // 4. Numeric statutory source required: government rates, statutory interest rates, official limits
  if (
    /\b(current repo rate|current ppf interest rate|dicgc insurance limit|deposit insurance limit up to|sukanya samriddhi interest rate|sovereign gold bond issue price)\b/i.test(
      normalized
    )
  ) {
    return {
      type: 'NUMERIC_SOURCE_REQUIRED',
      topic: 'statutory_numeric_rate',
      reason: 'Factual numeric claim requires authoritative statutory provenance.',
    };
  }

  // 5. Educational definition questions where grounded citations enhance quality
  if (
    intent === 'EDUCATIONAL_QA' &&
    /\b(what is (?:a|an)?|explain|definition of|how does (?:a|an)?)\s+(?:mutual fund|ipo|cagr|sip|ponzi scheme|pump and dump|digital arrest|depository|demat|arbitrage|index fund|fixed deposit)/i.test(
      normalized
    )
  ) {
    return {
      type: 'AUTHORITATIVE_SOURCE_REQUIRED',
      topic: 'financial_education_concept',
      reason: 'Educational financial concept where grounded definitions from verified regulatory corpus are beneficial.',
    };
  }

  // 6. DEFAULT: NONE
  // Scam messages, return promises, WhatsApp/Telegram solicitations, payment demands,
  // credential requests, and novel social engineering DO NOT require RAG.
  return {
    type: 'NONE',
    reason: 'Pure behavioral analysis, semantic understanding, or general safety guidance based on observed evidence.',
  };
}
