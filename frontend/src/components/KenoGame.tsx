'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Payout tables based on picks (hits => multiplier)
const PAYOUT_TABLES: Record<number, Record<number, number>> = {
  1: { 1: 3.5 },
  2: { 1: 1, 2: 9 },
  3: { 2: 2, 3: 25 },
  4: { 2: 1, 3: 5, 4: 50 },
  5: { 2: 0.5, 3: 3, 4: 15, 5: 100 },
};

interface KenoGameProps {
  balance: number;
  onBalanceChange: (delta: number) => void;
}

export function KenoGame({ balance, onBalanceChange }: KenoGameProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set());
  const [drawnNumbers, setDrawnNumbers] = useState<Set<number>>(new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [betAmount, setBetAmount] = useState(1);
  const [lastResult, setLastResult] = useState<{ hits: number; payout: number } | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);

  const maxPicks = 5;
  const totalNumbers = 40;
  const drawCount = 10;

  const toggleNumber = (num: number) => {
    if (isDrawing) return;

    const newSelected = new Set(selectedNumbers);
    if (newSelected.has(num)) {
      newSelected.delete(num);
    } else if (newSelected.size < maxPicks) {
      newSelected.add(num);
    }
    setSelectedNumbers(newSelected);
    setDrawnNumbers(new Set());
    setLastResult(null);
    setRevealedCount(0);
  };

  const clearSelection = () => {
    if (isDrawing) return;
    setSelectedNumbers(new Set());
    setDrawnNumbers(new Set());
    setLastResult(null);
    setRevealedCount(0);
  };

  const quickPick = () => {
    if (isDrawing) return;
    const picks = new Set<number>();
    while (picks.size < maxPicks) {
      picks.add(Math.floor(Math.random() * totalNumbers) + 1);
    }
    setSelectedNumbers(picks);
    setDrawnNumbers(new Set());
    setLastResult(null);
    setRevealedCount(0);
  };

  const draw = useCallback(async () => {
    if (selectedNumbers.size === 0 || isDrawing || balance < betAmount) return;

    // Deduct bet
    onBalanceChange(-betAmount);
    setIsDrawing(true);
    setDrawnNumbers(new Set());
    setLastResult(null);
    setRevealedCount(0);

    // Generate 10 random numbers
    const drawn = new Set<number>();
    while (drawn.size < drawCount) {
      drawn.add(Math.floor(Math.random() * totalNumbers) + 1);
    }

    // Animate reveal one by one
    const drawnArray = Array.from(drawn);
    for (let i = 0; i < drawnArray.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setDrawnNumbers(new Set(drawnArray.slice(0, i + 1)));
      setRevealedCount(i + 1);
    }

    // Calculate hits and payout
    const hits = Array.from(selectedNumbers).filter(n => drawn.has(n)).length;
    const payoutTable = PAYOUT_TABLES[selectedNumbers.size];
    const multiplier = payoutTable[hits] || 0;
    const payout = Math.floor(betAmount * multiplier);

    // Add winnings
    if (payout > 0) {
      onBalanceChange(payout);
    }

    setLastResult({ hits, payout });
    setIsDrawing(false);
  }, [selectedNumbers, isDrawing, balance, betAmount, onBalanceChange]);

  const getNumberState = (num: number) => {
    const isSelected = selectedNumbers.has(num);
    const isDrawn = drawnNumbers.has(num);
    const isHit = isSelected && isDrawn;
    const isMiss = isSelected && !isDrawn && revealedCount === drawCount;

    return { isSelected, isDrawn, isHit, isMiss };
  };

  const currentPayoutTable = PAYOUT_TABLES[selectedNumbers.size] || {};

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Balance & Bet */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-sm text-forest-400">Balance</div>
          <div className="text-2xl font-bold text-gold-400">{balance.toLocaleString()} $TREE</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-forest-400">Bet:</span>
          {[1, 5, 10, 25, 50, 100].map((amt) => (
            <motion.button
              key={amt}
              onClick={() => !isDrawing && setBetAmount(amt)}
              disabled={isDrawing}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                betAmount === amt
                  ? 'bg-gold-500 text-forest-900'
                  : 'bg-forest-700 text-forest-300 hover:bg-forest-600'
              } ${isDrawing ? 'opacity-50 cursor-not-allowed' : ''}`}
              whileHover={!isDrawing ? { scale: 1.05 } : {}}
              whileTap={!isDrawing ? { scale: 0.95 } : {}}
            >
              {amt}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Acorn Grid */}
      <div className="bg-forest-800/50 rounded-2xl p-4 border border-forest-600/50 mb-4">
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: totalNumbers }, (_, i) => i + 1).map((num) => {
            const { isSelected, isDrawn, isHit, isMiss } = getNumberState(num);

            return (
              <motion.button
                key={num}
                onClick={() => toggleNumber(num)}
                disabled={isDrawing}
                className={`
                  relative aspect-square rounded-lg font-bold text-sm flex items-center justify-center
                  transition-all duration-200
                  ${isHit
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                    : isDrawn
                      ? 'bg-amber-600/80 text-white'
                      : isSelected
                        ? isMiss
                          ? 'bg-red-500/50 text-red-200 border-2 border-red-400'
                          : 'bg-amber-500 text-forest-900 border-2 border-amber-300'
                        : 'bg-forest-700/80 text-forest-300 hover:bg-forest-600 border border-forest-600'
                  }
                  ${isDrawing && !isDrawn ? 'opacity-50' : ''}
                `}
                whileHover={!isDrawing ? { scale: 1.1 } : {}}
                whileTap={!isDrawing ? { scale: 0.95 } : {}}
                animate={isHit ? { scale: [1, 1.2, 1] } : {}}
              >
                {isSelected || isDrawn ? (
                  <span className="text-lg">🌰</span>
                ) : (
                  num
                )}
                {(isSelected || isDrawn) && (
                  <span className="absolute -bottom-0.5 text-[10px] font-normal">{num}</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <motion.button
          onClick={quickPick}
          disabled={isDrawing}
          className="flex-1 py-3 px-4 bg-forest-700 hover:bg-forest-600 text-forest-200 rounded-xl font-medium transition-all disabled:opacity-50"
          whileHover={!isDrawing ? { scale: 1.02 } : {}}
          whileTap={!isDrawing ? { scale: 0.98 } : {}}
        >
          Quick Pick (5)
        </motion.button>
        <motion.button
          onClick={clearSelection}
          disabled={isDrawing}
          className="py-3 px-6 bg-forest-800 hover:bg-forest-700 text-forest-400 rounded-xl font-medium transition-all disabled:opacity-50 border border-forest-600"
          whileHover={!isDrawing ? { scale: 1.02 } : {}}
          whileTap={!isDrawing ? { scale: 0.98 } : {}}
        >
          Clear
        </motion.button>
        <motion.button
          onClick={draw}
          disabled={selectedNumbers.size === 0 || isDrawing || balance < betAmount}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-lg transition-all ${
            selectedNumbers.size > 0 && !isDrawing && balance >= betAmount
              ? 'bg-gradient-to-r from-amber-500 to-gold-500 text-forest-900 shadow-lg shadow-amber-500/30'
              : 'bg-forest-700 text-forest-500 cursor-not-allowed'
          }`}
          whileHover={selectedNumbers.size > 0 && !isDrawing ? { scale: 1.02 } : {}}
          whileTap={selectedNumbers.size > 0 && !isDrawing ? { scale: 0.98 } : {}}
        >
          {isDrawing ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                🍂
              </motion.span>
              Drawing...
            </span>
          ) : (
            `DRAW (${selectedNumbers.size}/${maxPicks})`
          )}
        </motion.button>
      </div>

      {/* Info Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Payout Table */}
        <div className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50">
          <h3 className="font-bold text-forest-300 mb-3 text-sm">
            Payouts ({selectedNumbers.size || '-'} picks)
          </h3>
          {selectedNumbers.size > 0 ? (
            <div className="space-y-1">
              {Object.entries(currentPayoutTable).map(([hits, mult]) => (
                <div key={hits} className="flex justify-between text-sm">
                  <span className="text-forest-400">{hits} hits</span>
                  <span className="text-gold-400 font-medium">{mult}x ({Math.floor(betAmount * mult)})</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-forest-500 text-sm">Select 1-5 acorns</p>
          )}
        </div>

        {/* Result */}
        <div className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50">
          <h3 className="font-bold text-forest-300 mb-3 text-sm">Result</h3>
          <AnimatePresence mode="wait">
            {lastResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-center p-3 rounded-lg ${
                  lastResult.payout > 0
                    ? 'bg-green-500/20 border border-green-500'
                    : 'bg-red-500/20 border border-red-500'
                }`}
              >
                <div className="text-2xl font-bold mb-1">
                  {lastResult.hits}/{selectedNumbers.size} Hits!
                </div>
                <div className={`font-medium ${lastResult.payout > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {lastResult.payout > 0 ? `+${lastResult.payout} $TREE` : 'No win'}
                </div>
              </motion.div>
            ) : isDrawing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-3"
              >
                <div className="text-2xl mb-1">🍂</div>
                <div className="text-forest-400">{revealedCount}/{drawCount} revealed</div>
              </motion.div>
            ) : (
              <div className="text-center p-3 text-forest-500">
                <div className="text-2xl mb-1">🌰</div>
                <div>Pick and draw!</div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
