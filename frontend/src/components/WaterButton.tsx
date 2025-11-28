'use client';

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONTRACT_CONFIG, formatSui } from '@/lib/constants';
import { DEV_MODE, mockWaterTree, getMockBalance } from '@/lib/devMode';
import { useDevWallet } from './DevWalletSelector';

// Tier definitions
const TIERS = {
  drip: {
    name: 'Drip',
    cost: BigInt(50000000), // 0.05 SUI
    progress: '1-2%',
    description: 'Best value!',
    color: 'from-blue-400 to-blue-500',
    icon: '💧',
  },
  splash: {
    name: 'Splash',
    cost: BigInt(250000000), // 0.25 SUI
    progress: '3-5%',
    description: 'Medium risk',
    color: 'from-blue-500 to-cyan-400',
    icon: '🌊',
  },
  flood: {
    name: 'Flood',
    cost: BigInt(1000000000), // 1 SUI
    progress: '6-10%',
    description: 'High roller',
    color: 'from-cyan-400 to-teal-400',
    icon: '🌀',
  },
} as const;

type TierKey = keyof typeof TIERS;

interface WaterButtonProps {
  waterCost: bigint;
  disabled?: boolean;
  onSuccess?: () => void;
  phase?: number;
}

export function WaterButton({ waterCost, disabled, onSuccess, phase = 1 }: WaterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TierKey>('drip');
  const [lastProgress, setLastProgress] = useState<number | null>(null);

  // Real wallet hooks (only used when not in DEV_MODE)
  const realAccount = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  // Dev wallet hook
  const { selectedWallet: devWallet, refreshBalance } = useDevWallet();

  // Use appropriate account based on mode
  const activeAddress = DEV_MODE ? devWallet?.address : realAccount?.address;

  // Determine which tiers are unlocked based on phase
  const unlockedTiers: TierKey[] = phase === 1
    ? ['drip']
    : phase === 2
    ? ['drip', 'splash']
    : ['drip', 'splash', 'flood'];

  const currentTier = TIERS[selectedTier];

  const handleWater = async () => {
    if (!activeAddress) return;
    setIsLoading(true);
    setLastProgress(null);

    try {
      if (DEV_MODE) {
        // DEV MODE: Use mock transaction
        const balance = getMockBalance(activeAddress);

        if (balance < currentTier.cost) {
          alert('Insufficient balance. Need at least ' + formatSui(currentTier.cost) + '. Click +1K in header to add funds!');
          return;
        }

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Execute mock transaction
        const result = mockWaterTree(activeAddress, selectedTier);
        setLastProgress(result.progress);

        // Refresh dev wallet balance
        refreshBalance();
      } else {
        // REAL MODE: Use blockchain transaction
        const coins = await client.getCoins({
          owner: activeAddress,
          coinType: '0x2::sui::SUI',
        });

        const suitableCoin = coins.data.find(
          (coin) => BigInt(coin.balance) >= currentTier.cost
        );

        if (!suitableCoin) {
          alert('Insufficient balance. Need at least ' + formatSui(currentTier.cost));
          return;
        }

        const tx = new Transaction();
        tx.moveCall({
          target: `${CONTRACT_CONFIG.PACKAGE_ID}::tree_game::water_tree_exact`,
          arguments: [
            tx.object(CONTRACT_CONFIG.TREE_GAME_ID),
            tx.object(CONTRACT_CONFIG.GAME_CONFIG_ID),
            tx.object(suitableCoin.coinObjectId),
          ],
        });

        await signAndExecute({ transaction: tx });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = disabled || isLoading || !activeAddress;

  // Generate water droplets
  const droplets = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: -30 + Math.random() * 60,
    delay: i * 0.15,
    duration: 0.8 + Math.random() * 0.4,
    size: 6 + Math.random() * 6,
  }));

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Tier Selection */}
      <div className="flex gap-2 w-full max-w-md">
        {(['drip', 'splash', 'flood'] as TierKey[]).map((tierKey) => {
          const tier = TIERS[tierKey];
          const isUnlocked = unlockedTiers.includes(tierKey);
          const isSelected = selectedTier === tierKey;

          return (
            <motion.button
              key={tierKey}
              onClick={() => isUnlocked && setSelectedTier(tierKey)}
              disabled={!isUnlocked}
              className={`
                flex-1 p-3 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'border-forest-300 bg-forest-700/50'
                  : isUnlocked
                  ? 'border-forest-600/50 bg-forest-800/30 hover:border-forest-500'
                  : 'border-forest-700/30 bg-forest-900/30 opacity-50 cursor-not-allowed'
                }
              `}
              whileHover={isUnlocked ? { scale: 1.02 } : {}}
              whileTap={isUnlocked ? { scale: 0.98 } : {}}
            >
              <div className="text-2xl mb-1">{tier.icon}</div>
              <div className={`font-bold text-sm ${isSelected ? 'text-forest-200' : 'text-forest-400'}`}>
                {tier.name}
              </div>
              <div className="text-xs text-forest-500">{formatSui(tier.cost)}</div>
              <div className={`text-xs mt-1 ${isSelected ? 'text-blue-400' : 'text-forest-500'}`}>
                +{tier.progress}
              </div>
              {!isUnlocked && (
                <div className="text-xs text-forest-600 mt-1">Phase {tierKey === 'splash' ? '2+' : '3+'}</div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Last Progress Result */}
      <AnimatePresence>
        {lastProgress !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-green-400 font-bold text-lg"
          >
            +{lastProgress}% Progress!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Water Button */}
      <div className="relative">
        {/* Water droplets animation */}
        {isLoading && (
          <div className="absolute inset-0 overflow-visible pointer-events-none">
            {droplets.map((drop) => (
              <motion.div
                key={drop.id}
                className="absolute left-1/2 rounded-full bg-blue-400"
                style={{
                  width: drop.size,
                  height: drop.size * 1.3,
                  marginLeft: drop.x,
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                }}
                initial={{ top: -20, opacity: 0.8 }}
                animate={{
                  top: ['-20px', '80px'],
                  opacity: [0.8, 0.6, 0],
                  scale: [1, 0.8],
                }}
                transition={{
                  duration: drop.duration,
                  delay: drop.delay,
                  repeat: Infinity,
                  ease: 'easeIn',
                }}
              />
            ))}
          </div>
        )}

        <motion.button
          onClick={handleWater}
          disabled={isDisabled}
          className={`
            relative px-10 py-4 rounded-full font-bold text-lg text-forest-900
            bg-gradient-to-r ${currentTier.color} shimmer
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          whileHover={!isDisabled ? { scale: 1.05 } : {}}
          whileTap={!isDisabled ? { scale: 0.95 } : {}}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                {currentTier.icon}
              </motion.span>
              Watering...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {currentTier.icon} {currentTier.name} ({formatSui(currentTier.cost)})
            </span>
          )}
        </motion.button>
      </div>

      {/* Tier description */}
      <p className="text-xs text-forest-500">
        {currentTier.description} • +{currentTier.progress} progress
        {phase === 4 && <span className="text-gold-400 ml-2">Final stretch!</span>}
      </p>

      {/* Phase unlock explanation */}
      {phase < 3 && (
        <div className="mt-3 p-3 bg-forest-900/50 rounded-xl border border-forest-700/50 text-xs">
          <div className="text-forest-400 mb-1">Higher tiers unlock as the tree grows:</div>
          <div className="flex gap-4 text-forest-500">
            <span className={phase >= 1 ? 'text-forest-300' : ''}>
              Phase 1: Drip {phase >= 1 && '✓'}
            </span>
            <span className={phase >= 2 ? 'text-forest-300' : ''}>
              Phase 2: +Splash {phase >= 2 && '✓'}
            </span>
            <span className={phase >= 3 ? 'text-forest-300' : ''}>
              Phase 3: +Flood
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
