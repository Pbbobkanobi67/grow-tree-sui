'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { useState } from 'react';
import { motion } from 'framer-motion';

export function FaucetButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const account = useCurrentAccount();

  const requestSui = async () => {
    if (!account) {
      setMessage('Connect wallet first');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('https://faucet.testnet.sui.io/v1/gas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FixedAmountRequest: {
            recipient: account.address,
          },
        }),
      });

      if (response.ok) {
        setMessage('Success! 1 SUI sent to your wallet');
      } else {
        const data = await response.json().catch(() => ({}));
        if (response.status === 429) {
          setMessage('Rate limited - try again in a few minutes');
        } else {
          setMessage(data.error || 'Faucet request failed');
        }
      }
    } catch (error) {
      console.error('Faucet error:', error);
      setMessage('Network error - check console');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={requestSui}
        disabled={isLoading || !account}
        className={`
          px-6 py-2 rounded-full font-medium text-sm
          bg-forest-700 text-forest-200 border border-forest-600
          hover:bg-forest-600 hover:border-forest-500
          transition-all
          ${(isLoading || !account) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        whileHover={!isLoading && account ? { scale: 1.05 } : {}}
        whileTap={!isLoading && account ? { scale: 0.95 } : {}}
      >
        {isLoading ? 'Requesting...' : 'Get Testnet SUI'}
      </motion.button>
      {message && (
        <p className={`text-xs ${message.includes('Success') ? 'text-forest-300' : 'text-gold-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
