export interface RecommendationContext {
  completedLessons?: string[];
  latestArchetype?: string;
  currentTrack?: string;
  quizScore?: number;
}

export interface RecommendationItem {
  slug: string;
  title: string;
  reason: string;
  href: string;
  category: 'LESSON' | 'RESILIENCE' | 'SIMULATOR' | 'CREDENTIAL';
}

export interface RecommendationResult {
  nextLesson?: RecommendationItem;
  resilienceLesson?: RecommendationItem;
  simulator?: RecommendationItem;
  credentialEligibility?: {
    eligible: boolean;
    trackId?: string;
    trackTitle?: string;
    claimHref: string;
    reason: string;
  };
}

/**
 * Deterministic, explainable recommendation engine mapping user activity,
 * Shield analysis archetypes, and progress to next learning steps.
 * Zero LLM invocation, zero user profiling.
 */
export function getRecommendations(context: RecommendationContext): RecommendationResult {
  const completed = context.completedLessons || [];
  const archetype = context.latestArchetype || '';
  const track = context.currentTrack || 'financial-foundations';

  let nextLesson: RecommendationItem | undefined;
  let resilienceLesson: RecommendationItem | undefined;
  let simulator: RecommendationItem | undefined;

  // 1. Archetype-driven resilience recommendations (Shield → Learn Loop)
  if (archetype.includes('COPY') || archetype.includes('TRADING') || archetype.includes('FOREX')) {
    resilienceLesson = {
      slug: 'copy-trading',
      title: 'Copy Trading & Unregulated Apps',
      reason: 'Because you recently checked a trading or copy-trading platform',
      href: '/learn/scams/copy-trading',
      category: 'RESILIENCE',
    };
    simulator = {
      slug: 'compound',
      title: 'Compound Interest vs Fake Yield Simulator',
      reason: 'See realistic growth curves versus unsustainable trading promises',
      href: '/learn/simulators/compound',
      category: 'SIMULATOR',
    };
  } else if (archetype.includes('OTP') || archetype.includes('CREDENTIAL') || archetype.includes('IMPERSONATION')) {
    resilienceLesson = {
      slug: 'otp-credential-safety',
      title: 'OTP & Credential Protection',
      reason: 'Because you checked an impersonation or credential access message',
      href: '/learn/lessons/otp-credential-safety',
      category: 'RESILIENCE',
    };
  } else if (archetype.includes('TASK') || archetype.includes('PREPAID') || archetype.includes('JOB')) {
    resilienceLesson = {
      slug: 'task-scams',
      title: 'Prepaid Task & Rating Scams',
      reason: 'Because you checked a task-based or part-time earning offer',
      href: '/learn/scams/task-scams',
      category: 'RESILIENCE',
    };
  } else if (archetype.includes('DOUBLING') || archetype.includes('RETURN') || archetype.includes('HIGH_YIELD')) {
    resilienceLesson = {
      slug: 'cagr',
      title: 'Understanding CAGR & Benchmark Ceilings',
      reason: 'Because you analyzed a high-return investment promise',
      href: '/learn/lessons/cagr',
      category: 'RESILIENCE',
    };
    simulator = {
      slug: 'crash',
      title: 'Ponzi Cashflow & Collapse Simulator',
      reason: 'Simulate why early payouts in doubling schemes inevitably crash',
      href: '/learn/simulator/crash',
      category: 'SIMULATOR',
    };
  } else {
    // Default resilience recommendation
    resilienceLesson = {
      slug: 'spotting-scams-early',
      title: 'Recognising Financial Scam Archetypes',
      reason: 'Essential resilience training for all investors',
      href: '/learn/lessons/spotting-scams-early',
      category: 'RESILIENCE',
    };
    simulator = {
      slug: 'sip',
      title: 'SIP Systematic Growth Simulator',
      reason: 'Calculate disciplined long-term wealth accumulation',
      href: '/learn/simulators/sip',
      category: 'SIMULATOR',
    };
  }

  // 2. Track progression mapping (Learn progression)
  if (!completed.includes('what-is-a-return')) {
    nextLesson = {
      slug: 'what-is-a-return',
      title: 'What is a Return?',
      reason: 'Foundation 1 of Financial Foundations Track',
      href: '/learn/lessons/what-is-a-return',
      category: 'LESSON',
    };
  } else if (!completed.includes('cagr')) {
    nextLesson = {
      slug: 'cagr',
      title: 'CAGR (Compounded Annual Growth Rate)',
      reason: 'Foundation 2 of Financial Foundations Track',
      href: '/learn/lessons/cagr',
      category: 'LESSON',
    };
  } else if (!completed.includes('compounding')) {
    nextLesson = {
      slug: 'compounding',
      title: 'The Magic & Math of Compounding',
      reason: 'Foundation 3 of Financial Foundations Track',
      href: '/learn/lessons/compounding',
      category: 'LESSON',
    };
  } else {
    nextLesson = {
      slug: 'risk-vs-return',
      title: 'Risk vs Return Spectrum',
      reason: 'Next recommended lesson in Investing Basics',
      href: '/learn/lessons/risk-vs-return',
      category: 'LESSON',
    };
  }

  // 3. Credential eligibility check
  const hasCompletedFoundations =
    completed.includes('what-is-a-return') &&
    completed.includes('cagr') &&
    completed.includes('compounding');

  const credentialEligibility = {
    eligible: hasCompletedFoundations,
    trackId: 'investor-resilience-foundations',
    trackTitle: 'Investor Resilience Foundations',
    claimHref: '/prove/credentials',
    reason: hasCompletedFoundations
      ? 'You have completed all core foundation modules! Eligible to claim Soulbound Credential on Polygon Amoy.'
      : 'Complete Financial Foundations track to unlock your verifiable Soulbound Credential.',
  };

  return {
    nextLesson,
    resilienceLesson,
    simulator,
    credentialEligibility,
  };
}
