'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Lang } from '@/lib/types';
import { VoiceInput } from '@/components/VoiceInput';
import { validateIncidentConsistency } from '@/lib/report/consistency';

export default function ReportPage() {
  const t = useTranslations('report');
  const params = useParams();
  const currentLang = (params?.locale as Lang) || 'en';

  const [step, setStep] = useState<number>(1);
  const [incidentDate, setIncidentDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [platform, setPlatform] = useState<string>('WhatsApp / Telegram');
  const [entityName, setEntityName] = useState<string>('');
  const [amount, setAmount] = useState<number>(25000);
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [beneficiaryInfo, setBeneficiaryInfo] = useState<string>('');
  const [narrative, setNarrative] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isDrafting, setIsDrafting] = useState<boolean>(false);

  const handleNextStep = () => {
    const consistency = validateIncidentConsistency({
      incidentDate,
      platform,
      entityName,
      totalAmount: amount,
      transactions: utrNumber ? [{ utrNumber, amount, beneficiaryAccountOrUpi: beneficiaryInfo }] : [],
      narrative: narrative || 'Initial consultation with suspect entity.',
    });

    setWarnings(consistency.warnings);
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header (hidden in print) */}
      <div className="space-y-2 text-center md:text-left print:hidden">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span className="p-2 bg-rose-950 border border-rose-800 text-rose-400 rounded-xl text-xl">
            📋
          </span>
          {t('title')}
        </h1>
        <p className="text-zinc-400 text-base max-w-2xl">{t('subtitle')}</p>
      </div>

      {/* Progress Steps (hidden in print) */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-4 print:hidden">
        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center ${
              step === s
                ? 'bg-rose-950 border border-rose-700 text-rose-300'
                : step > s
                ? 'bg-zinc-900 border border-zinc-800 text-emerald-400'
                : 'bg-zinc-950 text-zinc-600'
            }`}
          >
            Step {s}
          </button>
        ))}
      </div>

      {/* Step 1: When & Platform */}
      {step === 1 && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 print:hidden">
          <h2 className="text-lg font-bold text-white">{t('step1Title')}</h2>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">{t('dateLabel')}</label>
            <input
              type="datetime-local"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">{t('platformLabel')}</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="WhatsApp">WhatsApp</option>
              <option value="Telegram">Telegram</option>
              <option value="Instagram / Facebook">Instagram / Facebook</option>
              <option value="Phone Call / SMS">Phone Call / SMS</option>
              <option value="Fake Trading Website / Portal">Fake Trading Website / Portal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            className="w-full py-3 rounded-xl font-bold text-sm bg-rose-600 text-white hover:bg-rose-500 transition-all cursor-pointer shadow-lg"
          >
            Next: Platform & Entity →
          </button>
        </div>
      )}

      {/* Step 2: Entity Name */}
      {step === 2 && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 print:hidden">
          <h2 className="text-lg font-bold text-white">{t('step2Title')}</h2>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">
              Claimed Advisor Name, Group Name, or Website URL
            </label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="e.g. VIP Institutional Stock Club, fake-groww-app.xyz"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 py-3 rounded-xl font-semibold text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="w-2/3 py-3 rounded-xl font-bold text-sm bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-lg"
            >
              Next: Financial Details →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Payment & Transaction */}
      {step === 3 && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 print:hidden">
          <h2 className="text-lg font-bold text-white">{t('step3Title')}</h2>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">{t('amountLabel')}</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">
              UPI Reference / UTR Number (12 Digits)
            </label>
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="e.g. 423912093481"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">
              Beneficiary Phone / Account / UPI ID
            </label>
            <input
              type="text"
              value={beneficiaryInfo}
              onChange={(e) => setBeneficiaryInfo(e.target.value)}
              placeholder="e.g. receiver@okaxis or 98765XXXXX"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">{t('narrativeLabel')}</label>
              <VoiceInput onTranscript={(txt) => setNarrative((prev) => `${prev} ${txt}`)} lang={currentLang} />
            </div>
            <textarea
              rows={4}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="Describe how the contact initiated, promises made, and when withdrawals were denied..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-1/3 py-3 rounded-xl font-semibold text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="w-2/3 py-3 rounded-xl font-bold text-sm bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-lg"
            >
              Review & Prepare Document →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Final Review & Printable Incident Record */}
      {step === 4 && (
        <div className="space-y-6">
          {warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs space-y-1 print:hidden">
              <span className="font-bold">⚠️ Data Consistency Notices:</span>
              <ul className="list-disc list-inside">
                {warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons (hidden when printing) */}
          <div className="flex justify-between items-center print:hidden">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all"
            >
              ← Edit Details
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg cursor-pointer flex items-center gap-2"
            >
              🖨️ {t('exportPdfBtn')}
            </button>
          </div>

          {/* Printable Document Card */}
          <div className="bg-white text-zinc-900 rounded-2xl p-8 shadow-2xl space-y-6 border border-zinc-300 print:border-none print:shadow-none print:p-0">
            {/* Doc Header */}
            <div className="border-b border-zinc-300 pb-4 space-y-1">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
                  CONFIDENTIAL PRE-FILING INCIDENT RECORD
                </span>
                <span className="text-[11px] text-zinc-500">
                  Date: {new Date().toLocaleDateString('en-IN')}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-zinc-900">
                CITIZEN FINANCIAL FRAUD INCIDENT SUMMARY
              </h2>
              <p className="text-xs text-zinc-600">
                For filing formal complaint on National Cyber Crime Portal (cybercrime.gov.in) & 1930 Helpline
              </p>
            </div>

            {/* Structured Table */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="font-semibold text-zinc-500 block">Incident Date & Time:</span>
                <span className="font-bold text-zinc-900">{incidentDate}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="font-semibold text-zinc-500 block">Platform / Medium:</span>
                <span className="font-bold text-zinc-900">{platform}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="font-semibold text-zinc-500 block">Claimed Entity / Account:</span>
                <span className="font-bold text-zinc-900">{entityName || 'Unspecified'}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="font-semibold text-zinc-500 block">Total Claimed Amount:</span>
                <span className="font-bold text-rose-700 text-sm">
                  ₹{amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Transaction Data */}
            {utrNumber && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Transaction Identifiers (Masked for Safety)
                </h3>
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs space-y-1 font-mono">
                  <div>UTR / Reference: {utrNumber}</div>
                  <div>Beneficiary / Account: {beneficiaryInfo || 'Provided to bank'}</div>
                </div>
              </div>
            )}

            {/* Narrative */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Summary of Incident (Citizen Statement)
              </h3>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-800 leading-relaxed whitespace-pre-line">
                {narrative || 'No additional narrative text provided.'}
              </div>
            </div>

            {/* Golden Hour Directives */}
            <div className="border-t border-zinc-300 pt-4 text-xs text-zinc-700 space-y-1">
              <span className="font-bold text-rose-700">Immediate Action Directives:</span>
              <p>1. Call 1930 immediately to freeze transactions in beneficiary accounts.</p>
              <p>2. File formal cyber incident report at cybercrime.gov.in attaching transaction slips.</p>
              <p>3. Report telecom communication to DoT Chakshu at sancharsaathi.gov.in.</p>
            </div>

            {/* Legal Disclaimer */}
            <p className="text-[10px] text-zinc-500 italic border-t border-zinc-200 pt-2">
              {t('disclaimerNotice')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
