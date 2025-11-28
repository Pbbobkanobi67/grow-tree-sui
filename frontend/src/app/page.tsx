'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { useQueryClient } from '@tanstack/react-query';
import { TreeVisualization } from '@/components/TreeVisualization';
import { WaterButton } from '@/components/WaterButton';
import { GameStats } from '@/components/GameStats';
import { WinnerCelebration } from '@/components/WinnerCelebration';
import { useGameState, useGameConfig } from '@/hooks/useGameState';
import { FaucetButton } from '@/components/FaucetButton';
import { LiveFeed } from '@/components/LiveFeed';
import { DevWalletSelector, useDevWallet } from '@/components/DevWalletSelector';
import { CONTRACT_CONFIG, NETWORK, formatSui } from '@/lib/constants';
import { DEV_MODE, startNewRound } from '@/lib/devMode';

export default function Home() {
  const queryClient = useQueryClient();
  const [showCelebration, setShowCelebration] = useState(false);

  // Real wallet (only used when not in DEV_MODE)
  const realAccount = useCurrentAccount();

  // Dev wallet (only used in DEV_MODE)
  const { selectedWallet: devWallet, balance: devBalance } = useDevWallet();

  // Use dev wallet in DEV_MODE, otherwise use real wallet
  const activeAddress = DEV_MODE ? devWallet?.address : realAccount?.address;
  const isConnected = DEV_MODE ? !!devWallet : !!realAccount;

  const { data: gameState, isLoading: stateLoading } = useGameState();
  const { data: gameConfig, isLoading: configLoading } = useGameConfig();

  // Detect game completion and show celebration
  useEffect(() => {
    if (gameState?.isComplete && !showCelebration) {
      setShowCelebration(true);
    }
  }, [gameState?.isComplete, showCelebration]);

  // Fetch real SUI balance (only when not in DEV_MODE)
  const { data: balanceData } = useSuiClientQuery(
    'getBalance',
    { owner: realAccount?.address || '', coinType: '0x2::sui::SUI' },
    { enabled: !DEV_MODE && !!realAccount?.address }
  );

  // Display balance based on mode
  const displayBalance = DEV_MODE
    ? formatSui(devBalance)
    : balanceData?.totalBalance
      ? (Number(balanceData.totalBalance) / 1_000_000_000).toFixed(2) + ' SUI'
      : '0.00 SUI';

  const isLoading = stateLoading || configLoading;
  const isConfigured = CONTRACT_CONFIG.PACKAGE_ID && CONTRACT_CONFIG.TREE_GAME_ID;

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['gameState'] });
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    if (DEV_MODE) {
      startNewRound();
      queryClient.invalidateQueries({ queryKey: ['gameState'] });
    }
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-forest-900/80 border-b border-forest-600/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-2xl text-glow"><span className="text-forest-300">GROVE</span>{' '}<span className="text-blue-400">GAMES</span></span>
            {DEV_MODE ? (
              <span className="text-xs px-2 py-1 bg-purple-600 text-purple-100 rounded-full border border-purple-400 animate-pulse">
                DEV MODE
              </span>
            ) : (
              <span className="text-xs px-2 py-1 bg-forest-700 text-forest-200 rounded-full border border-forest-600">
                {NETWORK}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/docs"
              className="px-4 py-2 text-sm font-medium text-forest-200 bg-forest-700 hover:bg-forest-600 border border-forest-600 rounded-full transition-all"
            >
              Docs
            </Link>
            {/* Show DevWalletSelector in DEV_MODE, otherwise show real ConnectButton */}
            {DEV_MODE ? (
              <DevWalletSelector />
            ) : (
              <>
                {realAccount && (
                  <div className="px-3 py-1.5 text-sm font-medium text-blue-300 bg-blue-900/30 border border-blue-700/50 rounded-full">
                    {displayBalance}
                  </div>
                )}
                <ConnectButton />
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!isConfigured && !DEV_MODE ? (
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold mb-4 text-glow text-forest-300">Setup Required</h1>
            <p className="text-forest-200 mb-8">
              Deploy the contract and set environment variables.
            </p>
            <div className="bg-forest-800/50 rounded-xl p-6 max-w-lg mx-auto text-left font-mono text-sm border border-forest-600/50 card-glow">
              <div className="text-forest-300">NEXT_PUBLIC_PACKAGE_ID=0x...</div>
              <div className="text-forest-300">NEXT_PUBLIC_GAME_CONFIG_ID=0x...</div>
              <div className="text-forest-300">NEXT_PUBLIC_TREE_GAME_ID=0x...</div>
            </div>
          </div>
        ) : isLoading && !DEV_MODE ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-forest-300 border-t-transparent" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left - Tree */}
            <div className="space-y-6">
              <TreeVisualization
                phase={gameState?.phase || 2}
                phaseProgress={gameState?.phaseProgress || 50}
              />
              {/* Water the Tree Section */}
              <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50 card-glow">
                <h3 className="font-bold text-lg mb-4 text-forest-300 text-center">Water the Tree</h3>

                {/* Show connect prompt if not connected */}
                {!isConnected ? (
                  <div className="text-center py-4">
                    <p className="text-forest-400 mb-4">Connect a wallet to water the tree</p>
                    {DEV_MODE ? (
                      <DevWalletSelector />
                    ) : (
                      <ConnectButton />
                    )}
                  </div>
                ) : (
                  <WaterButton
                    waterCost={gameConfig?.waterCost || BigInt(50000000)}
                    disabled={gameConfig?.isPaused}
                    onSuccess={handleSuccess}
                    phase={gameState?.phase || 1}
                  />
                )}

                {!DEV_MODE && (
                  <div className="mt-4 pt-4 border-t border-forest-600/30 flex justify-center">
                    <FaucetButton />
                  </div>
                )}
              </div>

              {/* How to Play + Mascot */}
              <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50 card-glow">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-4 text-forest-300">How to Play</h3>
                    <ol className="space-y-2 text-sm text-forest-200">
                      <li>1. {DEV_MODE ? 'Select a Dev Wallet' : 'Connect your SUI wallet'}</li>
                      <li>2. Click "Water Tree" to grow it</li>
                      <li>3. Watch the tree progress through phases</li>
                      <li className="text-gold-400 font-semibold">Complete the tree to win 50%!</li>
                    </ol>
                  </div>
                  <div className="flex-shrink-0">
                    <Image
                      src="/images/hero.png"
                      alt="$TREE Mascot"
                      width={120}
                      height={150}
                      className="drop-shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Stats & Feed */}
            <div className="space-y-4">
              <GameStats gameState={gameState ?? null} gameConfig={gameConfig ?? null} />
              <LiveFeed />

              {/* Dev Mode Info Panel */}
              {DEV_MODE && (
                <div className="bg-purple-900/30 rounded-2xl p-4 border border-purple-500/50">
                  <h4 className="font-bold text-sm text-purple-300 mb-2">Dev Mode Active</h4>
                  <ul className="text-xs text-purple-200 space-y-1">
                    <li>• Using mock blockchain - no real transactions</li>
                    <li>• 6 test wallets with 10M SUI each</li>
                    <li>• Click +1K in header for more funds</li>
                    <li>• Set NEXT_PUBLIC_DEV_MODE=false for real blockchain</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-forest-600/50 mt-16 py-8 text-center text-forest-400">
        <p>
          Grove Games - Built on SUI Blockchain |{' '}
          <a
            href="https://tree-token.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest-300 hover:text-forest-200 underline transition-colors"
          >
            TREE Token
          </a>
        </p>
      </footer>

      {/* Winner Celebration Modal */}
      <WinnerCelebration
        isVisible={showCelebration}
        prizePool={gameState?.prizePool || BigInt(0)}
        winnerAddress={gameState?.winner || ''}
        winnerContribution={gameState?.winnerContribution || BigInt(0)}
        totalContributions={gameState?.totalContributions || BigInt(0)}
        onClose={handleCloseCelebration}
      />
    </main>
  );
}
