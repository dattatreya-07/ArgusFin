'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Lang } from '@/lib/types';
import { VoiceInput } from '@/components/VoiceInput';
import { validateIncidentConsistency } from '@/lib/incident/consistency';
import { routeAuthorities } from '@/lib/authorities/router';
import { createCanonicalReportPacket } from '@/lib/report/packet';
import { exportToHtml, exportToPlainText, exportToJson } from '@/lib/report/export';
import { CanonicalReportPacket } from '@/lib/report/types';
import { ConsistencyIssue } from '@/lib/incident/types';
import { maskPii } from '@/lib/privacy';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Field,
  Stepper,
  Banner,
} from '@/components/ui';

export default function ReportPage() {
  const t = useTranslations('report');
  const params = useParams();
  const currentLang = (params?.locale as Lang) || 'en';

  const [step, setStep] = useState<number>(1);
  const [incidentDate, setIncidentDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [platform, setPlatform] = useState<string>('WhatsApp / Telegram');
  const [category, setCategory] = useState<string>('PROMISED_RETURN');
  const [entityName, setEntityName] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [amount, setAmount] = useState<number>(25000);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [beneficiaryInfo, setBeneficiaryInfo] = useState<string>('');
  const [narrative, setNarrative] = useState<string>('');

  // Security / Exposure flags
  const [credentialsShared, setCredentialsShared] = useState<boolean>(false);
  const [otpShared, setOtpShared] = useState<boolean>(false);
  const [remoteAccessGranted, setRemoteAccessGranted] = useState<boolean>(false);

  const [issues, setIssues] = useState<ConsistencyIssue[]>([]);
  const [packet, setPacket] = useState<CanonicalReportPacket | null>(null);

  // Re-generate canonical report packet whenever inputs change
  useEffect(() => {
    const consistencyRes = validateIncidentConsistency({
      language: currentLang,
      when: incidentDate,
      platform,
      category,
      entityName,
      domain,
      amount,
      paymentMethod,
      transactions: utrNumber
        ? [
            {
              utrNumber,
              amount,
              beneficiaryAccountOrUpi: beneficiaryInfo,
              paymentMethod,
              date: incidentDate,
            },
          ]
        : [],
      whatHappened: narrative,
      credentialsShared,
      otpShared,
      remoteAccessGranted,
    });

    setIssues(consistencyRes.issues);

    const newPacket = createCanonicalReportPacket({
      locale: currentLang,
      jurisdiction: 'IN',
      sourceChannel: 'website',
      rawUserInput: narrative,
      incidentDate,
      platform,
      claimedEntityOrAdvisor: entityName,
      websiteOrDomain: domain,
      totalClaimedLoss: amount,
      transactions: utrNumber
        ? [
            {
              utrNumber,
              amount,
              beneficiaryAccountOrUpi: beneficiaryInfo,
              paymentMethod,
              date: incidentDate,
            },
          ]
        : [],
      narrative,
      credentialsShared,
      otpShared,
      remoteAccessGranted,
    });

    setPacket(newPacket);
  }, [
    incidentDate,
    platform,
    category,
    entityName,
    domain,
    amount,
    paymentMethod,
    utrNumber,
    beneficiaryInfo,
    narrative,
    credentialsShared,
    otpShared,
    remoteAccessGranted,
    currentLang,
  ]);

  const handleNextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrint = () => {
    if (packet) {
      const htmlStr = exportToHtml(packet);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(htmlStr);
        win.document.close();
        win.focus();
        win.print();
      } else {
        window.print();
      }
    }
  };

  const handleExportText = () => {
    if (!packet) return;
    const txt = exportToPlainText(packet);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sangyan-report-${packet.exportIntegrityHash.substring(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (!packet) return;
    const jsonStr = exportToJson(packet);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sangyan-report-${packet.exportIntegrityHash.substring(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maskedNarrative = maskPii(narrative || 'No additional narrative text provided.');
  const maskedUtr = utrNumber ? maskPii(utrNumber) : '';

  const STEP_TITLES = [
    'When & Platform',
    'Entity & Domain',
    'Payment & Money',
    'Security Check',
    'Review & Official Filing',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header (hidden in print) */}
      <div className="space-y-2 print:hidden">
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">
          {t('title')}
        </h1>
        <p className="text-base text-ink-muted">
          Organize your incident record step-by-step to prepare an accurate report for official portals (1930 / cybercrime.gov.in / scores.gov.in).
        </p>
      </div>

      {/* Stepper Progress Bar (hidden in print) */}
      <div className="print:hidden">
        <Stepper
          currentStep={step}
          totalSteps={5}
          label={STEP_TITLES[step - 1]}
        />
      </div>

      {/* Step 1: When & Platform */}
      {step === 1 && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>{t('step1Title')}</CardTitle>
            <CardDescription>Specify the approximate time and where you were contacted.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="incident-date" className="text-xs font-semibold text-ink">{t('dateLabel')}</label>
              <input
                id="incident-date"
                type="datetime-local"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm text-ink"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="platform-select" className="text-xs font-semibold text-ink">{t('platformLabel')}</label>
              <select
                id="platform-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm text-ink"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telegram">Telegram</option>
                <option value="Instagram / Facebook">Instagram / Facebook</option>
                <option value="Phone Call / SMS">Phone Call / SMS</option>
                <option value="Fake Trading Website / Portal">Fake Trading Website / Portal</option>
                <option value="Dating App / Matrimonial">Dating App / Matrimonial</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="category-select" className="text-xs font-semibold text-ink">Incident Category</label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm text-ink"
              >
                <option value="PROMISED_RETURN">Promised High Return / Investment Scheme</option>
                <option value="TRADING_PLATFORM">Fake Trading App / Blocked Withdrawal</option>
                <option value="IPO_ALLOTMENT">FII / Institutional IPO Allotment Claim</option>
                <option value="IMPERSONATION">Impersonation of Regulated Broker / Official</option>
                <option value="TASK_SCAM">Prepaid Task / YouTube Like / Part-Time Job</option>
                <option value="CRYPTO_STAKING">Crypto Staking / Forex Doubling</option>
                <option value="OTHER">Other Financial Fraud</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="primary"
              size="lg"
              onClick={handleNextStep}
              className="w-full"
            >
              Next: Entity &amp; Details →
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Entity & Domain */}
      {step === 2 && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>{t('step2Title')}</CardTitle>
            <CardDescription>Record what name, company, or link was provided to you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              label="Claimed Advisor Name, Group Title, or Organisation"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="e.g. VIP Institutional Wealth Club, Prof. Sharma Trading Academy"
              hint="The display name used in messages"
            />

            <Field
              label="Website Domain or Portal Link (if any)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. groww-institutional-vip.top, secure-trade-login.xyz"
              hint="Write the domain if provided; do not visit unknown links"
            />
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="secondary" size="md" onClick={() => setStep(1)} className="w-1/3">
              ← Back
            </Button>
            <Button variant="primary" size="lg" onClick={handleNextStep} className="w-2/3">
              Next: Payment Details →
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Financial & Transactions */}
      {step === 3 && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>{t('step3Title')}</CardTitle>
            <CardDescription>Record the amount transferred and transaction references.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              label={t('amountLabel')}
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="25000"
              hint="Total cumulative amount paid"
            />

            <div className="space-y-1.5">
              <label htmlFor="payment-method-select" className="text-xs font-semibold text-ink">Payment Method Used</label>
              <select
                id="payment-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm text-ink"
              >
                <option value="UPI">UPI (Google Pay, PhonePe, Paytm, BHIM)</option>
                <option value="IMPS_NEFT">Bank IMPS / NEFT / RTGS Transfer</option>
                <option value="CREDIT_CARD">Credit / Debit Card</option>
                <option value="CRYPTO">Cryptocurrency / USDT</option>
                <option value="NO_MONEY_SENT">No money sent (Offer inquiry only)</option>
              </select>
            </div>

            <Field
              label="Transaction ID / UPI Reference / UTR Number"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="e.g. 329849201948 (12-digit UTR from bank SMS)"
              hint="Essential for bank transaction lien requests under 1930"
            />

            <Field
              label="Beneficiary UPI ID or Account Name Given"
              value={beneficiaryInfo}
              onChange={(e) => setBeneficiaryInfo(e.target.value)}
              placeholder="e.g. merchant.pay@okaxis or John Doe"
              hint="The account handle money was transferred to"
            />
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="secondary" size="md" onClick={() => setStep(2)} className="w-1/3">
              ← Back
            </Button>
            <Button variant="primary" size="lg" onClick={handleNextStep} className="w-2/3">
              Next: Security Check →
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: Security & Narrative */}
      {step === 4 && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>4. Security Check &amp; What Happened</CardTitle>
            <CardDescription>Tell us what occurred in your own words.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-surface-sunken border border-border rounded-md space-y-3">
              <span className="text-xs font-bold text-ink uppercase tracking-wider block">
                Immediate Exposure Checklist:
              </span>
              <label className="flex items-center gap-3 text-xs text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={credentialsShared}
                  onChange={(e) => setCredentialsShared(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent w-4 h-4"
                />
                <span>I shared netbanking / broker login passwords</span>
              </label>
              <label className="flex items-center gap-3 text-xs text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={otpShared}
                  onChange={(e) => setOtpShared(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent w-4 h-4"
                />
                <span>I shared SMS OTPs or verification codes</span>
              </label>
              <label className="flex items-center gap-3 text-xs text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={remoteAccessGranted}
                  onChange={(e) => setRemoteAccessGranted(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent w-4 h-4"
                />
                <span>I installed AnyDesk, TeamViewer, RustDesk or an unverified app</span>
              </label>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="narrative-textarea" className="text-xs font-semibold text-ink">{t('narrativeLabel')}</label>
                <VoiceInput
                  onTranscript={(txt) => setNarrative(`${narrative} ${txt}`.trim())}
                  lang={currentLang}
                />
              </div>
              <textarea
                id="narrative-textarea"
                rows={4}
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="Briefly describe what they promised, how they communicated, and why withdrawal was blocked..."
                className="w-full px-3.5 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm text-ink leading-relaxed"
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="secondary" size="md" onClick={() => setStep(3)} className="w-1/3">
              ← Back
            </Button>
            <Button variant="primary" size="lg" onClick={handleNextStep} className="w-2/3">
              Review Final Record →
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 5: Review & Export */}
      {step === 5 && packet && (
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle>5. Incident Pre-Filing Review Packet</CardTitle>
                  <CardDescription>
                    Review your prepared incident packet before lodging on official portal.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 print:hidden">
                  <Button variant="secondary" size="sm" onClick={handleExportText}>
                    📄 Export Text
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleExportJson}>
                    {'{ }'} Export JSON
                  </Button>
                  <Button variant="primary" size="sm" onClick={handlePrint}>
                    🖨️ Print / HTML
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Mandatory Notice */}
              <Banner
                variant="warning"
                title="PREPARED FOR YOUR REVIEW — NOT AUTOMATICALLY SUBMITTED"
                description="SANGYAN does not submit complaints to law enforcement or regulators. Review this record, copy or export it, and lodge it through official portals."
              />

              {/* Exposure Alerts if any */}
              {(credentialsShared || otpShared || remoteAccessGranted) && (
                <Banner
                  variant="warning"
                  title="Immediate Exposure Notice"
                  description="Credentials, OTPs, or remote access software were shared. Contact your bank immediately to freeze your account and uninstall remote access software."
                />
              )}

              {/* 1. Incident Summary & Observed Facts */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wide border-b border-border pb-1">
                  1. Incident Summary &amp; Observed Facts
                </h3>
                <ul className="list-disc pl-5 text-xs text-ink space-y-1">
                  {packet.observedFacts.map((fact, idx) => (
                    <li key={idx}>{fact}</li>
                  ))}
                </ul>
              </div>

              {/* 2. Sender Claims & Requests */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wide border-b border-border pb-1">
                  2. Sender Claims &amp; Demands
                </h3>
                <p className="text-xs font-semibold text-ink-muted">Observed Claims:</p>
                <ul className="list-disc pl-5 text-xs text-ink space-y-1">
                  {packet.observedClaims.map((claim, idx) => (
                    <li key={idx}>{claim}</li>
                  ))}
                </ul>
                <p className="text-xs font-semibold text-ink-muted pt-1">Observed Requests:</p>
                <ul className="list-disc pl-5 text-xs text-ink space-y-1">
                  {packet.observedRequests.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* 3. URLs & Payment Details */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wide border-b border-border pb-1">
                  3. Observed URLs &amp; Payment Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-surface-sunken rounded border border-border">
                    <span className="font-bold block mb-1">URLs / Domains:</span>
                    {packet.urls.length > 0 ? (
                      packet.urls.map((u, i) => (
                        <div key={i} className="text-ink font-mono text-[11px]">{u.fullUrl}</div>
                      ))
                    ) : (
                      <span className="text-ink-muted">None specified</span>
                    )}
                  </div>
                  <div className="p-3 bg-surface-sunken rounded border border-border">
                    <span className="font-bold block mb-1">Payment Transactions:</span>
                    {packet.paymentDetails.length > 0 ? (
                      packet.paymentDetails.map((p, i) => (
                        <div key={i} className="text-ink">
                          ₹{p.amount || 0} ({p.paymentMethod}) {p.utrNumber ? `UTR: ${p.utrNumber}` : ''}
                        </div>
                      ))
                    ) : (
                      <span className="text-ink-muted">No money sent</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. SANGYAN Observed Risk Signals */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wide border-b border-border pb-1">
                  4. SANGYAN Risk Analysis
                </h3>
                <div className="p-3 bg-surface-sunken rounded border border-border text-xs space-y-1">
                  <p><strong>Risk Indicator:</strong> <span className="text-accent font-bold">{packet.sangyanAnalysis.riskBand}</span> (Confidence: {Math.round(packet.sangyanAnalysis.confidence * 100)}%)</p>
                  <p><strong>Explanation:</strong> {packet.sangyanAnalysis.riskExplanation}</p>
                </div>
              </div>

              {/* 5. User Statement & Unverified Claims */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wide border-b border-border pb-1">
                  5. User Statement &amp; Unverified Claims
                </h3>
                <p className="text-xs font-semibold text-ink-muted">User Statement:</p>
                <div className="p-3 bg-surface-sunken rounded border border-border text-xs text-ink whitespace-pre-line">
                  {maskedNarrative}
                </div>
                <p className="text-xs font-semibold text-ink-muted pt-1">Unverified Claims &amp; Uncertainty Notes:</p>
                <ul className="list-disc pl-5 text-xs text-ink space-y-1">
                  {packet.unverifiedClaims.concat(packet.uncertainty).map((unv, idx) => (
                    <li key={idx}>{unv}</li>
                  ))}
                </ul>
              </div>

              {/* 6. Suggested Statutory Authorities & Channels */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wide border-b border-border pb-1">
                  6. Suggested Statutory Authorities &amp; Official Portals
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packet.authorityRoutes.routes.map((auth, idx) => (
                    <div key={idx} className="p-3.5 bg-surface rounded-md border border-border space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-ink text-sm">{auth.name}</p>
                        <span className="text-[10px] px-2 py-0.5 bg-surface-sunken border border-border rounded font-mono">
                          {auth.jurisdiction}
                        </span>
                      </div>
                      <p className="text-ink-muted"><strong>Scope:</strong> {auth.scope}</p>
                      <p className="text-ink"><strong>Reason:</strong> {auth.reason}</p>
                      <p className="text-ink font-semibold"><strong>Guidance:</strong> {auth.actionGuidance}</p>
                      {auth.source_url ? (
                        <p className="pt-1">
                          <a
                            href={auth.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent underline font-semibold"
                          >
                            Lodge Complaint on Official Portal ({auth.source_url}) →
                          </a>
                        </p>
                      ) : (
                        <p className="text-ink-muted italic pt-1">
                          I can&apos;t verify this authority contact from the available source material.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrity Verification Hash */}
              <div className="p-3 bg-surface-sunken rounded border border-border text-[11px] font-mono text-ink-muted">
                Integrity Hash: {packet.exportIntegrityHash}
              </div>
            </CardContent>

            <CardFooter className="bg-surface-sunken border-t border-border flex justify-between print:hidden">
              <Button variant="secondary" size="md" onClick={() => setStep(4)}>
                ← Edit Details
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" size="md" onClick={handleExportText}>
                  📄 Text
                </Button>
                <Button variant="primary" size="md" onClick={handlePrint}>
                  🖨️ Export Printable Report
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

