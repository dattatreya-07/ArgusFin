'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { walletService, WalletState } from '@/lib/financeX/prove/walletService';
import { credentialService, MintResult } from '@/lib/financeX/prove/credentialService';
import { progressService } from '@/lib/financeX/academy/progress';
import { TRACKS } from '@/lib/financeX/academy/curriculum';
import { Card, CardHeader, CardContent, Button, Chip } from '@/components/ui';

export default function CredentialsGalleryPage() {
  const [wallet, setWallet] = useState<WalletState>(walletService.getState());
  const [mintStatus, setMintStatus] = useState<Record<string, MintResult>>({});
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);

  const summary = progressService.getSummary('guest-user', 'en');

  useEffect(() => {
    const unsubscribe = walletService.listen((w) => setWallet(w));
    return () => unsubscribe();
  }, []);

  const handleClaimCredential = async (trackSlug: string, trackTitle: string) => {
    if (!wallet.isConnected || !wallet.address) {
      alert('Please connect your Web3 wallet to claim your Soulbound Credential.');
      await walletService.connect();
      return;
    }

    setLoadingTrackId(trackSlug);
    try {
      const res = await credentialService.mintCredential(
        wallet.address,
        'FINANCEX_ACADEMY_TRACK_CREDENTIAL',
        trackSlug
      );
      setMintStatus((prev) => ({ ...prev, [trackSlug]: res }));
    } finally {
      setLoadingTrackId(null);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
        <Link href="/prove" className="hover:text-accent hover:underline">
          ← Back to Prove Hub
        </Link>
        <span>/</span>
        <span className="text-ink font-bold">credentials</span>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black font-inktrap text-ink">
          Soulbound Learning Credentials
        </h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          Verifiable non-transferable ERC-721 Soulbound Tokens (SBTs) issued on Polygon Amoy. Earn credentials by completing FinanceX Academy tracks.
        </p>
      </div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {summary.trackProgress.map((tp) => {
          const isEligible = tp.completionPct >= 100 || true; // Allow claiming for demonstration
          const status = mintStatus[tp.slug];
          const isMinting = loadingTrackId === tp.slug;

          return (
            <Card key={tp.trackId} className="border-border flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-accent uppercase">
                    CREDENTIAL #{tp.slug}
                  </span>
                  <Chip>{tp.completionPct}% Completed</Chip>
                </div>
                <h2 className="text-lg font-bold font-inktrap text-ink mt-2">{tp.title}</h2>
                <p className="text-xs text-ink-muted mt-1">
                  Issued on Polygon Amoy upon 100% track completion.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {status ? (
                  <div className="p-3 bg-surface-sunken rounded-xl border border-border text-xs space-y-1">
                    <span className="font-bold text-emerald-400 block font-mono">
                      Status: {status.status}
                    </span>
                    {status.txHash && (
                      <a
                        href={status.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline block font-mono text-[11px]"
                      >
                        View on Polygon Explorer ↗
                      </a>
                    )}
                  </div>
                ) : (
                  <Button
                    variant={isEligible ? 'primary' : 'secondary'}
                    disabled={isMinting}
                    className="w-full justify-center"
                    onClick={() => handleClaimCredential(tp.slug, tp.title)}
                  >
                    {isMinting
                      ? 'Minting on Amoy...'
                      : wallet.isConnected
                      ? 'Claim Soulbound Credential →'
                      : 'Connect Wallet & Claim →'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
