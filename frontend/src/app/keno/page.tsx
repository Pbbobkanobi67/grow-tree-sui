'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { KenoGame } from '@/components/KenoGame';

export default function KenoPage() {
  const [balance, setBalance] = useState(1000);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [totalWon, setTotalWon] = useState(0);

  const handleBalanceChange = (delta: number) => {
    setBalance(prev => prev + delta);
    if (delta < 0) {
      // Bet placed
      setGamesPlayed(prev => prev + 1);
    } else {
      // Win
      setTotalWon(prev => prev + delta);
    }
  };

  const addFunds = () => {
    setBalance(prev => prev + 500);
  };

  return (
    <main className="min-h-screen">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-glow mb-2">
            <span className="text-amber-400">Acorn</span>{' '}
            <span className="text-forest-300">Keno</span>
          </h1>
          <p className="text-forest-400">
            Pick your lucky acorns and watch the forest reveal your fortune!
          </p>
        </motion.div>

        {/* Game */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <KenoGame balance={balance} onBalanceChange={handleBalanceChange} />
        </motion.div>

        {/* Stats & Info */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Session Stats */}
          <div className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50">
            <h3 className="font-bold text-forest-300 mb-3">Session Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-forest-400">Games Played</span>
                <span className="text-forest-200">{gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-forest-400">Total Won</span>
                <span className={totalWon > 0 ? 'text-green-400' : 'text-forest-200'}>{totalWon.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-forest-400">Net Profit</span>
                <span className={balance - 1000 > 0 ? 'text-green-400' : balance - 1000 < 0 ? 'text-red-400' : 'text-forest-200'}>
                  {balance - 1000 > 0 ? '+' : ''}{(balance - 1000).toLocaleString()}
                </span>
              </div>
            </div>
            {balance < 10 && (
              <motion.button
                onClick={addFunds}
                className="w-full mt-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                + Add 500 $TREE
              </motion.button>
            )}
          </div>

          {/* How to Play */}
          <div className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50">
            <h3 className="font-bold text-forest-300 mb-3">How to Play</h3>
            <ul className="space-y-2 text-sm text-forest-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-400">1.</span>
                <span>Pick 1-5 acorns from the grid</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">2.</span>
                <span>Choose your bet amount</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">3.</span>
                <span>Click DRAW to reveal 10 winning acorns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">4.</span>
                <span>Match acorns to win up to 100x!</span>
              </li>
            </ul>
          </div>

          {/* Full Payout Table */}
          <div className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50">
            <h3 className="font-bold text-forest-300 mb-3">Max Payouts</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-forest-400 border-b border-forest-700 pb-1 mb-1">
                <span>Picks</span>
                <span>Max Win</span>
              </div>
              {[
                { picks: 1, max: '3.5x' },
                { picks: 2, max: '9x' },
                { picks: 3, max: '25x' },
                { picks: 4, max: '50x' },
                { picks: 5, max: '100x' },
              ].map(({ picks, max }) => (
                <div key={picks} className="flex justify-between">
                  <span className="text-forest-400">{picks} acorn{picks > 1 ? 's' : ''}</span>
                  <span className="text-gold-400 font-medium">{max}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-forest-600/50 mt-16 py-8 text-center text-forest-400">
        <p>Acorn Keno - Part of Grove Games | Play Money Only</p>
      </footer>
    </main>
  );
}
