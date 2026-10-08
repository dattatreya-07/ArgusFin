'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { walletService, WalletState } from '@/lib/financeX/prove/walletService';
import { POLYGON_AMOY_CONFIG, getExplorerAddressUrl } from '@/lib/financeX/prove/network';
import { Card, CardHeader, CardContent, Button, Chip } from '@/components/ui';

export default function ProveDashboardPage() {
  const [wallet, setWallet] = useState<WalletState>(walletService.getState());
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const unsubscribe = walletService.listen((w) => setWallet(w));
    return () => unsubscribe();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await walletService.connect();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchNetwork = async () => {
    await walletService.switchToPolygonAmoy();
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-surface border border-border p-6 sm:p-10 shadow-soft space-y-6">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Polygon Amoy Testnet · Chain ID 80002
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-inktrap text-ink tracking-tight">
            Prove: Verifiable Trust & Cryptographic Proofs
          </h1>
          <p className="text-ink-muted text-base sm:text-lg leading-relaxed">
            FinanceX issues non-transferable Soulbound Credentials for learning milestones and anchors immutable evidence hashes for Shield fraud reports.
          </p>

          {/* Absolute Security Disclosure */}
          <div className="p-3.5 rounded-xl bg-surface-sunken border border-border text-xs text-ink-muted font-mono leading-relaxed">
            🔒 <strong>Absolute Privacy Guarantee:</strong> Zero personal data (names, emails, phone numbers, UPI IDs, raw messages) is ever placed on-chain. Only domain-separated SHA-256 digests and minimal token identifiers are recorded.
          </div>
        </div>

        {/* Wallet Connection Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-sunken border border-border">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-accent uppercase">Web3 Wallet Status</span>
            {wallet.isConnected ? (
              <div className="flex items-center gap-2 text-sm font-mono text-ink">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{walletService.truncateAddress(wallet.address)}</span>
                <a
                  href={getExplorerAddressUrl(wallet.address || '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline ml-2"
                >
                  View on Explorer ↗
                </a>
              </div>
            ) : (
              <p className="text-xs text-ink-muted">
                Wallet is optional for ordinary learning & protection. Connect wallet only to mint credentials or anchor evidence.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {wallet.isWrongNetwork && (
              <Button variant="danger" size="sm" onClick={handleSwitchNetwork}>
                Switch to Polygon Amoy
              </Button>
            )}
            {!wallet.isConnected ? (
              <Button variant="primary" size="md" onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            ) : (
              <Chip icon={<span>Polygon Amoy</span>}>Connected</Chip>
            )}
          </div>
        </div>
      </div>

      {/* 3 Prove Subsystem Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Credentials */}
        <Card className="flex flex-col justify-between hover:border-accent/60 transition-all">
          <CardHeader>
            <span className="text-3xl">📜</span>
            <h2 className="text-xl font-bold font-inktrap text-ink mt-2">Soulbound Credentials</h2>
            <p className="text-xs text-ink-muted leading-relaxed mt-1">
              Earn non-transferable ERC-721 Soulbound Tokens (SBTs) on Polygon Amoy upon completing FinanceX Academy tracks.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/prove/credentials">
              <Button variant="secondary" className="w-full justify-between">
                <span>View & Claim Credentials</span>
                <span>→</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Card 2: Evidence Proofs */}
        <Card className="flex flex-col justify-between hover:border-accent/60 transition-all">
          <CardHeader>
            <span className="text-3xl">⚓</span>
            <h2 className="text-xl font-bold font-inktrap text-ink mt-2">Evidence Hash Anchors</h2>
            <p className="text-xs text-ink-muted leading-relaxed mt-1">
              Anchor SHA-256 evidence digests of ArgusFin Shield fraud reports to establish tamper-evident timestamp proof.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/report">
              <Button variant="secondary" className="w-full justify-between">
                <span>Anchor Report Evidence</span>
                <span>→</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Card 3: Scam Registry */}
        <Card className="flex flex-col justify-between hover:border-accent/60 transition-all">
          <CardHeader>
            <span className="text-3xl">🛡️</span>
            <h2 className="text-xl font-bold font-inktrap text-ink mt-2">Neutral ScamRegistry</h2>
            <p className="text-xs text-ink-muted leading-relaxed mt-1">
              Query or verify neutral reported scam identifier digests (URLs, Handles) against on-chain proof registries.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/check">
              <Button variant="secondary" className="w-full justify-between">
                <span>Scan & Query Registry</span>
                <span>→</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Honest Empty States Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-inktrap text-ink">Recent On-Chain Activity</h2>
        <div className="p-8 rounded-2xl bg-surface border border-border text-center space-y-3">
          <span className="text-3xl block">🔗</span>
          <h3 className="text-base font-bold text-ink">No Blockchain Proofs Minted Yet</h3>
          <p className="text-xs text-ink-muted max-w-md mx-auto">
            Complete a FinanceX Academy track to become eligible for your first Soulbound Credential, or anchor an ArgusFin Shield report.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/learn">
              <Button variant="primary" size="sm">Explore Academy Tracks</Button>
            </Link>
            <Link href="/check">
              <Button variant="secondary" size="sm">ArgusFin Shield Scan</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
