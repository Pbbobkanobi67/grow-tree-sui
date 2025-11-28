'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { formatSui, formatAddress } from '@/lib/constants';

interface WinnerCelebrationProps {
  isVisible: boolean;
  prizePool: bigint;
  winnerAddress: string;
  winnerContribution: bigint;
  totalContributions: bigint;
  onClose: () => void;
}

// Confetti particle
function Confetti({ delay, x }: { delay: number; x: number }) {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const rotation = Math.random() * 360;
  const size = 8 + Math.random() * 8;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: -20,
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: 2,
      }}
      initial={{ y: -20, rotate: 0, opacity: 1 }}
      animate={{
        y: ['0vh', '100vh'],
        rotate: [rotation, rotation + 360 * 3],
        opacity: [1, 1, 0],
        x: [0, (Math.random() - 0.5) * 100],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        ease: 'easeIn',
      }}
    />
  );
}

export function WinnerCelebration({ isVisible, prizePool, winnerAddress, winnerContribution, totalContributions, onClose }: WinnerCelebrationProps) {
  const [confetti, setConfetti] = useState<{ id: number; delay: number; x: number }[]>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate confetti
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.5,
        x: Math.random() * 100,
      }));
      setConfetti(particles);

      // Add more confetti waves
      const interval = setInterval(() => {
        setConfetti(prev => [
          ...prev,
          ...Array.from({ length: 20 }, (_, i) => ({
            id: Date.now() + i,
            delay: 0,
            x: Math.random() * 100,
          })),
        ]);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Prize distribution: 40% winner (25% guaranteed + 15% weighted by contribution)
  const guaranteedPrize = (prizePool * BigInt(25)) / BigInt(100);
  const weightedPool = (prizePool * BigInt(15)) / BigInt(100);
  const contributionRatio = totalContributions > BigInt(0)
    ? Number(winnerContribution * BigInt(10000) / totalContributions) / 10000
    : 0;
  const weightedPrize = BigInt(Math.floor(Number(weightedPool) * contributionRatio));
  const winnerPrize = guaranteedPrize + weightedPrize;
  const topContributorPrize = (prizePool * BigInt(15)) / BigInt(100);
  const randomPlayerPrize = (prizePool * BigInt(5)) / BigInt(100);
  const nextRoundSeed = (prizePool * BigInt(20)) / BigInt(100);
  const treasuryAmount = (prizePool * BigInt(10)) / BigInt(100);
  const devAmount = (prizePool * BigInt(10)) / BigInt(100);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((c) => (
              <Confetti key={c.id} delay={c.delay} x={c.x} />
            ))}
          </div>

          {/* Modal */}
          <motion.div
            className="relative bg-gradient-to-b from-forest-800 to-forest-900 rounded-3xl p-8 max-w-md mx-4 border-2 border-gold-500 shadow-2xl shadow-gold-500/30"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            {/* Trophy Icon */}
            <motion.div
              className="text-8xl text-center mb-4"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
            >
              🏆
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-4xl font-bold text-center text-gold-400 mb-2"
              animate={{
                textShadow: [
                  '0 0 20px rgba(255, 215, 0, 0.5)',
                  '0 0 40px rgba(255, 215, 0, 0.8)',
                  '0 0 20px rgba(255, 215, 0, 0.5)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              TREE COMPLETE!
            </motion.h2>

            <p className="text-center text-forest-300 mb-6">
              The tree has reached its full potential!
            </p>

            {/* Prize Info */}
            <div className="bg-forest-900/50 rounded-xl p-4 mb-6 border border-gold-500/30">
              <div className="text-center mb-4">
                <div className="text-sm text-forest-400">Total Prize Pool</div>
                <div className="text-3xl font-bold text-gold-400">{formatSui(prizePool)}</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-t border-forest-700">
                  <span className="text-gold-400 flex items-center gap-2">
                    <span>🏆</span> Final Waterer (40%)
                  </span>
                  <span className="text-white font-bold">{formatSui(winnerPrize)}</span>
                </div>
                <div className="flex justify-between items-center text-forest-400 text-xs">
                  <span>25% guaranteed + {Math.round(contributionRatio * 100)}% of 15% bonus</span>
                </div>
                <div className="flex justify-between items-center text-forest-400">
                  <span>Winner</span>
                  <span className="font-mono">{formatAddress(winnerAddress)}</span>
                </div>
              </div>
            </div>

            {/* Prize Distribution */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
              <div className="bg-forest-900/30 rounded-lg p-2 text-center">
                <div className="text-orange-400">👑 Top Contributor</div>
                <div className="text-forest-300">15%</div>
                <div className="text-forest-500">{formatSui(topContributorPrize)}</div>
              </div>
              <div className="bg-forest-900/30 rounded-lg p-2 text-center">
                <div className="text-purple-400">🎲 Random Player</div>
                <div className="text-forest-300">5%</div>
                <div className="text-forest-500">{formatSui(randomPlayerPrize)}</div>
              </div>
              <div className="bg-forest-900/30 rounded-lg p-2 text-center">
                <div className="text-blue-400">🌱 Next Round</div>
                <div className="text-forest-300">20%</div>
                <div className="text-forest-500">{formatSui(nextRoundSeed)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
              <div className="bg-forest-900/30 rounded-lg p-2 text-center">
                <div className="text-green-400">🏦 Treasury</div>
                <div className="text-forest-300">10%</div>
                <div className="text-forest-500">{formatSui(treasuryAmount)}</div>
              </div>
              <div className="bg-forest-900/30 rounded-lg p-2 text-center">
                <div className="text-cyan-400">📢 Dev & Ads</div>
                <div className="text-forest-300">10%</div>
                <div className="text-forest-500">{formatSui(devAmount)}</div>
              </div>
            </div>

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-gold-500 to-amber-500 text-black font-bold rounded-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start New Round!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
