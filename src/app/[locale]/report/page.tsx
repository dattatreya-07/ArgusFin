'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Lang } from '@/lib/types';
import { VoiceInput } from '@/components/VoiceInput';
import { validateIncidentConsistency } from '@/lib/incident/consistency';
import { routeAuthorities } from '@/lib/authorities/router';
import { ConsistencyIssue } from '@/lib/incident/types';
import { maskPii } from '@/lib/privacy';

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

  const [userConfirmed, setUserConfirmed] = useState<boolean>(false);
  const [issues, setIssues] = useState<ConsistencyIssue[]>([]);
  const [routedAuthorities, setRoutedAuthorities] = useState<any>(null);

  // Evaluate consistency & routing whenever moving to review
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

    const routes = routeAuthorities({
      category,
      platform,
      moneySent: amount > 0,
      credentialsShared,
      otpShared,
      remoteAccessGranted,
      lang: currentLang,
    });

    setRoutedAuthorities(routes);
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
    window.print();
  };

  const maskedNarrative = maskPii(narrative || 'No additional narrative text provided.');
  const maskedEntity = entityName ? maskPii(entityName) : 'Unspecified / Individual';
  const maskedUtr = utrNumber ? maskPii(utrNumber) : '';
  const maskedBeneficiary = beneficiaryInfo ? maskPii(beneficiaryInfo) : '';

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
      <div className="flex items-center justify-between gap-1 md:gap-2 border-b border-zinc-800 pb-4 print:hidden overflow-x-auto">
        {[
          { num: 1, label: '1. Incident' },
          { num: 2, label: '2. Entity' },
          { num: 3, label: '3. Financial' },
          { num: 4, label: '4. Security' },
          { num: 5, label: '5. Review' },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${
              step === s.num
                ? 'bg-rose-950 border border-rose-700 text-rose-300 ring-1 ring-rose-500'
                : step > s.num
                ? 'bg-zinc-900 border border-zinc-800 text-emerald-400'
                : 'bg-zinc-950 text-zinc-600'
            }`}
          >
            {s.label}
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
              <option value="Dating App / Matrimonial">Dating App / Matrimonial</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Incident Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
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

          <button
            type="button"
            onClick={handleNextStep}
            className="w-full py-3 rounded-xl font-bold text-sm bg-rose-600 text-white hover:bg-rose-500 transition-all cursor-pointer shadow-lg"
          >
            Next: Entity & Platform Details →
          </button>
        </div>
      )}

      {/* Step 2: Entity & Domain */}
      {step === 2 && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 print:hidden">
          <h2 className="text-lg font-bold text-white">{t('step2Title')}</h2>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">
              Claimed Advisor Name, Group Title, or Organisation
            </label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="e.g. VIP Institutional Wealth Club, Prof. Sharma Trading Academy"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">
              Website Domain or Portal Link (if any)
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. groww-institutional-vip.top, secure-trade-login.xyz"
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

      {/* Step 3: Financial & Transactions */}
      {step === 3 && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 print:hidden">
          <h2 className="text-lg font-bold text-white">{t('step3Title')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="text-xs font-semibold text-zinc-300">Payment Method Used</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm / BHIM)</option>
                <option value="IMPS / NEFT">IMPS / NEFT / RTGS Bank Transfer</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Crypto">Cryptocurrency / USDT</option>
                <option value="Cash / Other">Cash / Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">
              UPI Reference / Transaction UTR Number (12 Digits)
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
              Beneficiary UPI VPA or Account Number
            </label>
            <input
              type="text"
              value={beneficiaryInfo}
              onChange={(e) => setBeneficiaryInfo(e.target.value)}
              placeholder="e.g. merchant@icici or 9876543210@paytm"
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
              placeholder="Describe how contact occurred, promises made, instructions given, and when withdrawal was blocked..."
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
              Next: Security & Credentials →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Security & Credentials */}
      {step === 4 && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5 print:hidden">
          <h2 className="text-lg font-bold text-white">4. Security & Account Protection</h2>
          <p className="text-xs text-zinc-400">
            Did the counterparty ask you to perform any sensitive device or banking actions?
          </p>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer hover:border-zinc-700">
              <input
                type="checkbox"
                checked={otpShared}
                onChange={(e) => setOtpShared(e.target.checked)}
                className="mt-1 h-4 w-4 rounded bg-zinc-900 border-zinc-700 text-rose-600 focus:ring-rose-500"
              />
              <div className="space-y-1">
                <span className="text-sm font-semibold text-white block">
                  I shared an SMS / Banking OTP with the counterparty
                </span>
                <span className="text-xs text-zinc-400 block">
                  Alert: Bank accounts may be subject to ongoing unauthorized debits.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer hover:border-zinc-700">
              <input
                type="checkbox"
                checked={credentialsShared}
                onChange={(e) => setCredentialsShared(e.target.checked)}
                className="mt-1 h-4 w-4 rounded bg-zinc-900 border-zinc-700 text-rose-600 focus:ring-rose-500"
              />
              <div className="space-y-1">
                <span className="text-sm font-semibold text-white block">
                  I shared my net banking password, PIN, or PAN card photo
                </span>
                <span className="text-xs text-zinc-400 block">
                  Alert: Immediate password reset and card hotlisting required.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer hover:border-zinc-700">
              <input
                type="checkbox"
                checked={remoteAccessGranted}
                onChange={(e) => setRemoteAccessGranted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded bg-zinc-900 border-zinc-700 text-rose-600 focus:ring-rose-500"
              />
              <div className="space-y-1">
                <span className="text-sm font-semibold text-white block">
                  I installed AnyDesk, TeamViewer, RustDesk, or a downloaded APK file
                </span>
                <span className="text-xs text-zinc-400 block">
                  Alert: Remote software allows scammers to control your device silently. Turn off Wi-Fi and uninstall the application immediately.
                </span>
              </div>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
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

      {/* Step 5: Final Review & Printable Incident Record */}
      {step === 5 && (
        <div className="space-y-6">
          {/* Consistency Issues Banner */}
          {issues.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs space-y-2 print:hidden">
              <span className="font-bold flex items-center gap-1.5">
                <span>⚠️</span> Entity Consistency & Fact Verification Notices:
              </span>
              <ul className="list-disc list-inside space-y-1">
                {issues.map((iss, idx) => (
                  <li key={idx}>
                    <strong className="text-amber-100">[{iss.severity}]</strong> {iss.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* User Confirmation Checkbox */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 print:hidden">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={userConfirmed}
                onChange={(e) => setUserConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded bg-zinc-950 border-zinc-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-xs text-zinc-200 leading-relaxed font-medium">
                I have reviewed the facts above and confirm that this summary accurately reflects the statements provided on my device. I understand that this summary is not an automatic police complaint and must be filed on official portals.
              </span>
            </label>
          </div>

          {/* Action buttons (hidden when printing) */}
          <div className="flex justify-between items-center print:hidden">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all"
            >
              ← Edit Details
            </button>
            <button
              type="button"
              disabled={!userConfirmed}
              onClick={handlePrint}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2 ${
                userConfirmed
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
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
                  CONFIDENTIAL PRE-FILING CITIZEN INCIDENT RECORD
                </span>
                <span className="text-[11px] text-zinc-500">
                  Generated: {new Date().toLocaleDateString('en-IN')}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-zinc-900">
                CITIZEN FINANCIAL FRAUD INCIDENT SUMMARY
              </h2>
              <p className="text-xs text-zinc-600">
                Prepared on-device for formal filing on National Cyber Crime Portal (cybercrime.gov.in) & 1930 Helpline
              </p>
            </div>

            {/* Provenance Banner */}
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-[11px] text-zinc-600 flex justify-between">
              <span><strong>Data Provenance:</strong> Citizen User-Entered Facts</span>
              <span><strong>Language:</strong> {currentLang.toUpperCase()}</span>
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
                <span className="font-semibold text-zinc-500 block">Claimed Entity / Advisor:</span>
                <span className="font-bold text-zinc-900">{maskedEntity}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="font-semibold text-zinc-500 block">Total Claimed Loss:</span>
                <span className="font-bold text-rose-700 text-sm">
                  ₹{amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Transaction Data */}
            {maskedUtr && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Transaction Identifiers (Masked for Safety)
                </h3>
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs space-y-1 font-mono">
                  <div>UTR / Reference: {maskedUtr}</div>
                  <div>Payment Method: {paymentMethod}</div>
                  <div>Beneficiary / Account: {maskedBeneficiary || 'Provided to bank'}</div>
                </div>
              </div>
            )}

            {/* Security Compromise Notices */}
            {(otpShared || credentialsShared || remoteAccessGranted) && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-1">
                <span className="font-bold">⚠️ Reported Compromises:</span>
                {otpShared && <div>• SMS / Banking OTP was shared</div>}
                {credentialsShared && <div>• Banking passwords or credentials were shared</div>}
                {remoteAccessGranted && <div>• Remote desktop software (AnyDesk / APK) was installed</div>}
              </div>
            )}

            {/* Narrative */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Summary of Incident (Citizen Statement)
              </h3>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-800 leading-relaxed whitespace-pre-line">
                {maskedNarrative}
              </div>
            </div>

            {/* Routed Authorities */}
            {routedAuthorities && routedAuthorities.routes.length > 0 && (
              <div className="border-t border-zinc-300 pt-4 space-y-2">
                <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Recommended Official Reporting Authorities
                </h3>
                <div className="space-y-2">
                  {routedAuthorities.routes.map((auth: any) => (
                    <div
                      key={auth.id}
                      className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-zinc-900">{auth.name}</span>
                        <p className="text-[11px] text-zinc-600">{auth.scope}</p>
                      </div>
                      <div className="text-right">
                        {auth.channels.map((ch: any, idx: number) => (
                          <span key={idx} className="font-mono text-xs font-bold text-rose-700 block">
                            {ch.type === 'phone' ? `📞 ${ch.value}` : `🌐 ${ch.value}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
