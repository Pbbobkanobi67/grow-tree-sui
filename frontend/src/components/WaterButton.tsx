'use client';

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CONTRACT_CONFIG, formatSui } from '@/lib/constants';

interface WaterButtonProps {
  waterCost: bigint;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function WaterButton({ waterCost, disabled, onSuccess }: WaterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const handleWater = async () => {
    if (!account) return;
    setIsLoading(true);

    try {
      const coins = await client.getCoins({
        owner: account.address,
        coinType: '0x2::sui::SUI',
      });

      const suitableCoin = coins.data.find(
        (coin) => BigInt(coin.balance) >= waterCost
      );

      if (!suitableCoin) {
        alert('Insufficient balance. Need at least ' + formatSui(waterCost));
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
      onSuccess?.();
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = disabled || isLoading || !account;

  // Generate water droplets
  const droplets = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: -30 + Math.random() * 60,
    delay: i * 0.15,
    duration: 0.8 + Math.random() * 0.4,
    size: 6 + Math.random() * 6,
  }));

  return (
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
          btn-gradient shimmer
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
              💧
            </motion.span>
            Watering...
          </span>
        ) : (
          `Water Tree (${formatSui(waterCost)})`
        )}
      </motion.button>
    </div>
  );
}
