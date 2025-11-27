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
        target: ${CONTRACT_CONFIG.PACKAGE_ID}::tree_game::water_tree_exact,
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

  return (
    <motion.button
      onClick={handleWater}
      disabled={disabled || isLoading || !account}
      className={px-8 py-4 rounded-2xl font-bold text-lg transition-all }
      whileHover={!disabled && account ? { scale: 1.05 } : {}}
      whileTap={!disabled && account ? { scale: 0.95 } : {}}
    >
      {isLoading ? 'ðŸ’§ Watering...' : ðŸ’§ Water Tree ()}
    </motion.button>
  );
}
