'use client';

import { useState } from 'react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { FortuneWheel } from '@/components/FortuneWheel';
import { DevWalletSelector, useDevWallet } from '@/components/DevWalletSelector';
import { DEV_MODE } from '@/lib/devMode';
import { formatSui } from '@/lib/constants';

// Bet options in MIST (1 SUI = 1,000,000,000 MIST)
const BET_OPTIONS = [
  { label: '0.1', value: BigInt(100000000) },
  { label: '0.25', value: BigInt(250000000) },
  { label: '0.5', value: BigInt(500000000) },
  { label: '1', value: BigInt(1000000000) },
  { label: '5', value: BigInt(5000000000) },
  { label: '10', value: BigInt(10000000000) },
  { label: '25', value: BigInt(25000000000) },
  { label: '50', value: BigInt(50000000000) },
];

export default function FortunePage() {
  const [selectedBet, setSelectedBet] = useState(BET_OPTIONS[0].value);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<{ multiplier: number; amount: bigint } | null>(null);
  const [history, setHistory] = useState<{ multiplier: number; amount: bigint; bet: bigint; profit: bigint }[]>([]);

  // Real wallet
  const realAccount = useCurrentAccount();

  // Dev wallet
  const { selectedWallet: devWallet, balance: devBalance, adjustBalance } = useDevWallet();

  // Use dev wallet in DEV_MODE
  const activeAddress = DEV_MODE ? devWallet?.address : realAccount?.address;
  const isConnected = DEV_MODE ? !!devWallet : !!realAccount;
  const balance = DEV_MODE ? devBalance : BigInt(0);

  const handleSpin = (multiplier: number, winAmount: bigint) => {
    const profit = winAmount - selectedBet;

    setLastWin({ multiplier, amount: winAmount });

    // Update history
    setHistory(prev => [
      { multiplier, amount: winAmount, bet: selectedBet, profit },
      ...prev.slice(0, 9), // Keep last 10
    ]);

    // Update balance in dev mode (add back winnings)
    if (DEV_MODE) {
      adjustBalance(winAmount);
    }
  };

  const handleSpinStart = () => {
    // Deduct bet when starting spin
    if (DEV_MODE) {
      adjustBalance(-selectedBet);
    }
  };

  const canSpin = isConnected && !isSpinning && (DEV_MODE ? balance >= selectedBet : true);

  return (
    <main className="min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-glow mb-3">
            <span className="text-gold-400">Tree</span>{' '}
            <span className="text-forest-300">of</span>{' '}
            <span className="text-amber-400">Fortune</span>
          </h1>
          <p className="text-lg text-forest-400">Spin the wheel and test your luck!</p>
        </motion.div>

        {/* Main Content - Wheel Centered */}
        <div className="flex flex-col items-center mb-12">
          {!isConnected ? (
            <div className="text-center py-12">
              <p className="text-forest-400 mb-6 text-lg">Connect a wallet to spin</p>
              {DEV_MODE ? <DevWalletSelector /> : <ConnectButton />}
            </div>
          ) : (
            <>
              {/* Balance Display */}
              {DEV_MODE && (
                <div className="mb-8 text-center">
                  <div className="text-sm text-forest-400 mb-1">Your Balance</div>
                  <div className="text-3xl font-bold text-gold-400">{formatSui(balance)}</div>
                </div>
              )}

              {/* Wheel */}
              <FortuneWheel
                betAmount={selectedBet}
                onSpin={handleSpin}
                disabled={!canSpin}
                isSpinning={isSpinning}
                setIsSpinning={(spinning) => {
                  if (spinning) handleSpinStart();
                  setIsSpinning(spinning);
                }}
              />

              {/* Bet Selection - Below Wheel */}
              <div className="mt-10 w-full max-w-xl">
                <h3 className="font-bold text-forest-300 mb-4 text-center text-lg">Select Your Bet (SUI)</h3>
                <div className="grid grid-cols-4 gap-2">
                  {BET_OPTIONS.map((option) => (
                    <motion.button
                      key={option.label}
                      onClick={() => !isSpinning && setSelectedBet(option.value)}
                      disabled={isSpinning}
                      className={`px-3 py-3 rounded-xl font-bold text-base transition-all ${
                        selectedBet === option.value
                          ? 'bg-gold-500 text-forest-900 shadow-lg shadow-gold-500/30'
                          : 'bg-forest-800/80 text-forest-200 hover:bg-forest-700 border border-forest-600/50'
                      } ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
                      whileHover={!isSpinning ? { scale: 1.05 } : {}}
                      whileTap={!isSpinning ? { scale: 0.95 } : {}}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
                <div className="text-center mt-4 text-forest-500">
                  Max Win: <span className="text-gold-400 font-bold">{formatSui(selectedBet * BigInt(10))}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Section - Info Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Last Win */}
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50">
            <h3 className="font-bold text-forest-300 mb-4 text-lg">Last Result</h3>
            <AnimatePresence mode="wait">
              {lastWin ? (
                <motion.div
                  key={`${lastWin.multiplier}-${Date.now()}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`rounded-xl p-6 text-center ${
                    lastWin.multiplier >= 5
                      ? 'bg-gold-500/20 border border-gold-500'
                      : lastWin.multiplier >= 2
                        ? 'bg-green-500/20 border border-green-500'
                        : lastWin.multiplier >= 1
                          ? 'bg-blue-500/20 border border-blue-500'
                          : 'bg-red-500/20 border border-red-500'
                  }`}
                >
                  <div className="text-4xl font-bold text-white mb-2">{lastWin.multiplier}x</div>
                  <div className={`text-xl font-medium ${
                    lastWin.multiplier >= 1 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {lastWin.multiplier >= 1 ? 'WIN' : 'LOSS'}: {formatSui(lastWin.amount)}
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-xl p-6 text-center bg-forest-900/50 border border-forest-700">
                  <div className="text-2xl text-forest-600">---</div>
                  <div className="text-forest-500 mt-2">Spin to play!</div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Multipliers */}
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50">
            <h3 className="font-bold text-forest-300 mb-4 text-lg">Multipliers & Odds</h3>
            <div className="space-y-2">
              {[
                { mult: 'BUST', chance: '30%', color: 'text-red-500 font-bold' },
                { mult: '0.5x', chance: '25%', color: 'text-gray-400' },
                { mult: '1x', chance: '18%', color: 'text-gray-300' },
                { mult: '1.5x', chance: '12%', color: 'text-green-400' },
                { mult: '2x', chance: '8%', color: 'text-blue-400' },
                { mult: '3x', chance: '4%', color: 'text-purple-400' },
                { mult: '5x', chance: '2%', color: 'text-pink-400' },
                { mult: '10x', chance: '1%', color: 'text-gold-400 font-bold' },
              ].map(({ mult, chance, color }) => (
                <div key={mult} className={`flex justify-between py-1 ${color}`}>
                  <span>{mult}</span>
                  <span>{chance}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-forest-700 text-xs text-forest-500">
              RTP: ~96.5% | House edge: ~3.5%
            </div>
          </div>

          {/* History */}
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50">
            <h3 className="font-bold text-forest-300 mb-4 text-lg">Recent Spins</h3>
            {history.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎰</div>
                <p className="text-forest-500">No spins yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.map((spin, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                      spin.profit >= BigInt(0) ? 'bg-green-900/30' : 'bg-red-900/30'
                    }`}
                  >
                    <span className="text-forest-300 font-medium">{spin.multiplier}x</span>
                    <span className="text-forest-500">{formatSui(spin.bet)}</span>
                    <span className={`font-medium ${spin.profit >= BigInt(0) ? 'text-green-400' : 'text-red-400'}`}>
                      {spin.profit >= BigInt(0) ? '+' : ''}{formatSui(spin.profit)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* How to Play */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 bg-forest-800/30 rounded-2xl px-8 py-4 border border-forest-700/50">
            <div className="flex items-center gap-2">
              <span className="text-2xl">1️⃣</span>
              <span className="text-forest-300">Select bet</span>
            </div>
            <div className="text-forest-600">→</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">2️⃣</span>
              <span className="text-forest-300">Click SPIN</span>
            </div>
            <div className="text-forest-600">→</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">3️⃣</span>
              <span className="text-forest-300">Win up to 10x!</span>
            </div>
          </div>
          <p className="text-forest-600 text-sm mt-4">RTP: 96.5% | Play responsibly</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-forest-600/50 mt-16 py-8 text-center text-forest-400">
        <p>Tree of Fortune - Part of Grove Games</p>
      </footer>
    </main>
  );
}
