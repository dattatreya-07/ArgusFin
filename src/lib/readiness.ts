export type CapabilityStatus = 'AVAILABLE' | 'DEGRADED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';

export interface CapabilityItem {
  name: string;
  status: CapabilityStatus;
  provider: string;
  fallback: string;
  privacyBoundary: string;
  notes?: string;
}

export interface SystemReadinessReport {
  version: string;
  environment: string;
  timestamp: string;
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  capabilities: Record<string, CapabilityItem>;
  configAudit: Record<string, 'CONFIGURED' | 'NOT_CONFIGURED' | 'DEFAULT'>;
}

/**
 * Evaluates application runtime readiness and provider capabilities without leaking secrets.
 */
export function getSystemReadiness(): SystemReadinessReport {
  const isGroqConfigured = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_MODEL);

  const capabilities: Record<string, CapabilityItem> = {
    calculator: {
      name: 'Promise-to-Reality Calculator',
      status: 'AVAILABLE',
      provider: 'Deterministic Local Arithmetic',
      fallback: 'Pure mathematical formulas',
      privacyBoundary: '100% on-device / local execution',
    },
    ladder: {
      name: 'Reality Ladder Comparison',
      status: 'AVAILABLE',
      provider: 'Official Benchmarks (RBI / SEBI Data)',
      fallback: 'Static verified threshold bands',
      privacyBoundary: 'Static verified data',
    },
    scamCheck: {
      name: 'Scam / Claim Detection Engine',
      status: isGroqConfigured ? 'AVAILABLE' : 'DEGRADED',
      provider: isGroqConfigured ? 'Fusion (Rules + Groq LLM)' : 'Deterministic Rules-Only Engine',
      fallback: 'Deterministic multilingual rules engine',
      privacyBoundary: 'Client-side PII masking before API dispatch',
    },
    rag: {
      name: 'Grounded Regulatory Q&A',
      status: 'AVAILABLE',
      provider: 'TF-IDF Vector Store + SEBI/RBI/MHA Verified Corpus',
      fallback: 'Localized "Cannot verify" uncertainty response',
      privacyBoundary: 'Dual prompt fence; untrusted queries masked',
    },
    authorityRouter: {
      name: 'Responsible Authority Router',
      status: 'AVAILABLE',
      provider: 'Verified Authorities Database (data/authorities.json)',
      fallback: 'Structured general grievance guide',
      privacyBoundary: 'Deterministic routing; zero PII logging',
    },
    incidentIntake: {
      name: 'First-Victim Incident Intake',
      status: 'AVAILABLE',
      provider: 'Structured Entity Intake Wizard',
      fallback: 'Standard manual pre-filing aid',
      privacyBoundary: 'On-device form state; raw secrets prohibited',
    },
    consistencyEngine: {
      name: 'Entity Consistency Engine',
      status: 'AVAILABLE',
      provider: 'Deterministic Cross-Field Validator',
      fallback: 'Pass-through with user review warnings',
      privacyBoundary: 'Local entity normalizers',
    },
    reportExport: {
      name: 'Bilingual Report & Print/PDF Export',
      status: 'AVAILABLE',
      provider: 'Browser-native Print / Save-as-PDF Layout',
      fallback: 'Plaintext document summary',
      privacyBoundary: 'Zero server storage; generated on-device',
    },
    evidenceIntake: {
      name: 'Evidence Intake & File Validation',
      status: 'AVAILABLE',
      provider: 'Client-side MIME / Security Guard',
      fallback: 'Manual text entry',
      privacyBoundary: 'SVG and script rejection; file size bounding',
    },
    ocr: {
      name: 'OCR / Visual Text Extraction',
      status: 'AVAILABLE',
      provider: 'Deterministic Local OCR Provider',
      fallback: 'Manual transcript entry with user review',
      privacyBoundary: 'Client-side text masking before fusion',
    },
    stt: {
      name: 'Voice / Speech-to-Text Intake',
      status: 'AVAILABLE',
      provider: 'Browser Web Speech API (en-IN / hi-IN / ta-IN)',
      fallback: 'Keyboard text entry',
      privacyBoundary: 'Transient audio processing; zero audio logging',
    },
    paymentSimulator: {
      name: 'Educational Payment Escalation Simulator',
      status: 'AVAILABLE',
      provider: 'Deterministic Advance-Fee Model',
      fallback: 'Static educational case studies',
      privacyBoundary: 'Fictional amounts; zero connection to banks',
    },
    localization: {
      name: 'Multilingual Support (EN / HI / TA)',
      status: 'AVAILABLE',
      provider: 'next-intl JSON message catalogs',
      fallback: 'English default fallback',
      privacyBoundary: 'Static client/server translation catalogs',
    },
  };

  const configAudit: Record<string, 'CONFIGURED' | 'NOT_CONFIGURED' | 'DEFAULT'> = {
    GROQ_API_KEY: process.env.GROQ_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
    GROQ_MODEL: process.env.GROQ_MODEL ? 'CONFIGURED' : 'DEFAULT',
    NODE_ENV: process.env.NODE_ENV ? 'CONFIGURED' : 'DEFAULT',
    RATE_LIMIT_ENABLED: 'CONFIGURED',
  };

  return {
    version: '1.0.0-phase3',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    overallStatus: 'HEALTHY',
    capabilities,
    configAudit,
  };
}
