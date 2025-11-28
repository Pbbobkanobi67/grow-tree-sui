'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@mysten/dapp-kit';
import { useQueryClient } from '@tanstack/react-query';
import { TreeVisualization } from '@/components/TreeVisualization';
import { WaterButton } from '@/components/WaterButton';
import { GameStats } from '@/components/GameStats';
import { useGameState, useGameConfig } from '@/hooks/useGameState';
import { FaucetButton } from '@/components/FaucetButton';
import { CONTRACT_CONFIG, NETWORK } from '@/lib/constants';

export default function Home() {
  const queryClient = useQueryClient();
  const { data: gameState, isLoading: stateLoading } = useGameState();
  const { data: gameConfig, isLoading: configLoading } = useGameConfig();

  const isLoading = stateLoading || configLoading;
  const isConfigured = CONTRACT_CONFIG.PACKAGE_ID && CONTRACT_CONFIG.TREE_GAME_ID;

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['gameState'] });
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-forest-900/80 border-b border-forest-600/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-2xl text-glow"><span className="text-forest-300">GROVE</span>{' '}<span className="text-blue-400">GAMES</span></span>
            <span className="text-xs px-2 py-1 bg-forest-700 text-forest-200 rounded-full border border-forest-600">
              {NETWORK}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="text-sm text-forest-300 hover:text-forest-200 transition-colors"
            >
              Docs
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!isConfigured ? (
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
        ) : isLoading ? (
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
              <div className="flex flex-col items-center gap-4">
                <WaterButton
                  waterCost={gameConfig?.waterCost || BigInt(50000000)}
                  disabled={gameConfig?.isPaused}
                  onSuccess={handleSuccess}
                />
                <FaucetButton />
              </div>

              {/* How to Play + Mascot */}
              <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50 card-glow">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-4 text-forest-300">How to Play</h3>
                    <ol className="space-y-2 text-sm text-forest-200">
                      <li>1. Connect your SUI wallet</li>
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

            {/* Right - Stats */}
            <GameStats gameState={gameState ?? null} gameConfig={gameConfig ?? null} />
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
    </main>
  );
}
