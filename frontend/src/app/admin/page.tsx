'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { motion } from 'framer-motion';
import { useGameState, useGameConfig } from '@/hooks/useGameState';
import { formatSui, formatAddress } from '@/lib/constants';
import { DEV_MODE, startNewRound, resetMockState, getMockGameState } from '@/lib/devMode';
import { useDevWallet } from '@/components/DevWalletSelector';
import { useQueryClient } from '@tanstack/react-query';

// Admin wallet addresses - add your wallet here
const ADMIN_WALLETS = [
  '0xdev1111111111111111111111111111111111111111111111111111111111111111', // Dev wallet 1 for testing
  // Add your real admin wallet address here when going live
];

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [actionLog, setActionLog] = useState<string[]>([]);

  // Real wallet
  const realAccount = useCurrentAccount();

  // Dev wallet
  const { selectedWallet: devWallet } = useDevWallet();

  // Use appropriate account based on mode
  const activeAddress = DEV_MODE ? devWallet?.address : realAccount?.address;
  const isAdmin = activeAddress && ADMIN_WALLETS.includes(activeAddress);

  const { data: gameState } = useGameState();
  const { data: gameConfig } = useGameConfig();

  const addLog = (message: string) => {
    setActionLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 20));
  };

  const handlePauseGame = () => {
    if (DEV_MODE) {
      addLog('Game paused (mock)');
      // In real mode, this would call the smart contract
    }
  };

  const handleUnpauseGame = () => {
    if (DEV_MODE) {
      addLog('Game unpaused (mock)');
    }
  };

  const handleStartNewRound = () => {
    if (DEV_MODE) {
      startNewRound();
      queryClient.invalidateQueries({ queryKey: ['gameState'] });
      addLog('New round started');
    }
  };

  const handleResetGame = () => {
    if (DEV_MODE) {
      resetMockState();
      queryClient.invalidateQueries({ queryKey: ['gameState'] });
      addLog('Game reset to initial state');
    }
  };

  const handleDistributePrizes = () => {
    if (DEV_MODE) {
      addLog('Prizes distributed (mock) - in real mode this happens automatically');
    }
  };

  // Get mock state for additional info in dev mode
  const mockState = DEV_MODE ? getMockGameState() : null;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-forest-900/80 border-b border-forest-600/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-2xl text-glow">
              <span className="text-forest-300">GROVE</span>{' '}<span className="text-blue-400">GAMES</span>
            </Link>
            <span className="text-xs px-2 py-1 bg-red-600 text-white rounded-full">
              ADMIN
            </span>
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-full text-sm font-medium bg-forest-700 text-forest-200 border border-forest-600 hover:bg-forest-600 transition-all"
          >
            Back to Game
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Access Check */}
        {!activeAddress ? (
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-forest-300 mb-4">Admin Access Required</h1>
            <p className="text-forest-400">Please connect your wallet to access the admin panel.</p>
          </div>
        ) : !isAdmin ? (
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
            <p className="text-forest-400 mb-2">Your wallet is not authorized for admin access.</p>
            <p className="text-forest-500 text-sm font-mono">{formatAddress(activeAddress)}</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-forest-300 mb-8">Admin Dashboard</h1>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Game Stats */}
              <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50">
                <h2 className="text-xl font-bold text-forest-300 mb-4">Game Statistics</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-forest-700">
                    <span className="text-forest-400">Status</span>
                    <span className={`font-bold ${gameConfig?.isPaused ? 'text-red-400' : 'text-green-400'}`}>
                      {gameConfig?.isPaused ? 'PAUSED' : 'ACTIVE'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-forest-700">
                    <span className="text-forest-400">Round</span>
                    <span className="text-forest-200 font-bold">#{gameState?.round || 1}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-forest-700">
                    <span className="text-forest-400">Phase</span>
                    <span className="text-forest-200">{gameState?.phase || 1} / 4</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-forest-700">
                    <span className="text-forest-400">Phase Progress</span>
                    <span className="text-forest-200">{gameState?.phaseProgress || 0}%</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-forest-700">
                    <span className="text-forest-400">Prize Pool</span>
                    <span className="text-gold-400 font-bold">{formatSui(gameState?.prizePool || BigInt(0))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-forest-700">
                    <span className="text-forest-400">Total Waterings</span>
                    <span className="text-forest-200">{gameState?.totalWaterings || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-forest-700">
                    <span className="text-forest-400">Unique Players</span>
                    <span className="text-forest-200">{gameState?.uniquePlayers || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-forest-700">
                    <span className="text-forest-400">Total Contributions</span>
                    <span className="text-forest-200">{formatSui(gameState?.totalContributions || BigInt(0))}</span>
                  </div>
                  {DEV_MODE && mockState && (
                    <>
                      <div className="flex justify-between py-2 border-b border-forest-700">
                        <span className="text-purple-400">Completion Threshold</span>
                        <span className="text-purple-300">{mockState.completionThreshold}%</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-purple-400">Game Complete</span>
                        <span className={mockState.isComplete ? 'text-green-400' : 'text-forest-400'}>
                          {mockState.isComplete ? 'YES' : 'NO'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Top Contributors */}
              <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50">
                <h2 className="text-xl font-bold text-forest-300 mb-4">Top Contributors</h2>
                <div className="space-y-3">
                  {[
                    { rank: '1st', addr: gameState?.top1Address, amount: gameState?.top1Amount, color: 'text-gold-400' },
                    { rank: '2nd', addr: gameState?.top2Address, amount: gameState?.top2Amount, color: 'text-gray-300' },
                    { rank: '3rd', addr: gameState?.top3Address, amount: gameState?.top3Amount, color: 'text-orange-400' },
                  ].map(({ rank, addr, amount, color }) => (
                    <div key={rank} className="flex justify-between items-center py-2 border-b border-forest-700 last:border-0">
                      <span className={`font-bold ${color}`}>{rank}</span>
                      <span className="text-forest-400 font-mono text-sm">{addr ? formatAddress(addr) : '-'}</span>
                      <span className="text-forest-200">{formatSui(amount || BigInt(0))}</span>
                    </div>
                  ))}
                </div>

                {/* Prize Distribution Preview */}
                <h3 className="text-lg font-bold text-forest-300 mt-6 mb-3">Prize Distribution</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Final Waterer (40%)', amount: (gameState?.prizePool || BigInt(0)) * BigInt(40) / BigInt(100), color: 'text-gold-400' },
                    { label: 'Top Contributor (15%)', amount: (gameState?.prizePool || BigInt(0)) * BigInt(15) / BigInt(100), color: 'text-orange-400' },
                    { label: 'Random Player (5%)', amount: (gameState?.prizePool || BigInt(0)) * BigInt(5) / BigInt(100), color: 'text-purple-400' },
                    { label: 'Next Round (20%)', amount: (gameState?.prizePool || BigInt(0)) * BigInt(20) / BigInt(100), color: 'text-blue-400' },
                    { label: 'Treasury (10%)', amount: (gameState?.prizePool || BigInt(0)) * BigInt(10) / BigInt(100), color: 'text-green-400' },
                    { label: 'Dev & Ads (10%)', amount: (gameState?.prizePool || BigInt(0)) * BigInt(10) / BigInt(100), color: 'text-cyan-400' },
                  ].map(({ label, amount, color }) => (
                    <div key={label} className="flex justify-between">
                      <span className={color}>{label}</span>
                      <span className="text-forest-300">{formatSui(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Actions */}
              <div className="bg-forest-800/50 rounded-2xl p-6 border border-red-500/30">
                <h2 className="text-xl font-bold text-red-400 mb-4">Admin Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    onClick={handlePauseGame}
                    className="px-4 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Pause Game
                  </motion.button>
                  <motion.button
                    onClick={handleUnpauseGame}
                    className="px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Unpause Game
                  </motion.button>
                  <motion.button
                    onClick={handleStartNewRound}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start New Round
                  </motion.button>
                  <motion.button
                    onClick={handleDistributePrizes}
                    className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Distribute Prizes
                  </motion.button>
                  <motion.button
                    onClick={handleResetGame}
                    className="px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium col-span-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Reset Game (Dev Only)
                  </motion.button>
                </div>
                {DEV_MODE && (
                  <p className="text-xs text-purple-400 mt-3">
                    Dev Mode: Actions are simulated locally
                  </p>
                )}
              </div>

              {/* Action Log */}
              <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50">
                <h2 className="text-xl font-bold text-forest-300 mb-4">Action Log</h2>
                <div className="bg-forest-900/50 rounded-lg p-3 h-48 overflow-y-auto font-mono text-xs">
                  {actionLog.length === 0 ? (
                    <p className="text-forest-500">No actions yet...</p>
                  ) : (
                    actionLog.map((log, i) => (
                      <div key={i} className="text-forest-400 py-1 border-b border-forest-800 last:border-0">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Connected Wallet Info */}
            <div className="mt-6 p-4 bg-forest-800/30 rounded-xl border border-forest-700/50">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-forest-400">Connected as:</span>
                <span className="text-green-400 font-mono">{formatAddress(activeAddress)}</span>
                <span className="text-green-400">Admin</span>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
