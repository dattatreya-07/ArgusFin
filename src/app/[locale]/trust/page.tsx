'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Banner } from '@/components/ui';
import { IconShield, IconLock, IconCheck, IconGlobe } from '@/components/icons';

export default function TrustCenterPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-mono font-bold border border-accent/20">
          <span>FINANCEX TRUST &amp; TRANSPARENCY CENTER</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-ink font-inktrap tracking-tight">
          How FinanceX Protects You
        </h1>
        <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-[70ch]">
          FinanceX combines AI language comprehension, deterministic financial math rules, grounded regulatory data sources, and Web3 privacy-first proof anchoring.
        </p>
      </div>

      {/* Mandatory Safety Notice Banner */}
      <Banner
        variant="warning"
        title="IMPORTANT SAFETY &amp; SCOPE DISCLAIMER"
        description="FinanceX is an educational and scam resilience platform. It does not provide stock tips, investment advice, or guaranteed returns, nor is it affiliated with SEBI, RBI, or any government body."
      />

      {/* Grid: What FinanceX Does vs Does Not Do */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="text-emerald-400 flex items-center gap-2 text-lg">
              <IconCheck className="w-5 h-5 text-emerald-400" />
              <span>What FinanceX Does</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm text-ink leading-relaxed">
            <p>✓ <strong>Teaches Financial Concepts:</strong> Interactive lessons on compounding, CAGR, inflation, and risk spectrums.</p>
            <p>✓ <strong>Analyzes Suspicious Content:</strong> Screens texts, links, and screenshots for known fraud archetypes.</p>
            <p>✓ <strong>Calculates Realistic Returns:</strong> Compares promised yields against official gazetted benchmarks (PPF, G-Sec, EPF).</p>
            <p>✓ <strong>Anchors Evidence Fingerprints:</strong> Enables tamper-evident proof timestamping on Polygon Amoy testnet.</p>
            <p>✓ <strong>Generates Verifiable Credentials:</strong> Issues non-transferable Soulbound Credentials for milestone achievements.</p>
          </CardContent>
        </Card>

        <Card className="border-rose-500/30 bg-rose-500/5">
          <CardHeader>
            <CardTitle className="text-rose-400 flex items-center gap-2 text-lg">
              <span className="font-mono text-xl">✕</span>
              <span>What FinanceX Does Not Do</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm text-ink leading-relaxed">
            <p>✕ <strong>No Investment Advice:</strong> Never recommends stock buys, sell signals, trading apps, or crypto tokens.</p>
            <p>✕ <strong>No Personal Data Storage:</strong> Never reads SMS, OTPs, phone numbers, or bank account credentials.</p>
            <p>✕ <strong>No Defamatory Blacklists:</strong> Does not label specific real-world people or companies as scammers.</p>
            <p>✕ <strong>No Direct Complaint Filing:</strong> Prepares pre-filing incident records for official portals without auto-filing.</p>
            <p>✕ <strong>No Raw Data On-Chain:</strong> Never puts personal details, report text, or raw messages on the blockchain.</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Architecture Breakdown */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-ink font-inktrap border-b border-border pb-2">
          Safety &amp; Architecture Pillars
        </h2>

        {/* 1. Privacy by Design */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <IconLock className="w-5 h-5 text-accent" />
              <span>1. Privacy by Design</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
            <p>
              Privacy is enforced directly in your browser. All phone numbers, account numbers, UPI handles, and personal names are masked client-side using regular expressions before any processing or network request occurs.
            </p>
            <p className="font-mono text-[11px] bg-surface-sunken p-2.5 rounded border border-border">
              Client-side Masking Regex: [PHONE] · [UPI] · [ACCOUNT] · [NAME]
            </p>
          </CardContent>
        </Card>

        {/* 2. AI & Deterministic Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <IconShield className="w-5 h-5 text-accent" />
              <span>2. Explainable AI &amp; Deterministic Rules</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
            <p>
              AI language models help parse message semantics, while <strong>deterministic rule engines</strong> drive risk classification, compound interest calculations, and benchmark comparisons. Numbers are derived strictly from published gazette data, never from language model memory.
            </p>
          </CardContent>
        </Card>

        {/* 3. Official Grounded Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <IconGlobe className="w-5 h-5 text-accent" />
              <span>3. Grounded Regulatory Benchmark Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
            <p>
              All comparison interest rates (Public Provident Fund, 10-Year Government Securities, RBI Repo Rate, EPF, and Nifty 50 historical CAGR) are backed by official source URLs and verified timestamps.
            </p>
          </CardContent>
        </Card>

        {/* 4. Web3 Trust Layer & Blockchain */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <span>🔗 4. Web3 Trust Layer (Polygon Amoy Testnet)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
            <p>
              Blockchain anchoring proves that a specific evidence fingerprint existed at a specific time. Soulbound Credentials prove completion of FinanceX learning tracks. No personal data, report text, or unmasked identifiers ever enter contract state.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        <Link href="/learn">
          <Button variant="primary" size="md">Start Learning →</Button>
        </Link>
        <Link href="/check">
          <Button variant="secondary" size="md">Check a Message →</Button>
        </Link>
        <Link href="/prove">
          <Button variant="quiet" size="md">View Blockchain Proofs →</Button>
        </Link>
      </div>
    </div>
  );
}
