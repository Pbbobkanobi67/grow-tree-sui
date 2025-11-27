'use client';

import { ConnectButton } from '@mysten/dapp-kit';
import { useQueryClient } from '@tanstack/react-query';
import { TreeVisualization } from '@/components/TreeVisualization';
import { WaterButton } from '@/components/WaterButton';
import { GameStats } from '@/components/GameStats';
import { useGameState, useGameConfig } from '@/hooks/useGameState';
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
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">ðŸŒ³</span>
            <span className="font-bold text-xl">Grow Tree</span>
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {NETWORK}
            </span>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!isConfigured ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">ðŸŒ³</div>
            <h1 className="text-3xl font-bold mb-4">Setup Required</h1>
            <p className="text-gray-600 mb-8">
              Deploy the contract and set environment variables.
            </p>
            <div className="bg-gray-100 rounded-xl p-6 max-w-lg mx-auto text-left font-mono text-sm">
              <div>NEXT_PUBLIC_PACKAGE_ID=0x...</div>
              <div>NEXT_PUBLIC_GAME_CONFIG_ID=0x...</div>
              <div>NEXT_PUBLIC_TREE_GAME_ID=0x...</div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left - Tree */}
            <div className="space-y-6">
              <TreeVisualization
                phase={gameState?.phase || 1}
                phaseProgress={gameState?.phaseProgress || 0}
              />
              <div className="flex justify-center">
                <WaterButton
                  waterCost={gameConfig?.waterCost || BigInt(50000000)}
                  disabled={gameConfig?.isPaused}
                  onSuccess={handleSuccess}
                />
              </div>

              {/* How to Play */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-4">ðŸŽ® How to Play</h3>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li>1ï¸âƒ£ Connect your SUI wallet</li>
                  <li>2ï¸âƒ£ Click "Water Tree" to grow it</li>
                  <li>3ï¸âƒ£ Watch the tree progress through phases</li>
                  <li>ðŸ† <strong>Complete the tree to win 50%!</strong></li>
                </ol>
              </div>
            </div>

            {/* Right - Stats */}
            <GameStats gameState={gameState} gameConfig={gameConfig} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 text-center text-gray-500">
        <p>ðŸŒ³ Grow Tree SUI - Built on SUI Blockchain</p>
      </footer>
    </main>
  );
}
