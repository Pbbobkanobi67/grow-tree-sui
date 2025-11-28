'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { formatAddress } from '@/lib/constants';

interface FeedItem {
  id: string;
  address: string;
  tier: 'drip' | 'splash' | 'flood';
  progress: number;
  timestamp: number;
}

const TIER_CONFIG = {
  drip: { icon: '💧', color: 'text-blue-400', label: 'Drip' },
  splash: { icon: '🌊', color: 'text-cyan-400', label: 'Splash' },
  flood: { icon: '🌀', color: 'text-teal-400', label: 'Flood' },
};

// Dev wallet addresses (must match DevWalletSelector)
const DEV_WALLETS = [
  '0xdev1111111111111111111111111111111111111111111111111111111111111111',
  '0xdev2222222222222222222222222222222222222222222222222222222222222222',
  '0xdev3333333333333333333333333333333333333333333333333333333333333333',
  '0xdev4444444444444444444444444444444444444444444444444444444444444444',
  '0xdev5555555555555555555555555555555555555555555555555555555555555555',
  '0xdev6666666666666666666666666666666666666666666666666666666666666666',
];

// Mock feed data generator using dev wallets
function generateMockFeedItem(): FeedItem {
  const tiers: ('drip' | 'splash' | 'flood')[] = ['drip', 'drip', 'drip', 'splash', 'splash', 'flood'];
  const tier = tiers[Math.floor(Math.random() * tiers.length)];
  const progressRanges = { drip: [1, 2], splash: [3, 5], flood: [6, 10] };
  const [min, max] = progressRanges[tier];
  const address = DEV_WALLETS[Math.floor(Math.random() * DEV_WALLETS.length)];

  return {
    id: Math.random().toString(36).substr(2, 9),
    address,
    tier,
    progress: min + Math.floor(Math.random() * (max - min + 1)),
    timestamp: Date.now(),
  };
}

export function LiveFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  // Simulate incoming events (replace with real subscription later)
  useEffect(() => {
    if (isPaused) return;

    // Add initial items
    const initial = Array.from({ length: 3 }, generateMockFeedItem);
    setFeedItems(initial);

    // Add new items periodically (simulating real activity)
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 2 seconds
        setFeedItems((prev) => {
          const newItem = generateMockFeedItem();
          return [newItem, ...prev].slice(0, 10); // Keep last 10
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="bg-forest-800/50 rounded-2xl p-4 border border-forest-600/50 card-glow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm text-forest-300 flex items-center gap-2">
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-green-400 rounded-full"
          />
          Live Feed
        </h3>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="text-xs text-forest-500 hover:text-forest-300"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {feedItems.map((item) => {
            const tierConfig = TIER_CONFIG[item.tier];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-forest-900/30"
              >
                <div className="flex items-center gap-2">
                  <span>{tierConfig.icon}</span>
                  <span className="text-forest-400">{formatAddress(item.address)}</span>
                </div>
                <span className={`font-medium ${tierConfig.color}`}>
                  +{item.progress}%
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {feedItems.length === 0 && (
          <div className="text-center text-forest-500 text-xs py-4">
            Waiting for waterings...
          </div>
        )}
      </div>
    </div>
  );
}
