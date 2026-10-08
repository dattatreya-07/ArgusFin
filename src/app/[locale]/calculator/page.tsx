'use client';

import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  computeAnnualised,
  computeLumpSum,
  computeSip,
  computeResearchAnalystBreakdown,
  computeResearchCagrModeB,
  computeInflationErosion,
  computeRuleOf72,
  computeEmergencyFund,
  ResearchCagrModeBResult,
} from '@/lib/calc';
import {
  formatAnnualisedMultiple,
  formatAnnualisedReturnPct,
  formatIndianNumber,
} from '@/lib/format';
import { LadderChart } from '@/components/LadderChart';
import { LadderDisplayModel } from '@/lib/ladder';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Field,
  BandBadge,
  Banner,
} from '@/components/ui';
import { Link } from '@/i18n/routing';

type DurationUnit = 'days' | 'weeks' | 'months' | 'years';
type CalculatorMode =
  | 'PROMISE_CHECK'
  | 'INFLATION'
  | 'RULE_OF_72'
  | 'EMERGENCY_FUND'
  | 'LUMP_SUM'
  | 'SIP_MONTHLY'
  | 'CAGR';

const SOCRATIC_RETURN_QUESTIONS = [
  '1. What underlying economic activity supposedly creates this return?',
  '2. Is the return legally guaranteed in writing or merely projected?',
  '3. What happens to my money if the market drops by 30%?',
  '4. Can you independently verify the underlying assets on SEBI/RBI registered platforms?',
  '5. Who is receiving your funds (personal bank account vs SEBI escrow)?',
  '6. Which statutory Indian regulator (SEBI/RBI) governs this activity?',
  '7. What fees, commissions, or withdrawal conditions apply?',
  '8. Can you withdraw your principal anytime without lock-in penalties?',
  '9. What evidence or audited financial reports support the claimed return?',
  '10. What happens if new participants stop depositing money into this platform?',
];

function CalculatorContent() {
  const t = useTranslations('calculator');
  const searchParams = useSearchParams();

  // Mode Selection State
  const initialMode = (searchParams.get('mode') as CalculatorMode) || 'PROMISE_CHECK';
  const [activeMode, setActiveMode] = useState<CalculatorMode>(initialMode);

  // Mode D State: Promise Reality Check
  const paramInvested = searchParams.get('invested') || '10000';
  const paramPayout = searchParams.get('payout') || '20000';
  const paramDays = searchParams.get('days') || '30';

  const [invested, setInvested] = useState<string>(paramInvested);
  const [payout, setPayout] = useState<string>(paramPayout);
  const [durationValue, setDurationValue] = useState<string>(paramDays);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('days');

  // Practical Simulation: Inflation State
  const [infMonthlyExpense, setInfMonthlyExpense] = useState<string>('35000');
  const [infRate, setInfRate] = useState<string>('6.0');
  const [infYears, setInfYears] = useState<string>('15');

  // Practical Simulation: Rule of 72 State
  const [r72Duration, setR72Duration] = useState<string>('15');
  const [r72Unit, setR72Unit] = useState<'days' | 'months' | 'years'>('days');

  // Practical Simulation: Emergency Fund State
  const [efRent, setEfRent] = useState<string>('15000');
  const [efFood, setEfFood] = useState<string>('10000');
  const [efUtilities, setEfUtilities] = useState<string>('4000');
  const [efInsurance, setEfInsurance] = useState<string>('3000');

  // Mode A State: Lump Sum
  const [lumpPrincipal, setLumpPrincipal] = useState<string>('50000');
  const [lumpRate, setLumpRate] = useState<string>('12');
  const [lumpYears, setLumpYears] = useState<string>('5');
  const [lumpCompounding, setLumpCompounding] = useState<string>('1');

  // Mode B State: Monthly Contribution (SIP)
  const [sipMonthly, setSipMonthly] = useState<string>('5000');
  const [sipRate, setSipRate] = useState<string>('12');
  const [sipYears, setSipYears] = useState<string>('10');

  // Mode C State: Research CAGR
  const [modeBStartAmount, setModeBStartAmount] = useState<string>('100000');
  const [modeBEndAmount, setModeBEndAmount] = useState<string>('144000');
  const [modeBStartDate, setModeBStartDate] = useState<string>('2023-01-01');
  const [modeBEndDate, setModeBEndDate] = useState<string>('2026-01-01');

  const [ladderData, setLadderData] = useState<LadderDisplayModel | null>(null);

  // Promise Reality Check: Total Days
  const totalDays = useMemo(() => {
    const val = parseFloat(durationValue) || 0;
    switch (durationUnit) {
      case 'weeks':
        return val * 7;
      case 'months':
        return val * 30.4167;
      case 'years':
        return val * 365;
      case 'days':
      default:
        return val;
    }
  }, [durationValue, durationUnit]);

  // Fetch Ladder Benchmark Data
  useEffect(() => {
    fetch('/api/ladder')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setLadderData(data);
      })
      .catch(() => {});
  }, []);

  // Mode D Calculation: Promise Reality Check
  const promiseResult = useMemo(() => {
    const p = parseFloat(invested);
    const a = parseFloat(payout);
    if (!Number.isFinite(p) || !Number.isFinite(a) || totalDays <= 0 || p <= 0 || a <= 0) {
      return null;
    }
    return computeAnnualised({ invested: p, payout: a, durationDays: totalDays });
  }, [invested, payout, totalDays]);

  const analystBreakdown = useMemo(() => {
    const p = parseFloat(invested);
    const a = parseFloat(payout);
    if (!Number.isFinite(p) || !Number.isFinite(a) || totalDays <= 0 || p <= 0 || a <= 0) {
      return null;
    }
    return computeResearchAnalystBreakdown(p, a, totalDays);
  }, [invested, payout, totalDays]);

  // Mode A Calculation: Lump Sum
  const lumpSumResult = useMemo(() => {
    const p = parseFloat(lumpPrincipal);
    const r = parseFloat(lumpRate);
    const tY = parseFloat(lumpYears);
    const n = parseInt(lumpCompounding, 10);
    return computeLumpSum(p, r, tY, n);
  }, [lumpPrincipal, lumpRate, lumpYears, lumpCompounding]);

  // Mode B Calculation: SIP Monthly
  const sipResult = useMemo(() => {
    const m = parseFloat(sipMonthly);
    const r = parseFloat(sipRate);
    const tY = parseFloat(sipYears);
    return computeSip(m, r, tY);
  }, [sipMonthly, sipRate, sipYears]);

  // Mode C Calculation: CAGR
  const cagrResult: ResearchCagrModeBResult | null = useMemo(() => {
    const p = parseFloat(modeBStartAmount);
    const a = parseFloat(modeBEndAmount);
    if (!Number.isFinite(p) || !Number.isFinite(a) || !modeBStartDate || !modeBEndDate) {
      return null;
    }
    return computeResearchCagrModeB({
      initialLumpSum: p,
      endingValue: a,
      startDateStr: modeBStartDate,
      endDateStr: modeBEndDate,
    });
  }, [modeBStartAmount, modeBEndAmount, modeBStartDate, modeBEndDate]);

  // Practical Simulation: Inflation Calculation
  const inflationResult = useMemo(() => {
    const exp = parseFloat(infMonthlyExpense) || 0;
    const r = parseFloat(infRate) || 0;
    const y = parseFloat(infYears) || 0;
    return computeInflationErosion(exp, r, y);
  }, [infMonthlyExpense, infRate, infYears]);

  // Practical Simulation: Rule of 72 Calculation
  const ruleOf72Result = useMemo(() => {
    const d = parseFloat(r72Duration) || 0;
    return computeRuleOf72(d, r72Unit);
  }, [r72Duration, r72Unit]);

  // Practical Simulation: Emergency Fund Calculation
  const emergencyFundResult = useMemo(() => {
    const rent = parseFloat(efRent) || 0;
    const food = parseFloat(efFood) || 0;
    const util = parseFloat(efUtilities) || 0;
    const ins = parseFloat(efInsurance) || 0;
    return computeEmergencyFund(rent, food, util, ins);
  }, [efRent, efFood, efUtilities, efInsurance]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-ink tracking-tight font-inktrap">
          {t('title')}
        </h1>
        <p className="text-base text-ink-muted">
          Deterministic investment calculators, inflation purchasing erosion, Rule of 72 scam verification &amp; emergency buffers.
        </p>
      </div>

      {/* MODE SELECTOR TABS */}
      <div className="p-1.5 bg-surface-sunken rounded-xl border border-border flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActiveMode('PROMISE_CHECK')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition font-mono flex items-center justify-center gap-1.5 cursor-pointer flex-1 min-w-[130px] ${
            activeMode === 'PROMISE_CHECK'
              ? 'bg-accent text-accent-ink shadow-sm'
              : 'text-ink-muted hover:text-ink hover:bg-surface/50'
          }`}
        >
          <span>🎯 PROMISE CHECK</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('INFLATION')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition font-mono flex items-center justify-center gap-1.5 cursor-pointer flex-1 min-w-[130px] ${
            activeMode === 'INFLATION'
              ? 'bg-accent text-accent-ink shadow-sm'
              : 'text-ink-muted hover:text-ink hover:bg-surface/50'
          }`}
        >
          <span>📉 INFLATION</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('RULE_OF_72')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition font-mono flex items-center justify-center gap-1.5 cursor-pointer flex-1 min-w-[130px] ${
            activeMode === 'RULE_OF_72'
              ? 'bg-accent text-accent-ink shadow-sm'
              : 'text-ink-muted hover:text-ink hover:bg-surface/50'
          }`}
        >
          <span>⚡ RULE OF 72</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('EMERGENCY_FUND')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition font-mono flex items-center justify-center gap-1.5 cursor-pointer flex-1 min-w-[130px] ${
            activeMode === 'EMERGENCY_FUND'
              ? 'bg-accent text-accent-ink shadow-sm'
              : 'text-ink-muted hover:text-ink hover:bg-surface/50'
          }`}
        >
          <span>🛡️ EMERGENCY FUND</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('LUMP_SUM')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition font-mono flex items-center justify-center gap-1.5 cursor-pointer flex-1 min-w-[110px] ${
            activeMode === 'LUMP_SUM'
              ? 'bg-accent text-accent-ink shadow-sm'
              : 'text-ink-muted hover:text-ink hover:bg-surface/50'
          }`}
        >
          <span>💰 LUMP SUM</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('SIP_MONTHLY')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition font-mono flex items-center justify-center gap-1.5 cursor-pointer flex-1 min-w-[110px] ${
            activeMode === 'SIP_MONTHLY'
              ? 'bg-accent text-accent-ink shadow-sm'
              : 'text-ink-muted hover:text-ink hover:bg-surface/50'
          }`}
        >
          <span>📈 SIP</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('CAGR')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition font-mono flex items-center justify-center gap-1.5 cursor-pointer flex-1 min-w-[110px] ${
            activeMode === 'CAGR'
              ? 'bg-accent text-accent-ink shadow-sm'
              : 'text-ink-muted hover:text-ink hover:bg-surface/50'
          }`}
        >
          <span>📊 CAGR</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs & Results */}
        <div className="lg:col-span-6 space-y-6">

          {/* MODE D: PROMISE REALITY CHECK */}
          {activeMode === 'PROMISE_CHECK' && (
            <Card>
              <CardHeader>
                <CardTitle>Promise Reality Check</CardTitle>
                <CardDescription className="text-accent font-semibold">
                  Evaluates implied annualized return rates &amp; market math
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field
                  label="Lump Sum Principal Requested (₹)"
                  type="number"
                  min="1"
                  step="any"
                  value={invested}
                  onChange={(e) => setInvested(e.target.value)}
                  placeholder="e.g. 10000"
                  hint="Amount requested to deposit"
                />
                <Field
                  label="Promised Maturity Payout (₹)"
                  type="number"
                  min="1"
                  step="any"
                  value={payout}
                  onChange={(e) => setPayout(e.target.value)}
                  placeholder="e.g. 20000"
                  hint="Promised return amount"
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Promised Duration</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={durationValue}
                      onChange={(e) => setDurationValue(e.target.value)}
                      className="w-2/3 px-3.5 py-2.5 border border-border bg-surface rounded-md text-base text-ink"
                    />
                    <select
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
                      className="w-1/3 px-3 py-2.5 border border-border bg-surface rounded-md text-sm text-ink"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* MODE A: LUMP SUM COMPOUNDING */}
          {activeMode === 'LUMP_SUM' && (
            <Card>
              <CardHeader>
                <CardTitle>Lump Sum Compounding Investment</CardTitle>
                <CardDescription className="text-accent font-semibold">
                  Standard compounding growth formula
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field
                  label="Principal Amount (₹)"
                  type="number"
                  min="1"
                  value={lumpPrincipal}
                  onChange={(e) => setLumpPrincipal(e.target.value)}
                  hint="Initial lump sum deposit"
                />
                <Field
                  label="Expected Annual Interest Rate (%)"
                  type="number"
                  step="0.1"
                  value={lumpRate}
                  onChange={(e) => setLumpRate(e.target.value)}
                  hint="Expected annual rate (e.g., 7.1% FD, 12% Equity)"
                />
                <Field
                  label="Duration (Years)"
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={lumpYears}
                  onChange={(e) => setLumpYears(e.target.value)}
                  hint="Investment time horizon in years"
                />
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Compounding Frequency</label>
                  <select
                    value={lumpCompounding}
                    onChange={(e) => setLumpCompounding(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border bg-surface rounded-md text-sm text-ink"
                  >
                    <option value="1">Annually (1x / year)</option>
                    <option value="2">Semi-Annually (2x / year)</option>
                    <option value="4">Quarterly (4x / year)</option>
                    <option value="12">Monthly (12x / year)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* MODE B: SIP MONTHLY CONTRIBUTION */}
          {activeMode === 'SIP_MONTHLY' && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Contribution (SIP Calculator)</CardTitle>
                <CardDescription className="text-accent font-semibold">
                  Rupee Cost Averaging &amp; Monthly Investment Wealth Growth
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field
                  label="Monthly Contribution Amount (₹)"
                  type="number"
                  min="1"
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(e.target.value)}
                  hint="Amount deposited every month"
                />
                <Field
                  label="Assumed Annual Growth Rate (%)"
                  type="number"
                  step="0.1"
                  value={sipRate}
                  onChange={(e) => setSipRate(e.target.value)}
                  hint="e.g. 12% p.a. equity index long-term assumption"
                />
                <Field
                  label="Investment Horizon (Years)"
                  type="number"
                  min="1"
                  value={sipYears}
                  onChange={(e) => setSipYears(e.target.value)}
                  hint="Total investment duration in years"
                />
              </CardContent>
            </Card>
          )}

          {/* MODE C: RESEARCH CAGR */}
          {activeMode === 'CAGR' && (
            <Card>
              <CardHeader>
                <CardTitle>Compound Annual Growth Rate (CAGR)</CardTitle>
                <CardDescription className="text-accent font-semibold">
                  Exact calendar date interval CAGR calculator
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field
                  label="Initial Amount (₹)"
                  type="number"
                  value={modeBStartAmount}
                  onChange={(e) => setModeBStartAmount(e.target.value)}
                />
                <Field
                  label="Ending Value (₹)"
                  type="number"
                  value={modeBEndAmount}
                  onChange={(e) => setModeBEndAmount(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Start Date"
                    type="date"
                    value={modeBStartDate}
                    onChange={(e) => setModeBStartDate(e.target.value)}
                  />
                  <Field
                    label="End Date"
                    type="date"
                    value={modeBEndDate}
                    onChange={(e) => setModeBEndDate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* PRACTICAL SIMULATION: INFLATION & PURCHASING POWER */}
          {activeMode === 'INFLATION' && (
            <Card>
              <CardHeader>
                <CardTitle>Inflation &amp; Purchasing Power Erosion</CardTitle>
                <CardDescription className="text-accent font-semibold">
                  Calculates how consumer price inflation erodes real household purchasing power over time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field
                  label="Current Monthly Household Expenses (₹)"
                  type="number"
                  min="1000"
                  value={infMonthlyExpense}
                  onChange={(e) => setInfMonthlyExpense(e.target.value)}
                  placeholder="e.g. 35000"
                  hint="Essential living expenses today"
                />
                <Field
                  label="Estimated Annual Inflation Rate (% CPI)"
                  type="number"
                  step="0.1"
                  min="1"
                  max="25"
                  value={infRate}
                  onChange={(e) => setInfRate(e.target.value)}
                  placeholder="e.g. 6.0"
                  hint="India long-term average CPI is approx. 5.5% - 7.0%"
                />
                <Field
                  label="Planning Time Horizon (Years)"
                  type="number"
                  min="1"
                  max="40"
                  value={infYears}
                  onChange={(e) => setInfYears(e.target.value)}
                  placeholder="e.g. 15"
                  hint="Number of years into the future"
                />
              </CardContent>
            </Card>
          )}

          {/* PRACTICAL SIMULATION: RULE OF 72 & SCAM DOUBLING VERIFIER */}
          {activeMode === 'RULE_OF_72' && (
            <Card>
              <CardHeader>
                <CardTitle>Rule of 72 &amp; Scam Doubling Verifier</CardTitle>
                <CardDescription className="text-accent font-semibold">
                  Mathematical reality check: Years to Double ≈ 72 / Annual Rate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Promised Money Doubling Duration</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={r72Duration}
                      onChange={(e) => setR72Duration(e.target.value)}
                      className="w-2/3 px-3.5 py-2.5 border border-border bg-surface rounded-md text-base text-ink"
                    />
                    <select
                      value={r72Unit}
                      onChange={(e) => setR72Unit(e.target.value as any)}
                      className="w-1/3 px-3 py-2.5 border border-border bg-surface rounded-md text-sm text-ink"
                    >
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[11px] font-bold text-ink-muted">Quick Presets:</span>
                  {[
                    { label: '10 Days (Scam)', val: '10', unit: 'days' },
                    { label: '30 Days (VIP Bot)', val: '30', unit: 'days' },
                    { label: '1 Year (Ponzi)', val: '1', unit: 'years' },
                    { label: '6 Years (Nifty 12%)', val: '6', unit: 'years' },
                    { label: '10 Years (Bank FD)', val: '10', unit: 'years' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setR72Duration(p.val);
                        setR72Unit(p.unit as any);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded bg-surface-sunken hover:bg-surface-elevated border border-border text-ink cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* PRACTICAL SIMULATION: EMERGENCY FUND SAFETY BUFFER */}
          {activeMode === 'EMERGENCY_FUND' && (
            <Card>
              <CardHeader>
                <CardTitle>Essential Emergency Buffer Simulator</CardTitle>
                <CardDescription className="text-accent font-semibold">
                  Determines the untouchable liquid safety cushion needed before taking any market risk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field
                  label="Monthly Rent / Home Loan EMI (₹)"
                  type="number"
                  min="0"
                  value={efRent}
                  onChange={(e) => setEfRent(e.target.value)}
                  hint="Fixed unavoidable housing cost"
                />
                <Field
                  label="Groceries &amp; Basic Food (₹)"
                  type="number"
                  min="0"
                  value={efFood}
                  onChange={(e) => setEfFood(e.target.value)}
                  hint="Essential household food expenditure"
                />
                <Field
                  label="Utilities, Electricity, Internet (₹)"
                  type="number"
                  min="0"
                  value={efUtilities}
                  onChange={(e) => setEfUtilities(e.target.value)}
                  hint="Power, water, cooking gas, connectivity"
                />
                <Field
                  label="Insurance &amp; Essential Medications (₹)"
                  type="number"
                  min="0"
                  value={efInsurance}
                  onChange={(e) => setEfInsurance(e.target.value)}
                  hint="Health insurance premiums and essential medicines"
                />
              </CardContent>
            </Card>
          )}

          {/* Mode D Promise Output */}
          {activeMode === 'PROMISE_CHECK' && promiseResult && promiseResult.success && (
            <Card className="border-border">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>{t('resultsTitle')}</CardTitle>
                  <BandBadge band={promiseResult.tier === 4 ? 'HIGH' : 'LOW_SIGNALS'} />
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-sunken rounded-md border border-border">
                    <span className="block text-xs text-ink-muted">Return Multiple</span>
                    <span className="text-lg font-bold text-ink">{promiseResult.multiple.toFixed(2)}×</span>
                  </div>
                  <div className="p-3 bg-surface-sunken rounded-md border border-border">
                    <span className="block text-xs text-ink-muted">Annualised Return %</span>
                    <span className="text-lg font-bold text-ink">
                      {formatAnnualisedReturnPct(promiseResult.annualisedReturnPct, promiseResult.overflow)}
                    </span>
                  </div>
                </div>
                {analystBreakdown && (
                  <div className="p-4 bg-surface-sunken rounded-xl border border-accent/40 space-y-2 text-xs">
                    <p className="font-bold text-ink">Analyst Verdict:</p>
                    <p className="text-ink-muted leading-relaxed">{analystBreakdown.analystSummary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Mode A Lump Sum Output */}
          {activeMode === 'LUMP_SUM' && lumpSumResult.success && (
            <Card className="border-border">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle>Lump Sum Results</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-sunken rounded-md border border-border">
                    <span className="block text-xs text-ink-muted">Invested Principal</span>
                    <span className="text-lg font-bold text-ink">₹{formatIndianNumber(lumpSumResult.principal, 0)}</span>
                  </div>
                  <div className="p-3 bg-surface-sunken rounded-md border border-border">
                    <span className="block text-xs text-ink-muted">Total Interest / Profit</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      +₹{formatIndianNumber(lumpSumResult.totalProfit, 0)}
                    </span>
                  </div>
                  <div className="p-3 bg-accent-soft rounded-md border border-accent/40 col-span-2">
                    <span className="block text-xs text-accent font-bold font-mono">Final Maturity Value</span>
                    <span className="text-2xl font-extrabold text-ink">
                      ₹{formatIndianNumber(lumpSumResult.finalMaturityAmount, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mode B SIP Output */}
          {activeMode === 'SIP_MONTHLY' && sipResult.success && (
            <Card className="border-border">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle>SIP Wealth Projection</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-sunken rounded-md border border-border">
                    <span className="block text-xs text-ink-muted">Total Invested</span>
                    <span className="text-lg font-bold text-ink">₹{formatIndianNumber(sipResult.totalInvested, 0)}</span>
                  </div>
                  <div className="p-3 bg-surface-sunken rounded-md border border-border">
                    <span className="block text-xs text-ink-muted">Est. Total Wealth Growth</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      +₹{formatIndianNumber(sipResult.totalGrowth, 0)}
                    </span>
                  </div>
                  <div className="p-3 bg-accent-soft rounded-md border border-accent/40 col-span-2">
                    <span className="block text-xs text-accent font-bold font-mono">Estimated Corpus Value</span>
                    <span className="text-2xl font-extrabold text-ink">
                      ₹{formatIndianNumber(sipResult.finalEstimatedValue, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mode C CAGR Output */}
          {activeMode === 'CAGR' && cagrResult && cagrResult.success && (
            <Card className="border-border">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle>CAGR Output</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-sunken rounded-md border border-border">
                    <span className="block text-xs text-ink-muted">Duration</span>
                    <span className="text-lg font-bold text-ink">{cagrResult.daysDuration} days</span>
                  </div>
                  <div className="p-3 bg-accent-soft rounded-md border border-accent/40">
                    <span className="block text-xs text-accent font-bold font-mono">Calculated CAGR</span>
                    <span className="text-xl font-extrabold text-ink">{cagrResult.cagrPct.toFixed(2)}% p.a.</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Practical Simulation: Inflation Output */}
          {activeMode === 'INFLATION' && inflationResult && (
            <Card className="border-border">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Inflation Erosion Analysis</CardTitle>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    -{inflationResult.purchasingPowerLossPct}% Purchasing Power
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-sunken rounded-md border border-border">
                    <span className="block text-xs text-ink-muted">Monthly Expense Today</span>
                    <span className="text-lg font-bold text-ink">₹{formatIndianNumber(inflationResult.currentMonthlyExpense, 0)}</span>
                  </div>
                  <div className="p-3 bg-surface-sunken rounded-md border border-border">
                    <span className="block text-xs text-ink-muted">Future Monthly Cost (Year {inflationResult.horizonYears})</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      ₹{formatIndianNumber(inflationResult.futureMonthlyExpense, 0)}
                    </span>
                  </div>
                  <div className="p-3 bg-rose-500/10 rounded-md border border-rose-500/20 col-span-2">
                    <span className="block text-xs text-rose-600 dark:text-rose-400 font-bold font-mono">
                      Real Value of ₹1,00,000 Cash in Year {inflationResult.horizonYears}
                    </span>
                    <span className="text-2xl font-extrabold text-ink">
                      ₹{formatIndianNumber(
                        Math.round(100000 / Math.pow(1 + inflationResult.annualInflationPct / 100, inflationResult.horizonYears)),
                        0
                      )}
                    </span>
                    <p className="text-[11px] text-ink-muted mt-1">
                      Due to {inflationResult.annualInflationPct}% inflation, ₹1 Lakh sitting in an uninvested zero-interest locker will only buy ₹
                      {formatIndianNumber(
                        Math.round(100000 / Math.pow(1 + inflationResult.annualInflationPct / 100, inflationResult.horizonYears)),
                        0
                      )}{' '}
                      worth of real goods.
                    </p>
                  </div>
                </div>

                {/* Milestone Table */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-xs font-bold text-ink font-mono uppercase">Erosion Milestones Over Time</span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-surface-sunken text-ink-muted font-mono uppercase text-[10px]">
                        <tr>
                          <th className="p-2">Years</th>
                          <th className="p-2">Monthly Need</th>
                          <th className="p-2">Purchasing Power %</th>
                          <th className="p-2">Real Value of ₹1L</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {inflationResult.milestones.map((m, idx) => (
                          <tr key={idx} className="hover:bg-surface-sunken/40">
                            <td className="p-2 font-mono font-bold text-ink">{m.years} yrs</td>
                            <td className="p-2 font-bold text-ink">₹{formatIndianNumber(m.futureMonthlyExpense, 0)}</td>
                            <td className="p-2 text-ink-muted font-mono">{m.purchasingPowerRemainingPct}%</td>
                            <td className="p-2 text-rose-600 dark:text-rose-400 font-mono font-semibold">
                              ₹{formatIndianNumber(m.realValueOfLakh, 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Practical Simulation: Rule of 72 Output */}
          {activeMode === 'RULE_OF_72' && ruleOf72Result && (
            <Card className="border-border">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Rule of 72 Math Proof</CardTitle>
                  <BandBadge band={ruleOf72Result.isImpossiblePromise ? 'HIGH' : 'LOW_SIGNALS'} />
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-sunken rounded-md border border-border">
                    <span className="block text-xs text-ink-muted">Claimed Doubling Duration</span>
                    <span className="text-lg font-bold text-ink">{ruleOf72Result.promisedDurationText}</span>
                  </div>
                  <div className="p-3 bg-surface-sunken rounded-md border border-border">
                    <span className="block text-xs text-ink-muted">Required Annual Return</span>
                    <span
                      className={`text-lg font-bold ${
                        ruleOf72Result.isImpossiblePromise
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {formatIndianNumber(ruleOf72Result.impliedAnnualRatePct, 1)}% p.a.
                    </span>
                  </div>
                  <div
                    className={`p-3.5 rounded-md col-span-2 border ${
                      ruleOf72Result.isImpossiblePromise
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    <span className="block text-xs font-bold font-mono uppercase">
                      {ruleOf72Result.isImpossiblePromise ? '⚠️ Mathematical Scam Trap' : '✅ Realistic Economic Timeline'}
                    </span>
                    <p className="text-xs mt-1 leading-relaxed">
                      {ruleOf72Result.isImpossiblePromise
                        ? `Promising to double money in ${ruleOf72Result.promisedDurationText} requires a staggering ${formatIndianNumber(
                            ruleOf72Result.impliedAnnualRatePct,
                            0
                          )}% annual return. In regulated Indian financial markets, no authorized institution (bank, AMC, or PMS) guarantees such returns. This is a definitive mathematical hallmark of a Ponzi scheme.`
                        : `A ${ruleOf72Result.promisedDurationText} doubling timeline corresponds to ~${formatIndianNumber(
                            ruleOf72Result.impliedAnnualRatePct,
                            1
                          )}% annual growth, which is consistent with normal long-term economic compounding.`}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-surface-sunken rounded-lg border border-border space-y-2 text-xs">
                  <span className="font-bold text-ink font-mono uppercase block">SEBI &amp; RBI Benchmark Doubling Times:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-surface rounded border border-border">
                      <span className="text-ink-muted block text-[11px]">Bank / Post Office FD (7.1%)</span>
                      <span className="font-bold text-ink font-mono">~10.1 Years to double</span>
                    </div>
                    <div className="p-2 bg-surface rounded border border-border">
                      <span className="text-ink-muted block text-[11px]">Nifty Index CAGR (~12%)</span>
                      <span className="font-bold text-ink font-mono">~6.0 Years to double</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Practical Simulation: Emergency Fund Output */}
          {activeMode === 'EMERGENCY_FUND' && emergencyFundResult && (
            <Card className="border-border">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Liquid Emergency Buffer</CardTitle>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Untouchable Capital
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="p-3.5 bg-surface-sunken rounded-lg border border-border">
                  <span className="block text-xs text-ink-muted">Monthly Survival Baseline</span>
                  <span className="text-2xl font-black text-ink font-mono">
                    ₹{formatIndianNumber(emergencyFundResult.monthlyEssential, 0)} / mo
                  </span>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Covers non-negotiable living obligations: Rent/EMI + Food + Utilities + Healthcare
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 bg-surface rounded-lg border border-border">
                    <span className="text-[10px] uppercase font-mono text-ink-muted block">3 Months (Salaried)</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-ink">
                      ₹{formatIndianNumber(emergencyFundResult.threeMonths, 0)}
                    </span>
                  </div>
                  <div className="p-3 bg-accent-soft rounded-lg border border-accent/40">
                    <span className="text-[10px] uppercase font-mono text-accent font-bold block">6 Months (Standard)</span>
                    <span className="text-sm sm:text-base font-extrabold font-mono text-ink">
                      ₹{formatIndianNumber(emergencyFundResult.sixMonths, 0)}
                    </span>
                  </div>
                  <div className="p-3 bg-surface rounded-lg border border-border">
                    <span className="text-[10px] uppercase font-mono text-ink-muted block">12 Months (Freelance)</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-ink">
                      ₹{formatIndianNumber(emergencyFundResult.twelveMonths, 0)}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs space-y-1.5 text-ink">
                  <p className="font-bold text-emerald-700 dark:text-emerald-300">
                    🛡️ Emergency Buffer Cardinal Rule:
                  </p>
                  <p className="text-ink-muted leading-relaxed">
                    Keep 50% in a high-yield bank savings account with instant UPI access, and 50% in an overnight/liquid mutual fund or bank sweep-in FD.
                    Never lock emergency funds into crypto, chit funds, or unverified trading schemes.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Column: Reality Ladder & Socratic Questioning */}
        <div className="lg:col-span-6 space-y-6">
          <LadderChart
            ladderModel={ladderData}
            promiseAnnualisedPct={
              activeMode === 'PROMISE_CHECK' && promiseResult && promiseResult.success
                ? promiseResult.annualisedReturnPct
                : activeMode === 'RULE_OF_72'
                ? ruleOf72Result.impliedAnnualRatePct
                : activeMode === 'CAGR' && cagrResult && cagrResult.success
                ? cagrResult.cagrPct
                : activeMode === 'LUMP_SUM'
                ? parseFloat(lumpRate) || 0
                : parseFloat(sipRate) || 0
            }
          />

          {/* SOCRATIC QUESTION THE RETURN EXPERIENCE */}
          <Card className="border-accent/40 bg-surface">
            <CardHeader className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>❓</span> &quot;Question The Return&quot; Socratic Verification
                </CardTitle>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-soft text-accent font-mono">
                  10 Verification Questions
                </span>
              </div>
              <CardDescription className="text-xs text-ink-muted">
                Before transferring any money, ask the promoter or broker these 10 essential questions:
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-2 max-h-[320px] overflow-y-auto">
              {SOCRATIC_RETURN_QUESTIONS.map((q, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-surface-sunken border border-border text-xs text-ink font-medium">
                  {q}
                </div>
              ))}
            </CardContent>

            <CardFooter className="bg-surface-sunken border-t border-border p-4 flex justify-between items-center text-xs text-ink-muted font-mono">
              <span>Verified Investor Protection Framework</span>
              <Link href="/check" className="text-accent font-bold hover:underline">
                Check Message Text →
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-muted text-sm font-mono">Loading Calculator Engine...</div>}>
      <CalculatorContent />
    </Suspense>
  );
}
