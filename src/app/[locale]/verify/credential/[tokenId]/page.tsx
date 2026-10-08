'use client';

import React, { useState, useEffect } from 'react';
import { credentialService, VerificationResult } from '@/lib/financeX/prove/credentialService';
import { Card, CardHeader, CardContent, Button, Chip } from '@/components/ui';
import { Link } from '@/i18n/routing';

export default function PublicCredentialVerificationPage({
  params: { locale, tokenId },
}: {
  params: { locale: string; tokenId: string };
}) {
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      setLoading(true);
      try {
        const res = await credentialService.verifyCredentialOnChain(tokenId);
        setVerification(res);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [tokenId]);

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
          INDEPENDENT PUBLIC BLOCKCHAIN VERIFICATION
        </span>
        <h1 className="text-3xl font-black font-inktrap text-ink">
          Soulbound Credential Verification
        </h1>
        <p className="text-xs text-ink-muted">
          Token ID #{tokenId} · Verified directly against Polygon Amoy testnet contract.
        </p>
      </div>

      {loading ? (
        <Card className="p-8 text-center space-y-3">
          <span className="animate-spin text-2xl block">⏳</span>
          <p className="text-sm font-mono text-ink-muted">Querying Polygon Amoy Smart Contract...</p>
        </Card>
      ) : verification ? (
        <Card className={`border-2 ${verification.isValid ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-rose-500/50 bg-rose-500/5'}`}>
          <CardHeader className="text-center pb-2">
            <span className="text-4xl block">{verification.isValid ? '✅' : '❌'}</span>
            <h2 className="text-2xl font-bold font-inktrap text-ink mt-2">
              {verification.isValid ? 'VERIFIED ON-CHAIN' : 'VERIFICATION FAILED'}
            </h2>
            <p className="text-xs text-ink-muted">{verification.message}</p>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 border-t border-border/50 text-xs font-mono">
            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-ink-muted">Token ID:</span>
              <span className="font-bold text-ink">#{tokenId}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-ink-muted">Credential Type:</span>
              <span className="font-bold text-accent">{verification.credentialType || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-ink-muted">Recipient Wallet:</span>
              <span className="font-bold text-ink truncate max-w-[200px]">{verification.recipient || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-ink-muted">Achievement Hash:</span>
              <span className="font-bold text-ink truncate max-w-[200px]">{verification.achievementHash || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-ink-muted">Issued Timestamp:</span>
              <span className="font-bold text-ink">{verification.issuedAt || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-ink-muted">Network:</span>
              <span className="font-bold text-emerald-400">{verification.networkName}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-ink-muted">Contract Address:</span>
              <span className="font-bold text-ink truncate max-w-[200px]">{verification.contractAddress}</span>
            </div>

            {verification.explorerUrl && (
              <div className="pt-2 text-center">
                <a
                  href={verification.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline font-bold text-xs"
                >
                  View Token on Polygon Amoy Explorer ↗
                </a>
              </div>
            )}
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
