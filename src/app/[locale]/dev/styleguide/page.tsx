import React from 'react';
import { notFound } from 'next/navigation';
import {
  Button,
  IconButton,
  Chip,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Field,
  Textarea,
  Banner,
  Stepper,
  BandBadge,
  SourceChip,
  SectionHeading,
  SkeletonBlock,
  LanguageSwitcher,
} from '@/components/ui';
import {
  IconMic,
  IconSpeaker,
  IconPaste,
  IconCalculator,
  IconBook,
  IconFlag,
  IconAlertTriangle,
} from '@/components/icons';

export const metadata = {
  title: 'Design System Style Guide (Dev Only)',
};

export default function StyleGuidePage() {
  // Hide in production if NODE_ENV is production and not explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEV_STYLEGUIDE !== 'true') {
    notFound();
  }

  return (
    <main className="min-h-screen bg-canvas text-ink py-12 px-4 sm:px-6 lg:px-8 max-w-[1120px] mx-auto space-y-12">
      <header className="border-b border-border pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-accent">
          Internal Dev Only
        </span>
        <h1 className="text-3xl font-extrabold text-ink mt-1">Design System Style Guide</h1>
        <p className="text-ink-muted mt-2">
          Living specification of tokens, primitives, risk badges, accessibility states, and Indic glyph rendering.
        </p>
      </header>

      {/* 1. Typography & Indic Matras Test */}
      <section className="space-y-6">
        <SectionHeading
          badge="Type Rules"
          title="Typography & Indic Script Rendering"
          subtitle="Verifying that Hindi matras (ी, ू, ै, ौ) and Tamil ascenders/descenders (க், டி, ளு) are not clipped by line-height."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>English (Latin 800)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <h2 className="text-2xl font-extrabold text-ink leading-tight">
                Check before you pay. Real returns.
              </h2>
              <p className="text-base text-ink-muted">
                Body text 18px / 1.6 line height. Clear contrast for Tier-2/3 first-time investors.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>हिन्दी (Devanagari 700)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <h2 className="text-2xl font-bold text-ink leading-indic">
                पैसे देने से पहले जाँचें। सच्चाई जानें।
              </h2>
              <p className="text-base text-ink-muted leading-relaxed">
                ऊँचे मुनाफ़े के दावों से सावधान रहें। कोई भी निवेश सुरक्षित और गारंटीकृत नहीं होता।
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>தமிழ் (Tamil 700)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <h2 className="text-2xl font-bold text-ink leading-indic">
                பணம் செலுத்தும் முன் சரிபார்க்கவும்.
              </h2>
              <p className="text-base text-ink-muted leading-relaxed">
                அதிக லாபம் தருவதாகக் கூறும் போலியான முதலீட்டு வாக்குறுதிகளை நம்பாதீர்கள்.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. BandBadges (The 4 Risk States - ZERO GREEN) */}
      <section className="space-y-6">
        <SectionHeading
          badge="Risk Bands"
          title="Decision Risk States (Zero Green Guarantee)"
          subtitle="All four states use icon + label + distinct accessible background/text contrast pairs."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <span className="text-xs font-semibold text-ink-muted">HIGH Risk</span>
            </CardHeader>
            <CardContent className="space-y-3">
              <BandBadge band="HIGH" size="lg" />
              <p className="text-xs text-ink-muted">
                Unrealistic promised multiple (&gt;100x/yr) or known advance-fee pattern.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="text-xs font-semibold text-ink-muted">MEDIUM Risk</span>
            </CardHeader>
            <CardContent className="space-y-3">
              <BandBadge band="MEDIUM" size="lg" />
              <p className="text-xs text-ink-muted">
                Exceeds normal market yields (15–100% annualised) or contains urgency triggers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="text-xs font-semibold text-ink-muted">LOW_SIGNALS (Neutral)</span>
            </CardHeader>
            <CardContent className="space-y-3">
              <BandBadge band="LOW_SIGNALS" size="lg" />
              <p className="text-xs text-ink-muted">
                No red flags found (never labeled &quot;safe&quot; or green; not a guarantee).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="text-xs font-semibold text-ink-muted">CANNOT_VERIFY</span>
            </CardHeader>
            <CardContent className="space-y-3">
              <BandBadge band="CANNOT_VERIFY" size="lg" />
              <p className="text-xs text-ink-muted">
                Weak context or ungrounded entity. First-class state, not a 500 error.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Buttons & IconButtons (48px Touch Targets) */}
      <section className="space-y-6">
        <SectionHeading
          badge="Interactive Elements"
          title="Buttons, Inputs & Touch Targets"
          subtitle="Minimum 48x48 px interactive hit targets for reliable touch on low-end smartphones."
        />

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" size="lg" icon={<IconPaste />}>
                Check a message (Primary Large)
              </Button>
              <Button variant="secondary" size="md" icon={<IconCalculator />}>
                Compare Returns (Secondary)
              </Button>
              <Button variant="quiet" size="md">
                Quiet / Ghost Action
              </Button>
              <Button variant="primary" loading>
                Analyzing...
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-muted font-medium">Mic Button:</span>
                <IconButton
                  ariaLabel="Start speaking"
                  icon={<IconMic />}
                />
                <IconButton
                  ariaLabel="Recording audio"
                  active
                  icon={<IconMic />}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-muted font-medium">Speaker Button:</span>
                <IconButton
                  ariaLabel="Listen to summary"
                  icon={<IconSpeaker />}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-muted font-medium">Chips:</span>
                <Chip icon={<IconFlag />}>Hindi · Tamil · English</Chip>
                <Chip>Works on slow data</Chip>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. Language Switcher (Visible Native Script) */}
      <section className="space-y-6">
        <SectionHeading
          badge="Localization"
          title="Language Switcher"
          subtitle="Three visible native-script chips, never hidden inside dropdown menus."
        />
        <div className="p-4 bg-surface rounded-lg border border-border inline-block">
          <LanguageSwitcher />
        </div>
      </section>

      {/* 5. Banners & Steppers */}
      <section className="space-y-6">
        <SectionHeading
          badge="Flow & Feedback"
          title="Banners, Steppers & Source Citations"
          subtitle="Accessible notifications, flow progress, and verified RAG citations."
        />

        <div className="space-y-4">
          <Banner
            variant="limited"
            title="Limited Mode Active"
            description="Offline or reduced connectivity. Deterministic rule checks only."
          />
          <Banner
            variant="info"
            title="Privacy First"
            description="All phone numbers, UPI IDs, and bank account numbers are masked in your browser before analysis."
          />

          <Card>
            <CardContent className="pt-6 space-y-4">
              <span className="text-xs font-semibold text-ink-muted">Guided Stepper Progress:</span>
              <Stepper currentStep={3} totalSteps={8} label="Incident Details" />
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <SourceChip
              title="RBI Master Direction on Digital Lending"
              publisher="Reserve Bank of India"
              date="2022-09-02"
              href="https://rbi.org.in"
            />
            <SourceChip
              title="Advisory on Unregistered Stock Advisory Groups"
              publisher="SEBI"
              date="2023-05-18"
            />
          </div>
        </div>
      </section>

      {/* 6. Form Fields & Textarea */}
      <section className="space-y-6">
        <SectionHeading
          badge="Form Elements"
          title="Fields & Character Counters"
        />

        <Card>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field
              label="Invested Amount (₹)"
              placeholder="e.g. 10000"
              hint="Enter the initial principal offered"
            />
            <Field
              label="Promised Payout (₹)"
              placeholder="e.g. 20000"
              hint="Enter the total promised return"
            />
            <div className="md:col-span-2">
              <Textarea
                label="Paste WhatsApp / Telegram Message"
                placeholder="Paste the suspicious message here..."
                maxLength={1000}
                characterCount={142}
                hint="Personal information will be masked before analysis."
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 7. Skeleton / Loading States */}
      <section className="space-y-6">
        <SectionHeading
          badge="Loading"
          title="Calm Skeleton Blocks"
          subtitle="Non-flashing, gentle placeholders that prevent CLS during async operations."
        />

        <Card>
          <CardContent className="pt-6 space-y-3">
            <SkeletonBlock height="h-6" width="w-1/3" />
            <SkeletonBlock height="h-4" width="w-full" />
            <SkeletonBlock height="h-4" width="w-4/5" />
            <div className="pt-2 flex gap-3">
              <SkeletonBlock height="h-10" width="w-32" rounded="pill" />
              <SkeletonBlock height="h-10" width="w-32" rounded="pill" />
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
