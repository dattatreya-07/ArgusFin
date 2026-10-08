'use client';

import React, { useState, useEffect } from 'react';
import { evidenceAnchorService, VerifyAnchorResult } from '@/lib/financeX/prove/evidenceAnchorService';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { Link } from '@/i18n/routing';

export default function PublicEvidenceVerificationPage({
  params: { locale, hash: evidenceHash },
}: {
  params: { locale: string; hash: string };
}) {
  const [verification, setVerification] = useState<VerifyAnchorResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      setLoading(true);
      try {
        const res = await evidenceAnchorService.verifyAnchorOnChain(evidenceHash);
        setVerification(res);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [evidenceHash]);

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
          CRYPTOGRAPHIC EVIDENCE ANCHOR VERIFICATION
        </span>
        <h1 className="text-3xl font-black font-inktrap text-ink">
          Evidence Fingerprint Verification
        </h1>
        <p className="text-xs text-ink-muted">
          Verified directly against Polygon Amoy EvidenceAnchor smart contract.
        </p>
      </div>

      {loading ? (
        <Card className="p-8 text-center space-y-3">
          <span className="animate-spin text-2xl block">⚓</span>
          <p className="text-sm font-mono text-ink-muted">Querying Polygon Amoy EvidenceAnchor Contract...</p>
        </Card>
      ) : verification ? (
        <Card className={`border-2 ${verification.exists ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-rose-500/50 bg-rose-500/5'}`}>
          <CardHeader className="text-center pb-2">
            <span className="text-4xl block">{verification.exists ? '⚓' : '❌'}</span>
            <h2 className="text-2xl font-bold font-inktrap text-ink mt-2">
              {verification.exists ? 'EVIDENCE ANCHORED ON-CHAIN' : 'ANCHOR NOT FOUND'}
            </h2>
            <p className="text-xs text-ink-muted">{verification.message}</p>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 border-t border-border/50 text-xs font-mono">
            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-ink-muted">Evidence SHA-256 Hash:</span>
              <span className="font-bold text-accent truncate max-w-[220px]">{evidenceHash}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-ink-muted">Anchor Timestamp:</span>
              <span className="font-bold text-ink">{verification.timestamp || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-ink-muted">Schema Version:</span>
              <span className="font-bold text-ink">{verification.schemaVersion || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-ink-muted">Anchored By Wallet:</span>
              <span className="font-bold text-ink truncate max-w-[200px]">{verification.anchorer || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-ink-muted">Network:</span>
              <span className="font-bold text-emerald-400">{verification.networkName}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-ink-muted">Contract Address:</span>
              <span className="font-bold text-ink truncate max-w-[200px]">{verification.contractAddress}</span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="text-center">
        <Link href="/prove">
          <Button variant="secondary" size="sm">
            ← Return to Prove Hub
          </Button>
        </Link>
      </div>
    </div>
  );
}
